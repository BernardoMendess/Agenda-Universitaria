import {
  EventoAcademico,
  CriarEventoAcademicoDTO,
  AtualizarEventoAcademicoDTO,
} from '../../../modelos/EventoAcademico';
import { IEventoAcademicoRepositorio } from '../EventoAcademicoRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface EventoAcademicoRow {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  horario_inicio: string | null;
  horario_fim: string | null;
  disciplina_id: string | null;
  local: string | null;
  cor: string | null;
  data_criacao: string;
  data_atualizacao: string;
}

export class EventoAcademicoRepositorioSQLite implements IEventoAcademicoRepositorio {
  private fallbackEmMemoria: Map<string, EventoAcademico> = new Map();

  private rowParaEvento(row: EventoAcademicoRow): EventoAcademico {
    return {
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao || undefined,
      data: row.data,
      horarioInicio: row.horario_inicio || undefined,
      horarioFim: row.horario_fim || undefined,
      disciplinaId: row.disciplina_id || undefined,
      local: row.local || undefined,
      cor: row.cor || undefined,
      dataCriacao: row.data_criacao,
      dataAtualizacao: row.data_atualizacao,
    };
  }

  async criar(dados: CriarEventoAcademicoDTO): Promise<EventoAcademico> {
    const agora = new Date().toISOString();
    const id = `eve_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const novoEvento: EventoAcademico = {
      id,
      titulo: dados.titulo.trim(),
      descricao: dados.descricao?.trim() || undefined,
      data: dados.data.trim(),
      horarioInicio: dados.horarioInicio?.trim() || undefined,
      horarioFim: dados.horarioFim?.trim() || undefined,
      disciplinaId: dados.disciplinaId?.trim() || undefined,
      local: dados.local?.trim() || undefined,
      cor: dados.cor?.trim() || undefined,
      dataCriacao: agora,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT INTO ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} (
          id, titulo, descricao, data, horario_inicio, horario_fim,
          disciplina_id, local, cor, data_criacao, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          novoEvento.id,
          novoEvento.titulo,
          novoEvento.descricao ?? null,
          novoEvento.data,
          novoEvento.horarioInicio ?? null,
          novoEvento.horarioFim ?? null,
          novoEvento.disciplinaId ?? null,
          novoEvento.local ?? null,
          novoEvento.cor ?? null,
          novoEvento.dataCriacao,
          novoEvento.dataAtualizacao,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, novoEvento);
    }

    return { ...novoEvento };
  }

  async buscarPorId(id: string): Promise<EventoAcademico | null> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<EventoAcademicoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} WHERE id = ?`,
        [id]
      );
      return row ? this.rowParaEvento(row) : null;
    }
    const evento = this.fallbackEmMemoria.get(id);
    return evento ? { ...evento } : null;
  }

  async atualizar(
    id: string,
    dados: AtualizarEventoAcademicoDTO
  ): Promise<EventoAcademico> {
    const existente = await this.buscarPorId(id);
    if (!existente) {
      throw new Error(`Evento acadêmico com ID ${id} não encontrado.`);
    }

    const agora = new Date().toISOString();

    const atualizado: EventoAcademico = {
      ...existente,
      titulo: dados.titulo !== undefined ? dados.titulo.trim() : existente.titulo,
      descricao:
        dados.descricao !== undefined
          ? dados.descricao === null || dados.descricao.trim() === ''
            ? undefined
            : dados.descricao.trim()
          : existente.descricao,
      data: dados.data !== undefined ? dados.data.trim() : existente.data,
      horarioInicio:
        dados.horarioInicio !== undefined
          ? dados.horarioInicio === null || dados.horarioInicio.trim() === ''
            ? undefined
            : dados.horarioInicio.trim()
          : existente.horarioInicio,
      horarioFim:
        dados.horarioFim !== undefined
          ? dados.horarioFim === null || dados.horarioFim.trim() === ''
            ? undefined
            : dados.horarioFim.trim()
          : existente.horarioFim,
      disciplinaId:
        dados.disciplinaId !== undefined
          ? dados.disciplinaId === null || dados.disciplinaId.trim() === ''
            ? undefined
            : dados.disciplinaId.trim()
          : existente.disciplinaId,
      local:
        dados.local !== undefined
          ? dados.local === null || dados.local.trim() === ''
            ? undefined
            : dados.local.trim()
          : existente.local,
      cor:
        dados.cor !== undefined
          ? dados.cor === null || dados.cor.trim() === ''
            ? undefined
            : dados.cor.trim()
          : existente.cor,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `UPDATE ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} SET
          titulo = ?, descricao = ?, data = ?, horario_inicio = ?,
          horario_fim = ?, disciplina_id = ?, local = ?, cor = ?,
          data_atualizacao = ?
        WHERE id = ?`,
        [
          atualizado.titulo,
          atualizado.descricao ?? null,
          atualizado.data,
          atualizado.horarioInicio ?? null,
          atualizado.horarioFim ?? null,
          atualizado.disciplinaId ?? null,
          atualizado.local ?? null,
          atualizado.cor ?? null,
          atualizado.dataAtualizacao,
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
        `DELETE FROM ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} WHERE id = ?`,
        [id]
      );
      return res.changes > 0;
    }
    return this.fallbackEmMemoria.delete(id);
  }

  async listarTodos(): Promise<EventoAcademico[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<EventoAcademicoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} ORDER BY data ASC, horario_inicio ASC`
      );
      return rows.map((r) => this.rowParaEvento(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .map((e) => ({ ...e }))
      .sort((a, b) => {
        const compData = a.data.localeCompare(b.data);
        if (compData !== 0) return compData;
        return (a.horarioInicio || '').localeCompare(b.horarioInicio || '');
      });
  }

  async listarPorIntervalo(
    dataInicioStr: string,
    dataFimStr: string
  ): Promise<EventoAcademico[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<EventoAcademicoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} 
         WHERE data >= ? AND data <= ? 
         ORDER BY data ASC, horario_inicio ASC`,
        [dataInicioStr, dataFimStr]
      );
      return rows.map((r) => this.rowParaEvento(r));
    }
    const todos = await this.listarTodos();
    return todos.filter(
      (e) => e.data >= dataInicioStr && e.data <= dataFimStr
    );
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} WHERE disciplina_id = ?`,
        [disciplinaId]
      );
      return res.changes;
    }
    let removidos = 0;
    for (const [id, evento] of this.fallbackEmMemoria.entries()) {
      if (evento.disciplinaId === disciplinaId) {
        this.fallbackEmMemoria.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async restaurarEmLote(eventos: EventoAcademico[]): Promise<EventoAcademico[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      for (const e of eventos) {
        db.runSync(
          `INSERT OR REPLACE INTO ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} (
            id, titulo, descricao, data, horario_inicio, horario_fim,
            disciplina_id, local, cor, data_criacao, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id,
            e.titulo,
            e.descricao ?? null,
            e.data,
            e.horarioInicio ?? null,
            e.horarioFim ?? null,
            e.disciplinaId ?? null,
            e.local ?? null,
            e.cor ?? null,
            e.dataCriacao,
            e.dataAtualizacao,
          ]
        );
      }
      return this.listarTodos();
    }
    for (const e of eventos) {
      this.fallbackEmMemoria.set(e.id, { ...e });
    }
    return Array.from(this.fallbackEmMemoria.values()).map((e) => ({ ...e }));
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.EVENTOS_ACADEMICOS}`);
    }
    this.fallbackEmMemoria.clear();
  }
}
