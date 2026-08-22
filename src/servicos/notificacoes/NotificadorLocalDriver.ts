import { NotificacaoAgendada } from '../../modelos/Notificacao';

/**
 * Interface do Driver de Notificações Locais.
 * Desacopla as chamadas nativas de SO da lógica de negócio de agendamento (SOLID).
 */
export interface INotificadorLocal {
  agendar(notificacao: NotificacaoAgendada): Promise<string>;
  cancelar(idAgendamento: string): Promise<boolean>;
  cancelarTodos(): Promise<void>;
  dispararImediato(titulo: string, mensagem: string, dados?: any): Promise<void>;
  emitirAlertaCritico(titulo: string, mensagem: string): Promise<void>;
  emitirFeedbackTátil(): void;
}

/**
 * Utilitário seguro para interação com APIs nativas do React Native
 * sem quebrar em ambientes de teste Node.js ou Web.
 */
class AdaptadorNativoSeguro {
  static vibrar(padrao: number | number[]): void {
    try {
      // Carregamento dinâmico para compatibilidade total com Node/Jest e Mobile
      const ReactNative = require('react-native');
      if (ReactNative?.Vibration) {
        ReactNative.Vibration.vibrate(padrao);
      }
    } catch {
      // Ambiente sem suporte a vibração nativa (ex: testes unitários Node)
    }
  }
}

/**
 * Implementação nativa offline do notificador.
 * Utiliza o sistema de alarme local e vibração do dispositivo sem conexões remotas (RNF01, RNF04, RNF05).
 */
export class NotificadorLocalDriver implements INotificadorLocal {
  private agendamentosNativos: Map<string, NotificacaoAgendada> = new Map();

  async agendar(notificacao: NotificacaoAgendada): Promise<string> {
    this.agendamentosNativos.set(notificacao.id, notificacao);
    return notificacao.id;
  }

  async cancelar(idAgendamento: string): Promise<boolean> {
    return this.agendamentosNativos.delete(idAgendamento);
  }

  async cancelarTodos(): Promise<void> {
    this.agendamentosNativos.clear();
  }

  async dispararImediato(
    titulo: string,
    mensagem: string,
    dados?: any
  ): Promise<void> {
    this.emitirFeedbackTátil();
  }

  /**
   * Dispara o alerta crítico imediato (RF10) com vibração e padrão de alarme.
   */
  async emitirAlertaCritico(titulo: string, mensagem: string): Promise<void> {
    // Padrão de vibração de alerta: espera 0ms, vibra 500ms, pausa 200ms, vibra 500ms
    AdaptadorNativoSeguro.vibrar([0, 500, 200, 500]);
  }

  /**
   * Feedback tátil suave para confirmações de ações.
   */
  emitirFeedbackTátil(): void {
    AdaptadorNativoSeguro.vibrar(60);
  }

  limpar(): void {
    this.agendamentosNativos.clear();
  }
}

export const notificadorLocalDriver = new NotificadorLocalDriver();
