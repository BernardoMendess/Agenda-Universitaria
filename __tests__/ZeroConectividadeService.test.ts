import {
  ZeroConectividadeService,
  zeroConectividadeService,
} from '../src/servicos/ZeroConectividadeService';

describe('ZeroConectividadeService (RNF01 — Zero Conectividade)', () => {
  let servico: ZeroConectividadeService;

  beforeEach(() => {
    servico = new ZeroConectividadeService();
  });

  describe('obterStatus', () => {
    it('deve retornar status confirmando modo 100% offline e sem conectividade externa', () => {
      const status = servico.obterStatus();

      expect(status.modo).toBe('100% Offline');
      expect(status.conectividadeExternaPermitida).toBe(false);
      expect(status.privacidadeGarantida).toBe(true);
      expect(status.protocolo).toBe('Zero Conectividade (RNF01)');
      expect(status.dadosArmazenadosLocalmente).toBe(true);
      expect(typeof status.timestampVerificacao).toBe('string');
      expect(new Date(status.timestampVerificacao).getTime()).not.toBeNaN();
    });

    it('deve fornecer uma instância singleton pronta para uso', () => {
      expect(zeroConectividadeService).toBeInstanceOf(ZeroConectividadeService);
      const status = zeroConectividadeService.obterStatus();
      expect(status.modo).toBe('100% Offline');
    });
  });

  describe('verificarConformidadeOffline', () => {
    it('deve retornar true indicando que o aplicativo está em conformidade com o RNF01', () => {
      const emConformidade = servico.verificarConformidadeOffline();
      expect(emConformidade).toBe(true);
    });
  });

  describe('bloquearChamadaExterna', () => {
    it('deve disparar erro explicativo ao interceptar chamada de rede não autorizada', () => {
      expect(() => {
        servico.bloquearChamadaExterna('API_Externa_Invalida');
      }).toThrow('[RNF01 — Violação de Segurança] Tentativa de chamada de rede bloqueada. Origem: API_Externa_Invalida. O CampusFlow opera 100% offline.');
    });

    it('deve usar "desconhecida" quando nenhuma origem for fornecida', () => {
      expect(() => {
        servico.bloquearChamadaExterna();
      }).toThrow('[RNF01 — Violação de Segurança] Tentativa de chamada de rede bloqueada. Origem: desconhecida. O CampusFlow opera 100% offline.');
    });
  });
});
