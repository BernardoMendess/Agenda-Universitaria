import {
  EficienciaEnergeticaService,
  eficienciaEnergeticaService,
} from '../src/servicos/EficienciaEnergeticaService';
import { NotificacaoAgendadaRepositorioEmMemoria } from '../src/servicos/banco/NotificacaoAgendadaRepositorio';

describe('EficienciaEnergeticaService (RNF04 — Eficiência Energética)', () => {
  let notifRepo: NotificacaoAgendadaRepositorioEmMemoria;
  let servico: EficienciaEnergeticaService;

  beforeEach(() => {
    notifRepo = new NotificacaoAgendadaRepositorioEmMemoria();
    servico = new EficienciaEnergeticaService(notifRepo);
  });

  describe('Diagnóstico e Métricas de Eficiência', () => {
    it('deve retornar diagnóstico completo em conformidade com o RNF04', async () => {
      const diagnostico = await servico.obterDiagnostico();

      expect(diagnostico.emConformidade).toBe(true);
      expect(diagnostico.protocolo).toBe('RNF04 — Eficiência Energética');
      expect(diagnostico.metricas.rotinasSegundoPlanoAtivas).toBe(0);
      expect(diagnostico.metricas.usoWakeLocks).toBe(0);
      expect(diagnostico.metricas.tipoAgendador).toBe('Agendador Nativo do Sistema');
      expect(diagnostico.metricas.consumoBateriaEstimado).toBe('Mínimo / Quase Nulo');
      expect(diagnostico.metricas.processamentoEventDriven).toBe(true);
      expect(diagnostico.garantias.length).toBeGreaterThan(0);
    });

    it('deve refletir a contagem correta de alarmes locais cadastrados no diagnóstico', async () => {
      await notifRepo.salvar({
        tipo: 'AULA',
        titulo: 'Aula de Cálculo',
        mensagem: 'Início às 08:00',
        referenciaId: 'ref_1',
        prioridade: 'MEDIA',
      });
      await notifRepo.salvar({
        tipo: 'AVALIACAO',
        titulo: 'Prova de Álgebra',
        mensagem: 'Prova amanhã',
        referenciaId: 'ref_2',
        prioridade: 'ALTA',
      });

      const diagnostico = await servico.obterDiagnostico();
      expect(diagnostico.metricas.alarmesLocaisRegistrados).toBe(2);
    });

    it('deve gerar diagnóstico síncrono com valores passados por parâmetro', () => {
      const diagSincrono = servico.obterDiagnosticoSincrono(5);

      expect(diagSincrono.emConformidade).toBe(true);
      expect(diagSincrono.metricas.alarmesLocaisRegistrados).toBe(5);
      expect(diagSincrono.metricas.rotinasSegundoPlanoAtivas).toBe(0);
      expect(diagSincrono.metricas.usoWakeLocks).toBe(0);
    });
  });

  describe('Validação de Conformidade Estrita', () => {
    it('deve retornar true para a conformidade com as diretrizes do RNF04', () => {
      const emConformidade = servico.verificarConformidadeEficiencia();
      expect(emConformidade).toBe(true);
    });

    it('deve auditar o consumo dos alarmes garantindo impacto de bateria desprezível', () => {
      const auditoria = servico.auditarConsumoAlarmes(10);

      expect(auditoria.emConformidade).toBe(true);
      expect(auditoria.rotinasBackground).toBe(0);
      expect(auditoria.tipoAgendador).toBe('Agendador Nativo do Sistema');
      expect(auditoria.consumoBateriaEstimado).toContain('Mínimo');
      expect(auditoria.impactoBateriaPct).toBeLessThan(1);
    });
  });

  describe('Instância Singleton', () => {
    it('deve exportar instância singleton devidamente configurada', async () => {
      expect(eficienciaEnergeticaService).toBeInstanceOf(EficienciaEnergeticaService);
      const diag = await eficienciaEnergeticaService.obterDiagnostico();
      expect(diag.emConformidade).toBe(true);
    });
  });
});
