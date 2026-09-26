import { NotificacaoAgendada } from '../../modelos/Notificacao';
import { DiaSemana } from '../../modelos/HorarioAula';

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
  verificarPermissao(): Promise<boolean>;
  solicitarPermissao(): Promise<boolean>;
  inicializar(): Promise<void>;
}

const MAPA_DIA_SEMANA_EXPO: Record<DiaSemana, number> = {
  DOMINGO: 1,
  SEGUNDA: 2,
  TERCA: 3,
  QUARTA: 4,
  QUINTA: 5,
  SEXTA: 6,
  SABADO: 7,
};

/**
 * Adaptador seguro para módulos nativos (expo-notifications e react-native),
 * garantindo compatibilidade total tanto no runtime mobile quanto em testes Jest (Node.js).
 */
class AdaptadorNativoSeguro {
  static obterPlatformOS(): string {
    try {
      const RN = require('react-native');
      return RN?.Platform?.OS || 'android';
    } catch {
      return 'android';
    }
  }

  static obterNotifications(): any {
    try {
      return require('expo-notifications');
    } catch {
      return null;
    }
  }
}

// Configura o handler global assim que o módulo é importado
try {
  const Notifications = AdaptadorNativoSeguro.obterNotifications();
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch {
  // Ignora em testes Node/Jest
}

/**
 * Implementação nativa usando expo-notifications na barra de notificações do dispositivo.
 * Vibração removida conforme solicitado (RNF01, RNF04, RNF05).
 */
export class NotificadorLocalDriver implements INotificadorLocal {
  private inicializado: boolean = false;
  private mapaIdsNativos: Map<string, string> = new Map(); // idApp -> idNativoExpo

  async inicializar(): Promise<void> {
    if (this.inicializado) return;

    try {
      const Notifications = AdaptadorNativoSeguro.obterNotifications();
      if (!Notifications) {
        this.inicializado = true;
        return;
      }

      if (AdaptadorNativoSeguro.obterPlatformOS() === 'android' && Notifications.setNotificationChannelAsync) {
        // Canal padrão para lembretes (sem vibração)
        await Notifications.setNotificationChannelAsync('lembretes-academicos', {
          name: 'Lembretes Acadêmicos (Aulas, Provas, Tarefas)',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          enableVibrate: false, // Vibração desativada
          vibrationPattern: [],
          showBadge: true,
        });

        // Canal crítico para limite de faltas (sem vibração)
        await Notifications.setNotificationChannelAsync('alertas-faltas', {
          name: 'Alertas Críticos de Faltas',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
          enableVibrate: false, // Vibração desativada
          vibrationPattern: [],
          showBadge: true,
        });
      }
      this.inicializado = true;
    } catch (e) {
      console.warn('Falha ao inicializar canais de notificação:', e);
    }
  }

  async verificarPermissao(): Promise<boolean> {
    try {
      const Notifications = AdaptadorNativoSeguro.obterNotifications();
      if (!Notifications?.getPermissionsAsync) return true;
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async solicitarPermissao(): Promise<boolean> {
    try {
      const Notifications = AdaptadorNativoSeguro.obterNotifications();
      if (!Notifications?.requestPermissionsAsync) return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async agendar(notificacao: NotificacaoAgendada): Promise<string> {
    await this.inicializar();
    const Notifications = AdaptadorNativoSeguro.obterNotifications();
    if (!Notifications?.scheduleNotificationAsync) {
      return notificacao.id;
    }

    try {
      // 1. Aulas Semanais Recorrentes
      if (notificacao.tipo === 'AULA' && notificacao.diaSemana && notificacao.horarioInicio) {
        const [h, m] = notificacao.horarioInicio.split(':').map(Number);
        let totalMin = h * 60 + m - (notificacao.antecedenciaMinutos || 0);
        let diaOffset = 0;

        if (totalMin < 0) {
          totalMin += 24 * 60;
          diaOffset = -1;
        }

        const hora = Math.floor(totalMin / 60) % 24;
        const minuto = totalMin % 60;
        let weekday = MAPA_DIA_SEMANA_EXPO[notificacao.diaSemana];

        if (diaOffset === -1) {
          weekday = weekday === 1 ? 7 : weekday - 1;
        }

        let idExpo = notificacao.id;
        try {
          idExpo = await Notifications.scheduleNotificationAsync({
            content: {
              title: notificacao.titulo,
              body: notificacao.mensagem,
              sound: true,
              data: { id: notificacao.id, tipo: notificacao.tipo, referenciaId: notificacao.referenciaId },
            },
            trigger: {
              type: 'weekly' as any,
              weekday,
              hour: hora,
              minute: minuto,
              channelId: 'lembretes-academicos',
            },
          });
        } catch (erroAgendar) {
          console.warn('Aviso ao agendar notificação semanal no SO:', erroAgendar);
        }

        this.mapaIdsNativos.set(notificacao.id, idExpo);
        return idExpo;
      }

      // 2. Avaliações e Tarefas com Data/Hora específica
      if (notificacao.dataHoraDisparo) {
        const dataDisparo = new Date(notificacao.dataHoraDisparo);

        // Só agenda se a data/hora estiver no futuro
        if (dataDisparo.getTime() > Date.now()) {
          let idExpo = notificacao.id;
          try {
            idExpo = await Notifications.scheduleNotificationAsync({
              content: {
                title: notificacao.titulo,
                body: notificacao.mensagem,
                sound: true,
                data: { id: notificacao.id, tipo: notificacao.tipo, referenciaId: notificacao.referenciaId },
              },
              trigger: {
                type: 'date' as any,
                date: dataDisparo,
                channelId: 'lembretes-academicos',
              },
            });
          } catch (erroAgendar) {
            console.warn('Aviso ao agendar notificação por data no SO:', erroAgendar);
          }

          this.mapaIdsNativos.set(notificacao.id, idExpo);
          return idExpo;
        }
      }

      return notificacao.id;
    } catch (e) {
      console.warn('Erro ao processar agendamento de notificação:', e);
      return notificacao.id;
    }
  }

  async cancelar(idAgendamento: string): Promise<boolean> {
    try {
      const Notifications = AdaptadorNativoSeguro.obterNotifications();
      if (!Notifications?.cancelScheduledNotificationAsync) return true;
      const idExpo = this.mapaIdsNativos.get(idAgendamento) || idAgendamento;
      await Notifications.cancelScheduledNotificationAsync(idExpo);
      this.mapaIdsNativos.delete(idAgendamento);
      return true;
    } catch {
      return false;
    }
  }

  async cancelarTodos(): Promise<void> {
    try {
      const Notifications = AdaptadorNativoSeguro.obterNotifications();
      if (!Notifications?.cancelAllScheduledNotificationsAsync) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.mapaIdsNativos.clear();
    } catch (e) {
      console.warn('Erro ao cancelar todas as notificações:', e);
    }
  }

  /**
   * Disparo imediato na barra de notificações do celular (sem vibração).
   */
  async dispararImediato(
    titulo: string,
    mensagem: string,
    dados?: any
  ): Promise<void> {
    await this.inicializar();
    try {
      const Notifications = AdaptadorNativoSeguro.obterNotifications();
      if (!Notifications?.scheduleNotificationAsync) return;

      const ehAndroid = AdaptadorNativoSeguro.obterPlatformOS() === 'android';
      await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensagem,
          sound: true,
          data: dados || {},
        },
        trigger: ehAndroid ? { channelId: 'lembretes-academicos' } : null,
      });
    } catch (e) {
      console.warn('Erro ao disparar notificação imediata:', e);
    }
  }

  /**
   * Dispara o alerta crítico imediato (RF10) na barra do celular sem vibração e sem travar o app.
   */
  async emitirAlertaCritico(titulo: string, mensagem: string): Promise<void> {
    await this.inicializar();
    try {
      const Notifications = AdaptadorNativoSeguro.obterNotifications();
      if (!Notifications?.scheduleNotificationAsync) return;

      const ehAndroid = AdaptadorNativoSeguro.obterPlatformOS() === 'android';
      await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensagem,
          sound: true,
          data: { alertaCritico: true },
          priority: Notifications.AndroidNotificationPriority?.MAX,
        },
        trigger: ehAndroid ? { channelId: 'alertas-faltas' } : null,
      });
    } catch (e) {
      console.warn('Erro ao emitir alerta crítico na barra do celular:', e);
    }
  }

  /**
   * Feedback tátil desativado conforme solicitação do usuário.
   */
  emitirFeedbackTátil(): void {
    // Vibração removida completamente
  }

  limpar(): void {
    this.mapaIdsNativos.clear();
  }
}

export const notificadorLocalDriver = new NotificadorLocalDriver();
