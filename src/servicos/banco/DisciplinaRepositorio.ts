import { Disciplina, CriarDisciplinaDTO, AtualizarDisciplinaDTO } from '../../modelos/Disciplina';

/**
 * Interface que define as operações de persistência de Disciplinas.
 * Segue o Princípio da Segregação de Interfaces e Inversão de Dependência (SOLID).
 */
export interface IDisciplinaRepositorio {
  criar(dados: CriarDisciplinaDTO): Promise<Disciplina>;
  buscarPorId(id: string): Promise<Disciplina | null>;
  listarTodas(): Promise<Disciplina[]>;
  atualizar(id: string, dados: AtualizarDisciplinaDTO): Promise<Disciplina>;
  excluir(id: string): Promise<boolean>;
}

/**
 * Implementação em memória / local para suporte Offline-First e testes unitários.
 */
export class DisciplinaRepositorioEmMemoria implements IDisciplinaRepositorio {
  private disciplinas: Map<string, Disciplina> = new Map();

  async criar(dados: CriarDisciplinaDTO): Promise<Disciplina> {
    const agora = new Date().toISOString();
    const id = `disc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const novaDisciplina: Disciplina = {
      id,
      nome: dados.nome.trim(),
      codigo: dados.codigo?.trim() || undefined,
      nomeProfessor: dados.nomeProfessor?.trim() || undefined,
      contatoProfessor: dados.contatoProfessor?.trim() || undefined,
      localSala: dados.localSala?.trim() || undefined,
      anotacoes: dados.anotacoes?.trim() || undefined,
      corIdentificacao: dados.corIdentificacao || '#6366f1',
      limiteMaximoFaltas: Math.max(0, Math.floor(dados.limiteMaximoFaltas)),
      criterioAprovacao: dados.criterioAprovacao,
      dataCriacao: agora,
      dataAtualizacao: agora,
    };

    this.disciplinas.set(id, novaDisciplina);
    return { ...novaDisciplina };
  }

  async buscarPorId(id: string): Promise<Disciplina | null> {
    const disciplina = this.disciplinas.get(id);
    return disciplina ? { ...disciplina } : null;
  }

  async listarTodas(): Promise<Disciplina[]> {
    return Array.from(this.disciplinas.values())
      .map(d => ({ ...d }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async atualizar(id: string, dados: AtualizarDisciplinaDTO): Promise<Disciplina> {
    const existente = this.disciplinas.get(id);
    if (!existente) {
      throw new Error(`Disciplina com ID ${id} não encontrada.`);
    }

    const agora = new Date().toISOString();
    const atualizada: Disciplina = {
      ...existente,
      nome: dados.nome !== undefined ? dados.nome.trim() : existente.nome,
      codigo: dados.codigo !== undefined ? (dados.codigo.trim() || undefined) : existente.codigo,
      nomeProfessor: dados.nomeProfessor !== undefined ? (dados.nomeProfessor.trim() || undefined) : existente.nomeProfessor,
      contatoProfessor: dados.contatoProfessor !== undefined ? (dados.contatoProfessor.trim() || undefined) : existente.contatoProfessor,
      localSala: dados.localSala !== undefined ? (dados.localSala.trim() || undefined) : existente.localSala,
      anotacoes: dados.anotacoes !== undefined ? (dados.anotacoes.trim() || undefined) : existente.anotacoes,
      corIdentificacao: dados.corIdentificacao !== undefined ? dados.corIdentificacao : existente.corIdentificacao,
      limiteMaximoFaltas: dados.limiteMaximoFaltas !== undefined ? Math.max(0, Math.floor(dados.limiteMaximoFaltas)) : existente.limiteMaximoFaltas,
      criterioAprovacao: dados.criterioAprovacao !== undefined ? dados.criterioAprovacao : existente.criterioAprovacao,
      dataAtualizacao: agora,
    };

    this.disciplinas.set(id, atualizada);
    return { ...atualizada };
  }

  async excluir(id: string): Promise<boolean> {
    return this.disciplinas.delete(id);
  }

  /**
   * Método para limpeza de estado em testes
   */
  limpar(): void {
    this.disciplinas.clear();
  }
}

// Instância singleton do repositório
export const disciplinaRepositorio = new DisciplinaRepositorioEmMemoria();
