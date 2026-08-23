import {
  HorarioAula,
  CriarHorarioAulaDTO,
  AtualizarHorarioAulaDTO,
  DiaSemana,
} from '../../modelos/HorarioAula';

/**
 * Interface que define as operações de persistência de Horários de Aula.
 * Segue o Princípio da Segregação de Interfaces e Inversão de Dependência (SOLID).
 */
export interface IHorarioAulaRepositorio {
  criar(dados: CriarHorarioAulaDTO): Promise<HorarioAula>;
  buscarPorId(id: string): Promise<HorarioAula | null>;
  listarPorDisciplina(disciplinaId: string): Promise<HorarioAula[]>;
  listarTodos(): Promise<HorarioAula[]>;
  listarPorDia(diaSemana: DiaSemana): Promise<HorarioAula[]>;
  atualizar(id: string, dados: AtualizarHorarioAulaDTO): Promise<HorarioAula>;
  excluir(id: string): Promise<boolean>;
  excluirPorDisciplina(disciplinaId: string): Promise<number>;
  substituirHorariosDisciplina(
    disciplinaId: string,
    novosHorarios: Omit<CriarHorarioAulaDTO, 'disciplinaId'>[]
  ): Promise<HorarioAula[]>;
  restaurarEmLote(horarios: HorarioAula[]): Promise<HorarioAula[]>;
  limpar(): void;
}

/**
 * Implementação em memória / local para suporte Offline-First e testes unitários.
 */
export class HorarioAulaRepositorioEmMemoria implements IHorarioAulaRepositorio {
  private horarios: Map<string, HorarioAula> = new Map();

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

    this.horarios.set(id, novoHorario);
    return { ...novoHorario };
  }

  async buscarPorId(id: string): Promise<HorarioAula | null> {
    const horario = this.horarios.get(id);
    return horario ? { ...horario } : null;
  }

  async listarPorDisciplina(disciplinaId: string): Promise<HorarioAula[]> {
    return Array.from(this.horarios.values())
      .filter((h) => h.disciplinaId === disciplinaId)
      .map((h) => ({ ...h }))
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }

  async listarTodos(): Promise<HorarioAula[]> {
    return Array.from(this.horarios.values())
      .map((h) => ({ ...h }))
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }

  async listarPorDia(diaSemana: DiaSemana): Promise<HorarioAula[]> {
    return Array.from(this.horarios.values())
      .filter((h) => h.diaSemana === diaSemana)
      .map((h) => ({ ...h }))
      .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
  }

  async atualizar(id: string, dados: AtualizarHorarioAulaDTO): Promise<HorarioAula> {
    const existente = this.horarios.get(id);
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

    this.horarios.set(id, atualizado);
    return { ...atualizado };
  }

  async excluir(id: string): Promise<boolean> {
    return this.horarios.delete(id);
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    let removidos = 0;
    for (const [id, horario] of this.horarios.entries()) {
      if (horario.disciplinaId === disciplinaId) {
        this.horarios.delete(id);
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
    for (const h of horarios) {
      this.horarios.set(h.id, { ...h });
    }
    return Array.from(this.horarios.values()).map(h => ({ ...h }));
  }

  limpar(): void {
    this.horarios.clear();
  }
}

import { HorarioAulaRepositorioSQLite } from './sqlite/HorarioAulaRepositorioSQLite';

// Instância singleton do repositório (SQLite com persistência real)
export const horarioAulaRepositorio: IHorarioAulaRepositorio =
  new HorarioAulaRepositorioSQLite();

