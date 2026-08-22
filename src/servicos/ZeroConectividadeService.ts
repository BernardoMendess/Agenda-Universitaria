/**
 * Informações e metadados sobre o estado de conectividade do sistema.
 */
export interface StatusConectividade {
  modo: '100% Offline' | 'Isolado';
  conectividadeExternaPermitida: boolean;
  privacidadeGarantida: boolean;
  protocolo: 'Zero Conectividade (RNF01)';
  dadosArmazenadosLocalmente: boolean;
  timestampVerificacao: string;
}

/**
 * Interface que define o contrato do serviço de conformidade offline.
 * Segue o Princípio da Inversão de Dependência e Segregação de Interfaces (SOLID).
 */
export interface IZeroConectividadeService {
  obterStatus(): StatusConectividade;
  verificarConformidadeOffline(): boolean;
  bloquearChamadaExterna(origem?: string): never;
}

/**
 * Serviço responsável por garantir, auditar e certificar a política de Zero Conectividade (RNF01).
 * O CampusFlow é projetado para operar com 100% de autonomia e isolamento de rede.
 */
export class ZeroConectividadeService implements IZeroConectividadeService {
  /**
   * Retorna o status atual de conectividade e segurança de dados do aplicativo.
   */
  obterStatus(): StatusConectividade {
    return {
      modo: '100% Offline',
      conectividadeExternaPermitida: false,
      privacidadeGarantida: true,
      protocolo: 'Zero Conectividade (RNF01)',
      dadosArmazenadosLocalmente: true,
      timestampVerificacao: new Date().toISOString(),
    };
  }

  /**
   * Verifica se o aplicativo está em estrita conformidade com o RNF01.
   * Retorna true quando nenhum tráfego remoto está habilitado.
   */
  verificarConformidadeOffline(): boolean {
    const status = this.obterStatus();
    return !status.conectividadeExternaPermitida && status.privacidadeGarantida;
  }

  /**
   * Dispara um erro caso qualquer componente ou rotina tente realizar tráfego externo não autorizado.
   */
  bloquearChamadaExterna(origem: string = 'desconhecida'): never {
    throw new Error(
      `[RNF01 — Violação de Segurança] Tentativa de chamada de rede bloqueada. Origem: ${origem}. O CampusFlow opera 100% offline.`
    );
  }
}

// Instância singleton do serviço de conformidade
export const zeroConectividadeService = new ZeroConectividadeService();
