import {
  EventoAcademico,
  CriarEventoAcademicoDTO,
  AtualizarEventoAcademicoDTO,
} from '../../modelos/EventoAcademico';

/**
 * Interface que define as operações de persistência para Eventos Acadêmicos.
 * Segue os princípios SOLID (Inversão de Dependência e Segregação de Interfaces).
 */
export interface IEventoAcademicoRepositorio {
  criar(dados: CriarEventoAcademicoDTO): Promise<EventoAcademico>;
  buscarPorId(id: string): Promise<EventoAcademico | null>;
  atualizar(id: string, dados: AtualizarEventoAcademicoDTO): Promise<EventoAcademico>;
  excluir(id: string): Promise<boolean>;
  listarTodos(): Promise<EventoAcademico[]>;
  listarPorIntervalo(dataInicioStr: string, dataFimStr: string): Promise<EventoAcademico[]>;
  excluirPorDisciplina(disciplinaId: string): Promise<number>;
  restaurarEmLote(eventos: EventoAcademico[]): Promise<EventoAcademico[]>;
  limpar(): void;
}

/**
 * Implementação em memória / local com persistência Offline-First e compatibilidade com testes.
 */
export class EventoAcademicoRepositorioEmMemoria
  implements IEventoAcademicoRepositorio
{
  private eventos: Map<string, EventoAcademico> = new Map();

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

    this.eventos.set(id, novoEvento);
    return { ...novoEvento };
  }

  async buscarPorId(id: string): Promise<EventoAcademico | null> {
    const evento = this.eventos.get(id);
    return evento ? { ...evento } : null;
  }

  async atualizar(
    id: string,
    dados: AtualizarEventoAcademicoDTO
  ): Promise<EventoAcademico> {
    const existente = this.eventos.get(id);
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

    this.eventos.set(id, atualizado);
    return { ...atualizado };
  }

  async excluir(id: string): Promise<boolean> {
    return this.eventos.delete(id);
  }

  async listarTodos(): Promise<EventoAcademico[]> {
    return Array.from(this.eventos.values())
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
    const todos = await this.listarTodos();
    return todos.filter(
      (e) => e.data >= dataInicioStr && e.data <= dataFimStr
    );
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    let removidos = 0;
    for (const [id, evento] of this.eventos.entries()) {
      if (evento.disciplinaId === disciplinaId) {
        this.eventos.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async restaurarEmLote(eventos: EventoAcademico[]): Promise<EventoAcademico[]> {
    for (const e of eventos) {
      this.eventos.set(e.id, { ...e });
    }
    return Array.from(this.eventos.values()).map((e) => ({ ...e }));
  }

  limpar(): void {
    this.eventos.clear();
  }
}

// Instância singleton do repositório
export const eventoAcademicoRepositorio =
  new EventoAcademicoRepositorioEmMemoria();
