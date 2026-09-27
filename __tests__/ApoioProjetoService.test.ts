import { ApoioProjetoService } from '../src/servicos/ApoioProjetoService';
import { TEMPO_SEGUNDOS_DISPARO_POPUP } from '../src/constantes/apoio';

describe('ApoioProjetoService — Pop-up Único de Doação (Buy me a coffee)', () => {
  let service: ApoioProjetoService;

  beforeEach(() => {
    service = new ApoioProjetoService();
    service.resetarStatusParaTestes();
  });

  it('deve inicializar com tempo de uso zero e status não exibido', () => {
    expect(service.verificarSeJaExibiu()).toBe(false);
    expect(service.obterTempoUsoSegundos()).toBe(0);
    expect(service.deveDispararModal()).toBe(false);
  });

  it('deve acumular e persistir o tempo de uso em segundos', () => {
    service.salvarTempoUsoSegundos(120);
    expect(service.obterTempoUsoSegundos()).toBe(120);
    expect(service.deveDispararModal()).toBe(false);

    service.salvarTempoUsoSegundos(299);
    expect(service.obterTempoUsoSegundos()).toBe(299);
    expect(service.deveDispararModal()).toBe(false);
  });

  it('deve sinalizar disparo do modal quando atingir exatamente 5 minutos (300s)', () => {
    service.salvarTempoUsoSegundos(TEMPO_SEGUNDOS_DISPARO_POPUP);
    expect(service.obterTempoUsoSegundos()).toBe(300);
    expect(service.deveDispararModal()).toBe(true);
  });

  it('deve sinalizar disparo do modal quando ultrapassar 5 minutos', () => {
    service.salvarTempoUsoSegundos(450);
    expect(service.deveDispararModal()).toBe(true);
  });

  it('ao marcar como exibido, nunca mais deve permitir disparar o modal', () => {
    service.salvarTempoUsoSegundos(500);
    expect(service.deveDispararModal()).toBe(true);

    service.marcarComoExibido();

    expect(service.verificarSeJaExibiu()).toBe(true);
    expect(service.deveDispararModal()).toBe(false);
  });

  it('deve permitir resetar os dados para fins de teste e desenvolvimento', () => {
    service.salvarTempoUsoSegundos(300);
    service.marcarComoExibido();
    expect(service.verificarSeJaExibiu()).toBe(true);

    service.resetarStatusParaTestes();
    expect(service.verificarSeJaExibiu()).toBe(false);
    expect(service.obterTempoUsoSegundos()).toBe(0);
  });
});
