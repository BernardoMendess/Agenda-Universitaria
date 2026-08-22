import {
  Tarefa,
  CriarTarefaDTO,
  AtualizarTarefaDTO,
} from '../../modelos/Tarefa';

/**
 * Interface que define as operações de persistência para Tarefas.
 * Segue o Princípio da Inversão de Dependência e Segregação de Interfaces (SOLID).
 */
export interface ITarefaRepositorio {
  criar(dados: CriarTarefaDTO): Promise<Tarefa>;
  buscarPorId(id: string): Promise<Tarefa | null>;
  atualizar(id: string, dados: AtualizarTarefaDTO): Promise<Tarefa>;
  alternarConclusao(id: string): Promise<Tarefa>;
  marcarConcluida(id: string, concluida: boolean): Promise<Tarefa>;
  excluir(id: string): Promise<boolean>;
  listarTodas(): Promise<Tarefa[]>;
  listarPorDisciplina(disciplinaId: string): Promise<Tarefa[]>;
  listarAvulsas(): Promise<Tarefa[]>;
  excluirPorDisciplina(disciplinaId: string): Promise<number>;
  restaurarEmLote(tarefas: Tarefa[]): Promise<Tarefa[]>;
  limpar(): void;
}

/**
 * Implementação em memória / local para suporte Offline-First e testes unitários.
 */
export class TarefaRepositorioEmMemoria implements ITarefaRepositorio {
  private tarefas: Map<string, Tarefa> = new Map();

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

    this.tarefas.set(id, novaTarefa);
    return { ...novaTarefa };
  }

  async buscarPorId(id: string): Promise<Tarefa | null> {
    const tarefa = this.tarefas.get(id);
    return tarefa ? { ...tarefa } : null;
  }

  async atualizar(id: string, dados: AtualizarTarefaDTO): Promise<Tarefa> {
    const existente = this.tarefas.get(id);
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

    this.tarefas.set(id, atualizada);
    return { ...atualizada };
  }

  async alternarConclusao(id: string): Promise<Tarefa> {
    const existente = this.tarefas.get(id);
    if (!existente) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }

    const novoStatus = !existente.concluida;
    return this.atualizar(id, { concluida: novoStatus });
  }

  async marcarConcluida(id: string, concluida: boolean): Promise<Tarefa> {
    return this.atualizar(id, { concluida });
  }

  async excluir(id: string): Promise<boolean> {
    return this.tarefas.delete(id);
  }

  async listarTodas(): Promise<Tarefa[]> {
    return Array.from(this.tarefas.values())
      .map((t) => ({ ...t }))
      .sort((a, b) => {
        // Tarefas pendentes primeiro
        if (a.concluida !== b.concluida) {
          return a.concluida ? 1 : -1;
        }
        // Com data limite antes das sem data limite
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

  async listarPorDisciplina(disciplinaId: string): Promise<Tarefa[]> {
    const todas = await this.listarTodas();
    return todas.filter((t) => t.disciplinaId === disciplinaId);
  }

  async listarAvulsas(): Promise<Tarefa[]> {
    const todas = await this.listarTodas();
    return todas.filter((t) => !t.disciplinaId);
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    let removidas = 0;
    for (const [id, tarefa] of this.tarefas.entries()) {
      if (tarefa.disciplinaId === disciplinaId) {
        this.tarefas.delete(id);
        removidas++;
      }
    }
    return removidas;
  }

  async restaurarEmLote(tarefas: Tarefa[]): Promise<Tarefa[]> {
    for (const t of tarefas) {
      this.tarefas.set(t.id, { ...t });
    }
    return Array.from(this.tarefas.values()).map((t) => ({ ...t }));
  }

  limpar(): void {
    this.tarefas.clear();
  }
}

// Instância singleton do repositório
export const tarefaRepositorio = new TarefaRepositorioEmMemoria();
