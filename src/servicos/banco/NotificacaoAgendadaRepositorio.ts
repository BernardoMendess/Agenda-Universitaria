import {
  NotificacaoAgendada,
  CriarNotificacaoAgendadaDTO,
  TipoNotificacao,
} from '../../modelos/Notificacao';

/**
 * Interface para persistência de notificações agendadas.
 */
export interface INotificacaoAgendadaRepositorio {
  salvar(dados: CriarNotificacaoAgendadaDTO): Promise<NotificacaoAgendada>;
  salvarEmLote(itens: CriarNotificacaoAgendadaDTO[]): Promise<NotificacaoAgendada[]>;
  buscarPorId(id: string): Promise<NotificacaoAgendada | null>;
  listarTodas(): Promise<NotificacaoAgendada[]>;
  listarPorTipo(tipo: TipoNotificacao): Promise<NotificacaoAgendada[]>;
  listarPorReferenciaId(referenciaId: string): Promise<NotificacaoAgendada[]>;
  removerPorId(id: string): Promise<boolean>;
  removerPorReferenciaId(referenciaId: string): Promise<number>;
  removerPorTipo(tipo: TipoNotificacao): Promise<number>;
  limpar(): void;
}

/**
 * Implementação em memória / local (Offline-First).
 */
export class NotificacaoAgendadaRepositorioEmMemoria
  implements INotificacaoAgendadaRepositorio
{
  private notificacoes: Map<string, NotificacaoAgendada> = new Map();

  async salvar(dados: CriarNotificacaoAgendadaDTO): Promise<NotificacaoAgendada> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const nova: NotificacaoAgendada = {
      id,
      tipo: dados.tipo,
      titulo: dados.titulo.trim(),
      mensagem: dados.mensagem.trim(),
      referenciaId: dados.referenciaId,
      disciplinaId: dados.disciplinaId,
      disciplinaNome: dados.disciplinaNome,
      disciplinaCor: dados.disciplinaCor,
      dataHoraDisparo: dados.dataHoraDisparo,
      diaSemana: dados.diaSemana,
      horarioInicio: dados.horarioInicio,
      antecedenciaMinutos: dados.antecedenciaMinutos,
      antecedenciaHoras: dados.antecedenciaHoras,
      prioridade: dados.prioridade || 'MEDIA',
      ativa: true,
      dataCriacao: new Date().toISOString(),
    };

    this.notificacoes.set(id, nova);
    return { ...nova };
  }

  async salvarEmLote(
    itens: CriarNotificacaoAgendadaDTO[]
  ): Promise<NotificacaoAgendada[]> {
    const criadas: NotificacaoAgendada[] = [];
    for (const item of itens) {
      const nova = await this.salvar(item);
      criadas.push(nova);
    }
    return criadas;
  }

  async buscarPorId(id: string): Promise<NotificacaoAgendada | null> {
    const item = this.notificacoes.get(id);
    return item ? { ...item } : null;
  }

  async listarTodas(): Promise<NotificacaoAgendada[]> {
    return Array.from(this.notificacoes.values()).map((n) => ({ ...n }));
  }

  async listarPorTipo(tipo: TipoNotificacao): Promise<NotificacaoAgendada[]> {
    return Array.from(this.notificacoes.values())
      .filter((n) => n.tipo === tipo)
      .map((n) => ({ ...n }));
  }

  async listarPorReferenciaId(
    referenciaId: string
  ): Promise<NotificacaoAgendada[]> {
    return Array.from(this.notificacoes.values())
      .filter((n) => n.referenciaId === referenciaId)
      .map((n) => ({ ...n }));
  }

  async removerPorId(id: string): Promise<boolean> {
    return this.notificacoes.delete(id);
  }

  async removerPorReferenciaId(referenciaId: string): Promise<number> {
    let removidos = 0;
    for (const [id, notif] of this.notificacoes.entries()) {
      if (notif.referenciaId === referenciaId) {
        this.notificacoes.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async removerPorTipo(tipo: TipoNotificacao): Promise<number> {
    let removidos = 0;
    for (const [id, notif] of this.notificacoes.entries()) {
      if (notif.tipo === tipo) {
        this.notificacoes.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  limpar(): void {
    this.notificacoes.clear();
  }
}

export const notificacaoAgendadaRepositorio =
  new NotificacaoAgendadaRepositorioEmMemoria();
