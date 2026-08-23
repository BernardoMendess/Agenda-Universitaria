import {
  Tarefa,
  CriarTarefaDTO,
  AtualizarTarefaDTO,
  PrioridadeTarefa,
} from '../../../modelos/Tarefa';
import { ITarefaRepositorio } from '../TarefaRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface TarefaRow {
  id: string;
  disciplina_id: string | null;
  titulo: string;
  descricao: string | null;
  concluida: number;
  data_limite: string | null;
  horario_limite: string | null;
  prioridade: string;
  data_conclusao: string | null;
  data_criacao: string;
  data_atualizacao: string;
}

export class TarefaRepositorioSQLite implements ITarefaRepositorio {
  private fallbackEmMemoria: Map<string, Tarefa> = new Map();

  private rowParaTarefa(row: TarefaRow): Tarefa {
    return {
      id: row.id,
      disciplinaId: row.disciplina_id || undefined,
      titulo: row.titulo,
      descricao: row.descricao || undefined,
      concluida: row.concluida === 1,
      dataLimite: row.data_limite || undefined,
      horarioLimite: row.horario_limite || undefined,
      prioridade: (row.prioridade as PrioridadeTarefa) || 'MEDIA',
      dataConclusao: row.data_conclusao || undefined,
      dataCriacao: row.data_criacao,
      dataAtualizacao: row.data_atualizacao,
    };
  }

  async criar(dados: CriarTarefaDTO): Promise<Tarefa> {
    const agora = new Date().toISOString();
    const id = `tar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const novaTarefa: Tarefa = {
      id,
      disciplinaId: dados.disciplinaId?.trim() || undefined,
      titulo: dados.titulo.trim(),
      descricao: dados.descricao?.trim() || undefined,
      concluida: false,
      dataLimite: dados.dataLimite?.trim() || undefined,
      horarioLimite: dados.horarioLimite?.trim() || undefined,
      prioridade: dados.prioridade || 'MEDIA',
      dataCriacao: agora,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT INTO ${TABELAS_SQLITE.TAREFAS} (
          id, disciplina_id, titulo, descricao, concluida,
          data_limite, horario_limite, prioridade, data_conclusao,
          data_criacao, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          novaTarefa.id,
          novaTarefa.disciplinaId ?? null,
          novaTarefa.titulo,
          novaTarefa.descricao ?? null,
          0,
          novaTarefa.dataLimite ?? null,
          novaTarefa.horarioLimite ?? null,
          novaTarefa.prioridade,
          null,
          novaTarefa.dataCriacao,
          novaTarefa.dataAtualizacao,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, novaTarefa);
    }

    return { ...novaTarefa };
  }

  async buscarPorId(id: string): Promise<Tarefa | null> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<TarefaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.TAREFAS} WHERE id = ?`,
        [id]
      );
      return row ? this.rowParaTarefa(row) : null;
    }
    const tarefa = this.fallbackEmMemoria.get(id);
    return tarefa ? { ...tarefa } : null;
  }

  async atualizar(id: string, dados: AtualizarTarefaDTO): Promise<Tarefa> {
    const existente = await this.buscarPorId(id);
    if (!existente) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }

    const agora = new Date().toISOString();
    let novaDataConclusao = existente.dataConclusao;

    if (dados.concluida !== undefined) {
      if (dados.concluida && !existente.concluida) {
        novaDataConclusao = agora;
      } else if (!dados.concluida && existente.concluida) {
        novaDataConclusao = undefined;
      }
    }

    const atualizada: Tarefa = {
      ...existente,
      disciplinaId: dados.disciplinaId !== undefined 
        ? (dados.disciplinaId === null || dados.disciplinaId.trim() === '' ? undefined : dados.disciplinaId.trim()) 
        : existente.disciplinaId,
      titulo: dados.titulo !== undefined ? dados.titulo.trim() : existente.titulo,
      descricao: dados.descricao !== undefined 
        ? (dados.descricao === null || dados.descricao.trim() === '' ? undefined : dados.descricao.trim()) 
        : existente.descricao,
      dataLimite: dados.dataLimite !== undefined 
        ? (dados.dataLimite === null || dados.dataLimite.trim() === '' ? undefined : dados.dataLimite.trim()) 
        : existente.dataLimite,
      horarioLimite: dados.horarioLimite !== undefined 
        ? (dados.horarioLimite === null || dados.horarioLimite.trim() === '' ? undefined : dados.horarioLimite.trim()) 
        : existente.horarioLimite,
      prioridade: dados.prioridade !== undefined ? dados.prioridade : existente.prioridade,
      concluida: dados.concluida !== undefined ? dados.concluida : existente.concluida,
      dataConclusao: novaDataConclusao,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `UPDATE ${TABELAS_SQLITE.TAREFAS} SET
          disciplina_id = ?, titulo = ?, descricao = ?, concluida = ?,
          data_limite = ?, horario_limite = ?, prioridade = ?,
          data_conclusao = ?, data_atualizacao = ?
        WHERE id = ?`,
        [
          atualizada.disciplinaId ?? null,
          atualizada.titulo,
          atualizada.descricao ?? null,
          atualizada.concluida ? 1 : 0,
          atualizada.dataLimite ?? null,
          atualizada.horarioLimite ?? null,
          atualizada.prioridade,
          atualizada.dataConclusao ?? null,
          atualizada.dataAtualizacao,
          id,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, atualizada);
    }

    return { ...atualizada };
  }

  async alternarConclusao(id: string): Promise<Tarefa> {
    const existente = await this.buscarPorId(id);
    if (!existente) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }
    return this.atualizar(id, { concluida: !existente.concluida });
  }

  async marcarConcluida(id: string, concluida: boolean): Promise<Tarefa> {
    return this.atualizar(id, { concluida });
  }

  async excluir(id: string): Promise<boolean> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(`DELETE FROM ${TABELAS_SQLITE.TAREFAS} WHERE id = ?`, [id]);
      return res.changes > 0;
    }
    return this.fallbackEmMemoria.delete(id);
  }

  async listarTodas(): Promise<Tarefa[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<TarefaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.TAREFAS}`
      );
      const tarefas = rows.map((r) => this.rowParaTarefa(r));
      return this.ordenarTarefas(tarefas);
    }
    return this.ordenarTarefas(Array.from(this.fallbackEmMemoria.values()).map((t) => ({ ...t })));
  }

  async listarPorDisciplina(disciplinaId: string): Promise<Tarefa[]> {
    const todas = await this.listarTodas();
    return todas.filter((t) => t.disciplinaId === disciplinaId);
  }

  async listarAvulsas(): Promise<Tarefa[]> {
    const todas = await this.listarTodas();
    return todas.filter((t) => !t.disciplinaId);
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.TAREFAS} WHERE disciplina_id = ?`,
        [disciplinaId]
      );
      return res.changes;
    }
    let removidas = 0;
    for (const [id, tarefa] of this.fallbackEmMemoria.entries()) {
      if (tarefa.disciplinaId === disciplinaId) {
        this.fallbackEmMemoria.delete(id);
        removidas++;
      }
    }
    return removidas;
  }

  async restaurarEmLote(tarefas: Tarefa[]): Promise<Tarefa[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      for (const t of tarefas) {
        db.runSync(
          `INSERT OR REPLACE INTO ${TABELAS_SQLITE.TAREFAS} (
            id, disciplina_id, titulo, descricao, concluida,
            data_limite, horario_limite, prioridade, data_conclusao,
            data_criacao, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.id,
            t.disciplinaId ?? null,
            t.titulo,
            t.descricao ?? null,
            t.concluida ? 1 : 0,
            t.dataLimite ?? null,
            t.horarioLimite ?? null,
            t.prioridade,
            t.dataConclusao ?? null,
            t.dataCriacao,
            t.dataAtualizacao,
          ]
        );
      }
      return this.listarTodas();
    }
    for (const t of tarefas) {
      this.fallbackEmMemoria.set(t.id, { ...t });
    }
    return Array.from(this.fallbackEmMemoria.values()).map((t) => ({ ...t }));
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.TAREFAS}`);
    }
    this.fallbackEmMemoria.clear();
  }

  private ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
    return tarefas.sort((a, b) => {
      if (a.concluida !== b.concluida) {
        return a.concluida ? 1 : -1;
      }
      if (a.dataLimite && !b.dataLimite) return -1;
      if (!a.dataLimite && b.dataLimite) return 1;
      if (a.dataLimite && b.dataLimite) {
        const compData = a.dataLimite.localeCompare(b.dataLimite);
        if (compData !== 0) return compData;
        return (a.horarioLimite || '').localeCompare(b.horarioLimite || '');
      }
      return b.dataCriacao.localeCompare(a.dataCriacao);
    });
  }
}
