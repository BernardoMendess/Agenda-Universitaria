import {
  HorarioAula,
  CriarHorarioAulaDTO,
  AtualizarHorarioAulaDTO,
  DiaSemana,
} from '../../../modelos/HorarioAula';
import { IHorarioAulaRepositorio } from '../HorarioAulaRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface HorarioAulaRow {
  id: string;
  disciplina_id: string;
  dia_semana: string;
  horario_inicio: string;
  horario_fim: string;
  local_sala: string | null;
}

export class HorarioAulaRepositorioSQLite implements IHorarioAulaRepositorio {
  private fallbackEmMemoria: Map<string, HorarioAula> = new Map();

  private rowParaHorario(row: HorarioAulaRow): HorarioAula {
    return {
      id: row.id,
      disciplinaId: row.disciplina_id,
      diaSemana: row.dia_semana as DiaSemana,
      horarioInicio: row.horario_inicio,
      horarioFim: row.horario_fim,
      localSala: row.local_sala || undefined,
    };
  }

  async criar(dados: CriarHorarioAulaDTO): Promise<HorarioAula> {
    const id = `hor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const novoHorario: HorarioAula = {
      id,
      disciplinaId: dados.disciplinaId,
      diaSemana: dados.diaSemana,
      horarioInicio: dados.horarioInicio.trim(),
      horarioFim: dados.horarioFim.trim(),
      localSala: dados.localSala?.trim() || undefined,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT INTO ${TABELAS_SQLITE.HORARIOS_AULA} (
          id, disciplina_id, dia_semana, horario_inicio, horario_fim, local_sala
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          novoHorario.id,
          novoHorario.disciplinaId,
          novoHorario.diaSemana,
          novoHorario.horarioInicio,
          novoHorario.horarioFim,
          novoHorario.localSala ?? null,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, novoHorario);
    }

    return { ...novoHorario };
  }

  async buscarPorId(id: string): Promise<HorarioAula | null> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<HorarioAulaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.HORARIOS_AULA} WHERE id = ?`,
        [id]
      );
      return row ? this.rowParaHorario(row) : null;
    }
    const horario = this.fallbackEmMemoria.get(id);
    return horario ? { ...horario } : null;
  }

  async listarPorDisciplina(disciplinaId: string): Promise<HorarioAula[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<HorarioAulaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.HORARIOS_AULA} WHERE disciplina_id = ? ORDER BY horario_inicio ASC`,
        [disciplinaId]
      );
      return rows.map((r) => this.rowParaHorario(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .filter((h) => h.disciplinaId === disciplinaId)
      .map((h) => ({ ...h }))
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }

  async listarTodos(): Promise<HorarioAula[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<HorarioAulaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.HORARIOS_AULA} ORDER BY horario_inicio ASC`
      );
      return rows.map((r) => this.rowParaHorario(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .map((h) => ({ ...h }))
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }

  async listarPorDia(diaSemana: DiaSemana): Promise<HorarioAula[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<HorarioAulaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.HORARIOS_AULA} WHERE dia_semana = ? ORDER BY horario_inicio ASC`,
        [diaSemana]
      );
      return rows.map((r) => this.rowParaHorario(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .filter((h) => h.diaSemana === diaSemana)
      .map((h) => ({ ...h }))
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }

  async atualizar(id: string, dados: AtualizarHorarioAulaDTO): Promise<HorarioAula> {
    const existente = await this.buscarPorId(id);
    if (!existente) {
      throw new Error(`Horário com ID ${id} não encontrado.`);
    }

    const atualizado: HorarioAula = {
      ...existente,
      diaSemana: dados.diaSemana || existente.diaSemana,
      horarioInicio: dados.horarioInicio !== undefined ? dados.horarioInicio.trim() : existente.horarioInicio,
      horarioFim: dados.horarioFim !== undefined ? dados.horarioFim.trim() : existente.horarioFim,
      localSala: dados.localSala !== undefined ? (dados.localSala.trim() || undefined) : existente.localSala,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `UPDATE ${TABELAS_SQLITE.HORARIOS_AULA} SET
          dia_semana = ?, horario_inicio = ?, horario_fim = ?, local_sala = ?
        WHERE id = ?`,
        [
          atualizado.diaSemana,
          atualizado.horarioInicio,
          atualizado.horarioFim,
          atualizado.localSala ?? null,
          id,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, atualizado);
    }

    return { ...atualizado };
  }

  async excluir(id: string): Promise<boolean> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.HORARIOS_AULA} WHERE id = ?`,
        [id]
      );
      return res.changes > 0;
    }
    return this.fallbackEmMemoria.delete(id);
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.HORARIOS_AULA} WHERE disciplina_id = ?`,
        [disciplinaId]
      );
      return res.changes;
    }
    let removidos = 0;
    for (const [id, horario] of this.fallbackEmMemoria.entries()) {
      if (horario.disciplinaId === disciplinaId) {
        this.fallbackEmMemoria.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async substituirHorariosDisciplina(
    disciplinaId: string,
    novosHorarios: Omit<CriarHorarioAulaDTO, 'disciplinaId'>[]
  ): Promise<HorarioAula[]> {
    await this.excluirPorDisciplina(disciplinaId);
    const criados: HorarioAula[] = [];
    for (const item of novosHorarios) {
      const criado = await this.criar({ ...item, disciplinaId });
      criados.push(criado);
    }
    return criados;
  }

  async restaurarEmLote(horarios: HorarioAula[]): Promise<HorarioAula[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      for (const h of horarios) {
        db.runSync(
          `INSERT OR REPLACE INTO ${TABELAS_SQLITE.HORARIOS_AULA} (
            id, disciplina_id, dia_semana, horario_inicio, horario_fim, local_sala
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            h.id,
            h.disciplinaId,
            h.diaSemana,
            h.horarioInicio,
            h.horarioFim,
            h.localSala ?? null,
          ]
        );
      }
      return this.listarTodos();
    }
    for (const h of horarios) {
      this.fallbackEmMemoria.set(h.id, { ...h });
    }
    return Array.from(this.fallbackEmMemoria.values()).map((h) => ({ ...h }));
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.HORARIOS_AULA}`);
    }
    this.fallbackEmMemoria.clear();
  }
}
