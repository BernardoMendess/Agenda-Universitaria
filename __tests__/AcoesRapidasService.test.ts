import {
  AcoesRapidasService,
  acoesRapidasService,
  RegistroAcaoRapida,
} from '../src/servicos/AcoesRapidasService';

describe('AcoesRapidasService — Testes de Usabilidade 1 Toque (RNF03)', () => {
  let service: AcoesRapidasService;

  beforeEach(() => {
    service = new AcoesRapidasService();
    service.limparHistorico();
  });

  describe('1. Mensagens de Feedback de Faltas', () => {
    it('deve gerar mensagem clara de incremento com limite de faltas', () => {
      const msg = service.gerarMensagemFeedbackFalta('Cálculo I', 'INCREMENTO', 3, 8);
      expect(msg).toBe('Falta registrada em Cálculo I (3/8 faltas)');
    });

    it('deve gerar mensagem de incremento para presença facultativa ou sem limite', () => {
      const msg = service.gerarMensagemFeedbackFalta('Seminários', 'INCREMENTO', 2, 0);
      expect(msg).toBe('Falta registrada em Seminários (Total: 2)');
    });

    it('deve gerar mensagem clara de decremento de faltas', () => {
      const msg = service.gerarMensagemFeedbackFalta('Física II', 'DECREMENTO', 2, 6);
      expect(msg).toBe('Falta removida de Física II (2/6 faltas)');
    });

    it('deve truncar nomes de disciplinas muito longos para manter o toast legível', () => {
      const msg = service.gerarMensagemFeedbackFalta(
        'Laboratório de Algoritmos e Estruturas de Dados Avançadas',
        'INCREMENTO',
        1,
        4
      );
      expect(msg).toContain('...');
      expect(msg).toContain('(1/4 faltas)');
    });
  });

  describe('2. Mensagens de Feedback de Tarefas', () => {
    it('deve gerar mensagem de tarefa concluída em 1 toque', () => {
      const msg = service.gerarMensagemFeedbackTarefa('Estudar para P1', true);
      expect(msg).toBe('Tarefa concluída: "Estudar para P1"');
    });

    it('deve gerar mensagem de tarefa reaberta em 1 toque', () => {
      const msg = service.gerarMensagemFeedbackTarefa('Entregar Lista 3', false);
      expect(msg).toBe('Tarefa reaberta: "Entregar Lista 3"');
    });

    it('deve truncar títulos de tarefas longos com elegância', () => {
      const msg = service.gerarMensagemFeedbackTarefa(
        'Relatório do experimento de química analítica quantitativa',
        true
      );
      expect(msg).toContain('...');
    });
  });

  describe('3. Pilha de Ações Rápidas e Desfazer (Undo)', () => {
    it('deve registrar uma ação rápida e disponibilizá-la no topo da pilha', () => {
      const acao = service.registrarAcao({
        tipo: 'INCREMENTAR_FALTA',
        descricao: 'Falta registrada em Cálculo',
        disciplinaId: 'disc-1',
        disciplinaNome: 'Cálculo I',
        totalFaltasAposAcao: 4,
        limiteFaltas: 8,
      });

      expect(acao.id).toBeDefined();
      expect(acao.timestamp).toBeGreaterThan(0);
      expect(service.tamanhoHistorico()).toBe(1);
      expect(service.obterUltimaAcao()?.disciplinaId).toBe('disc-1');
    });

    it('deve permitir desfazer a última ação removendo-a do topo', () => {
      service.registrarAcao({
        tipo: 'CONCLUIR_TAREFA',
        descricao: 'Tarefa concluída',
        tarefaId: 'tar-1',
        tarefaTitulo: 'Lista 1',
        concluidaAposAcao: true,
      });

      service.registrarAcao({
        tipo: 'INCREMENTAR_FALTA',
        descricao: 'Falta em Física',
        disciplinaId: 'disc-2',
        disciplinaNome: 'Física I',
        totalFaltasAposAcao: 1,
      });

      expect(service.tamanhoHistorico()).toBe(2);

      const desfeita = service.desfazerUltimaAcao();
      expect(desfeita?.disciplinaId).toBe('disc-2');
      expect(service.tamanhoHistorico()).toBe(1);

      const proxima = service.obterUltimaAcao();
      expect(proxima?.tarefaId).toBe('tar-1');
    });

    it('deve retornar null ao tentar desfazer com pilha vazia', () => {
      const desfeita = service.desfazerUltimaAcao();
      expect(desfeita).toBeNull();
    });

    it('deve respeitar o limite máximo da pilha de histórico', () => {
      for (let i = 0; i < 25; i++) {
        service.registrarAcao({
          tipo: 'INCREMENTAR_FALTA',
          descricao: `Ação ${i}`,
          disciplinaId: `disc-${i}`,
        });
      }

      expect(service.tamanhoHistorico()).toBe(20);
    });
  });

  describe('4. Criação de Objeto de Feedback', () => {
    it('deve criar feedback com tipo SUCESSO quando faltas estão seguras', () => {
      const acao = service.registrarAcao({
        tipo: 'INCREMENTAR_FALTA',
        descricao: 'Falta registrada',
        disciplinaId: 'disc-1',
        disciplinaNome: 'Geometria Analítica',
        totalFaltasAposAcao: 2,
        limiteFaltas: 8,
      });

      const feedback = service.criarFeedback(acao);
      expect(feedback.tipo).toBe('SUCESSO');
      expect(feedback.podeDesfazer).toBe(true);
      expect(feedback.mensagem).toContain('Geometria Analítica');
    });

    it('deve criar feedback com tipo ALERTA quando atinge ou ultrapassa limite de faltas', () => {
      const acao = service.registrarAcao({
        tipo: 'INCREMENTAR_FALTA',
        descricao: 'Falta registrada',
        disciplinaId: 'disc-1',
        disciplinaNome: 'Estruturas de Dados',
        totalFaltasAposAcao: 8,
        limiteFaltas: 8,
      });

      const feedback = service.criarFeedback(acao);
      expect(feedback.tipo).toBe('ALERTA');
    });

    it('deve criar feedback adequado para conclusão de tarefas', () => {
      const acao = service.registrarAcao({
        tipo: 'CONCLUIR_TAREFA',
        descricao: 'Tarefa concluída',
        tarefaId: 'tar-2',
        tarefaTitulo: 'Estudar Capítulo 4',
        concluidaAposAcao: true,
      });

      const feedback = service.criarFeedback(acao);
      expect(feedback.tipo).toBe('SUCESSO');
      expect(feedback.mensagem).toBe('Tarefa concluída: "Estudar Capítulo 4"');
    });
  });

  describe('5. Conformidade com RNF03 (Usabilidade Mobile em 1 Toque)', () => {
    it('deve validar como conforme se a ação requer apenas 1 toque', () => {
      const resultado = service.validarConformidadeUsabilidade(1);
      expect(resultado.conformeRNF03).toBe(true);
      expect(resultado.nivelUsabilidade).toBe('EXCELENTE');
    });

    it('deve reprovar ações que exijam múltiplos toques / navegação profunda', () => {
      const resultado = service.validarConformidadeUsabilidade(3);
      expect(resultado.conformeRNF03).toBe(false);
      expect(resultado.nivelUsabilidade).toBe('NAO_CONFORME');
    });
  });

  describe('6. Instância Singleton', () => {
    it('deve exportar instância singleton acoesRapidasService', () => {
      expect(acoesRapidasService).toBeInstanceOf(AcoesRapidasService);
    });
  });
});
