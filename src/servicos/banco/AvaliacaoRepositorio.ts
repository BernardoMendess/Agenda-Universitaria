import {
  Avaliacao,
  CriarAvaliacaoDTO,
  AtualizarAvaliacaoDTO,
} from '../../modelos/Avaliacao';

/**
 * Interface de persistência de Avaliações.
 * Segue o Princípio da Inversão de Dependência e Segregação de Interfaces (SOLID).
 */
export interface IAvaliacaoRepositorio {
  criar(dados: CriarAvaliacaoDTO): Promise<Avaliacao>;
  buscarPorId(id: string): Promise<Avaliacao | null>;
  atualizar(id: string, dados: AtualizarAvaliacaoDTO): Promise<Avaliacao>;
  lancarNota(id: string, nota: number | null): Promise<Avaliacao>;
  excluir(id: string): Promise<boolean>;
  listarPorDisciplina(disciplinaId: string): Promise<Avaliacao[]>;
  listarTodas(): Promise<Avaliacao[]>;
  excluirPorDisciplina(disciplinaId: string): Promise<number>;
  restaurarEmLote(avaliacoes: Avaliacao[]): Promise<Avaliacao[]>;
  limpar(): void;
}

/**
 * Implementação em memória / local para suporte Offline-First e testes unitários.
 */
export class AvaliacaoRepositorioEmMemoria implements IAvaliacaoRepositorio {
  private avaliacoes: Map<string, Avaliacao> = new Map();

  async criar(dados: CriarAvaliacaoDTO): Promise<Avaliacao> {
    const agora = new Date().toISOString();
    const id = `aval_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const peso = dados.peso !== undefined && Number(dados.peso) > 0 ? Number(dados.peso) : 1;
    const notaMaxima = dados.notaMaxima !== undefined && Number(dados.notaMaxima) > 0 ? Number(dados.notaMaxima) : 10;

    const novaAvaliacao: Avaliacao = {
      id,
      disciplinaId: dados.disciplinaId,
      titulo: dados.titulo.trim(),
      tipo: dados.tipo,
      data: dados.data,
      horario: dados.horario?.trim() || undefined,
      peso,
      notaMaxima,
      nota: null,
      descricao: dados.descricao?.trim() || undefined,
      dataCriacao: agora,
      dataAtualizacao: agora,
    };

    this.avaliacoes.set(id, novaAvaliacao);
    return { ...novaAvaliacao };
  }

  async buscarPorId(id: string): Promise<Avaliacao | null> {
    const avaliacao = this.avaliacoes.get(id);
    return avaliacao ? { ...avaliacao } : null;
  }

  async atualizar(id: string, dados: AtualizarAvaliacaoDTO): Promise<Avaliacao> {
    const existente = this.avaliacoes.get(id);
    if (!existente) {
      throw new Error(`Avaliação com ID ${id} não encontrada.`);
    }

    const agora = new Date().toISOString();
    const atualizada: Avaliacao = {
      ...existente,
      titulo: dados.titulo !== undefined ? dados.titulo.trim() : existente.titulo,
      tipo: dados.tipo !== undefined ? dados.tipo : existente.tipo,
      data: dados.data !== undefined ? dados.data : existente.data,
      horario: dados.horario !== undefined ? (dados.horario.trim() || undefined) : existente.horario,
      peso: dados.peso !== undefined ? dados.peso : existente.peso,
      notaMaxima: dados.notaMaxima !== undefined ? dados.notaMaxima : existente.notaMaxima,
      descricao: dados.descricao !== undefined ? (dados.descricao.trim() || undefined) : existente.descricao,
      dataAtualizacao: agora,
    };

    this.avaliacoes.set(id, atualizada);
    return { ...atualizada };
  }

  async lancarNota(id: string, nota: number | null): Promise<Avaliacao> {
    const existente = this.avaliacoes.get(id);
    if (!existente) {
      throw new Error(`Avaliação com ID ${id} não encontrada.`);
    }

    const atualizada: Avaliacao = {
      ...existente,
      nota,
      dataAtualizacao: new Date().toISOString(),
    };

    this.avaliacoes.set(id, atualizada);
    return { ...atualizada };
  }

  async excluir(id: string): Promise<boolean> {
    return this.avaliacoes.delete(id);
  }

  async listarPorDisciplina(disciplinaId: string): Promise<Avaliacao[]> {
    return Array.from(this.avaliacoes.values())
      .filter((a) => a.disciplinaId === disciplinaId)
      .map((a) => ({ ...a }))
      .sort((a, b) => {
        const dataComparacao = a.data.localeCompare(b.data);
        if (dataComparacao !== 0) return dataComparacao;
        return (a.horario || '').localeCompare(b.horario || '');
      });
  }

  async listarTodas(): Promise<Avaliacao[]> {
    return Array.from(this.avaliacoes.values())
      .map((a) => ({ ...a }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    let removidos = 0;
    for (const [id, avaliacao] of this.avaliacoes.entries()) {
      if (avaliacao.disciplinaId === disciplinaId) {
        this.avaliacoes.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async restaurarEmLote(avaliacoes: Avaliacao[]): Promise<Avaliacao[]> {
    for (const a of avaliacoes) {
      this.avaliacoes.set(a.id, { ...a });
    }
    return Array.from(this.avaliacoes.values()).map((a) => ({ ...a }));
  }

  limpar(): void {
    this.avaliacoes.clear();
  }
}

import { AvaliacaoRepositorioSQLite } from './sqlite/AvaliacaoRepositorioSQLite';

// Instância singleton do repositório (SQLite com persistência real)
export const avaliacaoRepositorio: IAvaliacaoRepositorio =
  new AvaliacaoRepositorioSQLite();

