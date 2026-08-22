import {
  PrivacidadeService,
  privacidadeService,
} from '../src/servicos/PrivacidadeService';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { HorarioAulaRepositorioEmMemoria } from '../src/servicos/banco/HorarioAulaRepositorio';
import { FaltaRepositorioEmMemoria } from '../src/servicos/banco/FaltaRepositorio';
import { AvaliacaoRepositorioEmMemoria } from '../src/servicos/banco/AvaliacaoRepositorio';
import { TarefaRepositorioEmMemoria } from '../src/servicos/banco/TarefaRepositorio';
import { EventoAcademicoRepositorioEmMemoria } from '../src/servicos/banco/EventoAcademicoRepositorio';
import { ConfiguracaoNotificacaoRepositorioEmMemoria } from '../src/servicos/banco/ConfiguracaoNotificacaoRepositorio';
import { NotificacaoAgendadaRepositorioEmMemoria } from '../src/servicos/banco/NotificacaoAgendadaRepositorio';

describe('PrivacidadeService (RNF05 — Privacidade Total)', () => {
  let discRepo: DisciplinaRepositorioEmMemoria;
  let horarioRepo: HorarioAulaRepositorioEmMemoria;
  let faltaRepo: FaltaRepositorioEmMemoria;
  let avaliacaoRepo: AvaliacaoRepositorioEmMemoria;
  let tarefaRepo: TarefaRepositorioEmMemoria;
  let eventoRepo: EventoAcademicoRepositorioEmMemoria;
  let configRepo: ConfiguracaoNotificacaoRepositorioEmMemoria;
  let notifRepo: NotificacaoAgendadaRepositorioEmMemoria;
  let servico: PrivacidadeService;

  beforeEach(() => {
    discRepo = new DisciplinaRepositorioEmMemoria();
    horarioRepo = new HorarioAulaRepositorioEmMemoria();
    faltaRepo = new FaltaRepositorioEmMemoria();
    avaliacaoRepo = new AvaliacaoRepositorioEmMemoria();
    tarefaRepo = new TarefaRepositorioEmMemoria();
    eventoRepo = new EventoAcademicoRepositorioEmMemoria();
    configRepo = new ConfiguracaoNotificacaoRepositorioEmMemoria();
    notifRepo = new NotificacaoAgendadaRepositorioEmMemoria();

    servico = new PrivacidadeService(
      discRepo,
      horarioRepo,
      faltaRepo,
      avaliacaoRepo,
      tarefaRepo,
      eventoRepo,
      configRepo,
      notifRepo
    );
  });

  describe('Auditoria de Inventário de Dados Locais', () => {
    it('deve inventariar todas as 7 categorias de dados acadêmicos com armazenamento local', async () => {
      const inventario = await servico.auditarInventarioDados();

      expect(inventario.length).toBe(7);

      const categorias = inventario.map((i) => i.categoria);
      expect(categorias).toContain('DISCIPLINAS');
      expect(categorias).toContain('GRADE_HORARIA');
      expect(categorias).toContain('FALTAS_FREQUENCIA');
      expect(categorias).toContain('AVALIACOES_NOTAS');
      expect(categorias).toContain('TAREFAS');
      expect(categorias).toContain('CONFIGURACOES');
      expect(categorias).toContain('NOTIFICACOES_LOCAIS');

      // Todas as categorias devem ser confinadas localmente
      for (const item of inventario) {
        expect(item.armazenamento).toBe('Sandbox Local SQLite');
        expect(item.sincronizacaoNuvem).toBe(false);
        expect(item.compartilhamentoTerceiros).toBe(false);
      }
    });

    it('deve contabilizar corretamente o total de registros populados', async () => {
      const disc = await discRepo.criar({
        nome: 'Estruturas de Dados',
        corIdentificacao: '#6366f1',
        limiteMaximoFaltas: 10,
        criterioAprovacao: 'ARITMETICA',
      });
      await tarefaRepo.criar({
        titulo: 'Implementar Árvore AVL',
        disciplinaId: disc.id,
      });

      const inventario = await servico.auditarInventarioDados();
      const itemDisc = inventario.find((i) => i.categoria === 'DISCIPLINAS');
      const itemTar = inventario.find((i) => i.categoria === 'TAREFAS');

      expect(itemDisc?.totalRegistros).toBe(1);
      expect(itemTar?.totalRegistros).toBe(1);
    });
  });

  describe('Certificado de Privacidade Total', () => {
    it('deve emitir certificado oficial com garantias e 0 bytes externos', async () => {
      const cert = await servico.obterCertificadoPrivacidade();

      expect(cert.idCertificado).toMatch(/^CERT-PRIV-RNF05-/);
      expect(cert.status).toBe('Totalmente Privado');
      expect(cert.transmissaoExternaBytes).toBe(0);
      expect(cert.telemetriaAtiva).toBe(false);
      expect(cert.analyticsAtivo).toBe(false);
      expect(cert.rastreamentoIdentificadores).toBe(false);
      expect(cert.localArmazenamento).toContain('Sandbox Local Isolada');
      expect(cert.garantias.length).toBeGreaterThanOrEqual(4);
      expect(cert.hashAuditoria).toContain('RNF05_VERIFIED');
    });
  });

  describe('Relatório de Auditoria e Conformidade', () => {
    it('deve gerar relatório com cálculo correto de total de itens e status conforme', async () => {
      await discRepo.criar({
        nome: 'Cálculo I',
        corIdentificacao: '#6366f1',
        limiteMaximoFaltas: 8,
        criterioAprovacao: 'ARITMETICA',
      });

      const relatorio = await servico.obterRelatorioAuditoria();

      expect(relatorio.emConformidade).toBe(true);
      expect(relatorio.protocolo).toBe('RNF05 — Privacidade Total');
      expect(relatorio.totalItensLocais).toBeGreaterThanOrEqual(2); // 1 disc + 1 config
      expect(relatorio.resumo).toContain('100% de conformidade');
    });

    it('deve retornar true na verificação de conformidade estrita', () => {
      expect(servico.verificarConformidadePrivacidadeTotal()).toBe(true);
    });

    it('deve prover a declaração textual formal de soberania de dados', () => {
      const declaracao = servico.obterDeclaracaoPrivacidade();
      expect(declaracao).toContain('DECLARAÇÃO DE PRIVACIDADE TOTAL');
      expect(declaracao).toContain('RNF05');
      expect(declaracao).toContain('Offline-First');
    });
  });

  describe('Instância Singleton', () => {
    it('deve exportar a instância singleton devidamente configurada', async () => {
      expect(privacidadeService).toBeInstanceOf(PrivacidadeService);
      const cert = await privacidadeService.obterCertificadoPrivacidade();
      expect(cert.status).toBe('Totalmente Privado');
    });
  });
});
