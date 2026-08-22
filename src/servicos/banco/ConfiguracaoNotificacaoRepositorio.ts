import {
  ConfiguracaoNotificacao,
  CONFIGURACAO_NOTIFICACAO_PADRAO,
} from '../../modelos/Notificacao';

/**
 * Interface para persistência das preferências de notificação do usuário.
 * Segue os princípios SOLID (Interface Segregation & Dependency Inversion).
 */
export interface IConfiguracaoNotificacaoRepositorio {
  obterConfiguracao(): Promise<ConfiguracaoNotificacao>;
  salvarConfiguracao(
    config: Partial<ConfiguracaoNotificacao>
  ): Promise<ConfiguracaoNotificacao>;
  restaurarPadrao(): Promise<ConfiguracaoNotificacao>;
}

/**
 * Implementação em memória / local (Offline-First).
 */
export class ConfiguracaoNotificacaoRepositorioEmMemoria
  implements IConfiguracaoNotificacaoRepositorio
{
  private config: ConfiguracaoNotificacao = { ...CONFIGURACAO_NOTIFICACAO_PADRAO };

  async obterConfiguracao(): Promise<ConfiguracaoNotificacao> {
    return { ...this.config };
  }

  async salvarConfiguracao(
    dados: Partial<ConfiguracaoNotificacao>
  ): Promise<ConfiguracaoNotificacao> {
    this.config = {
      ...this.config,
      ...dados,
      dataAtualizacao: dados.dataAtualizacao || new Date().toISOString(),
    };
    return { ...this.config };
  }

  async restaurarPadrao(): Promise<ConfiguracaoNotificacao> {
    this.config = {
      ...CONFIGURACAO_NOTIFICACAO_PADRAO,
      dataAtualizacao: new Date().toISOString(),
    };
    return { ...this.config };
  }

  limpar(): void {
    this.config = { ...CONFIGURACAO_NOTIFICACAO_PADRAO };
  }
}

export const configuracaoNotificacaoRepositorio =
  new ConfiguracaoNotificacaoRepositorioEmMemoria();
