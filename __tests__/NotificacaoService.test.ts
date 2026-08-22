import { NotificacaoService } from '../src/servicos/NotificacaoService';
import { ConfiguracaoNotificacaoRepositorioEmMemoria } from '../src/servicos/banco/ConfiguracaoNotificacaoRepositorio';
import { NotificacaoAgendadaRepositorioEmMemoria } from '../src/servicos/banco/NotificacaoAgendadaRepositorio';
import { INotificadorLocal } from '../src/servicos/notificacoes/NotificadorLocalDriver';
import { Disciplina } from '../src/modelos/Disciplina';
import { HorarioAula } from '../src/modelos/HorarioAula';
import { Avaliacao } from '../src/modelos/Avaliacao';
import { Tarefa } from '../src/modelos/Tarefa';
import { ResumoFrequencia } from '../src/modelos/Falta';

describe('NotificacaoService (RF10 — Notificações Locais e Alarmes)', () => {
  let service: NotificacaoService;
  let configRepo: ConfiguracaoNotificacaoRepositorioEmMemoria;
  let notifRepo: NotificacaoAgendadaRepositorioEmMemoria;
  let notificadorMock: jest.Mocked<INotificadorLocal>;

  beforeEach(() => {
    configRepo = new ConfiguracaoNotificacaoRepositorioEmMemoria();
    notifRepo = new NotificacaoAgendadaRepositorioEmMemoria();

    notificadorMock = {
      agendar: jest.fn().mockImplementation(async (n) => n.id),
      cancelar: jest.fn().mockResolvedValue(true),
      cancelarTodos: jest.fn().mockResolvedValue(undefined),
      dispararImediato: jest.fn().mockResolvedValue(undefined),
      emitirAlertaCritico: jest.fn().mockResolvedValue(undefined),
      emitirFeedbackTátil: jest.fn(),
    };

    service = new NotificacaoService(configRepo, notifRepo, notificadorMock);
  });

  describe('Gestão de Configurações de Notificações', () => {
    it('deve obter as configurações padrão iniciais', async () => {
      const config = await service.obterConfiguracao();

      expect(config.aulasAtivas).toBe(true);
      expect(config.antecedenciaAulaMinutos).toBe(15);
      expect(config.avaliacoesAtivas).toBe(true);
      expect(config.antecedenciaAvaliacoesHoras).toEqual([24, 2]);
      expect(config.tarefasAtivas).toBe(true);
      expect(config.antecedenciaTarefasHoras).toEqual([24, 2]);
      expect(config.alertaFaltasAtivo).toBe(true);
      expect(config.somHabilitado).toBe(true);
      expect(config.vibracaoHabilitada).toBe(true);
    });

    it('deve atualizar preferências de notificações', async () => {
      const atualizada = await service.atualizarConfiguracao({
        antecedenciaAulaMinutos: 30,
        somHabilitado: false,
      });

      expect(atualizada.antecedenciaAulaMinutos).toBe(30);
      expect(atualizada.somHabilitado).toBe(false);
      expect(atualizada.aulasAtivas).toBe(true); // manteve as demais
    });

    it('deve restaurar configurações padrão', async () => {
      await service.atualizarConfiguracao({
        aulasAtivas: false,
        antecedenciaAulaMinutos: 45,
      });

      const restaurada = await service.restaurarConfiguracaoPadrao();

      expect(restaurada.aulasAtivas).toBe(true);
      expect(restaurada.antecedenciaAulaMinutos).toBe(15);
    });
  });

  describe('Lembretes de Aulas (Grade Horária)', () => {
    const disciplinas: Disciplina[] = [
      {
        id: 'disc_1',
        nome: 'Cálculo I',
        codigo: 'MAT101',
        localSala: 'Sala 101',
        corIdentificacao: '#6366f1',
        limiteMaximoFaltas: 10,
        criterioAprovacao: 'ARITMETICA',
        dataCriacao: '2026-01-01',
        dataAtualizacao: '2026-01-01',
      },
    ];

    const horarios: HorarioAula[] = [
      {
        id: 'hor_1',
        disciplinaId: 'disc_1',
        diaSemana: 'SEGUNDA',
        horarioInicio: '08:00',
        horarioFim: '09:40',
        localSala: 'Lab A',
      },
    ];

    it('deve agendar lembrete com antecedência correta de 15 minutos', async () => {
      const agendadas = await service.agendarLembretesAulas(horarios, disciplinas, 15);

      expect(agendadas).toHaveLength(1);
      expect(agendadas[0].tipo).toBe('AULA');
      expect(agendadas[0].titulo).toBe('Aula de Cálculo I');
      expect(agendadas[0].antecedenciaMinutos).toBe(15);
      expect(agendadas[0].diaSemana).toBe('SEGUNDA');
      expect(agendadas[0].mensagem).toContain('08:00');
      expect(agendadas[0].mensagem).toContain('Lab A');
      expect(notificadorMock.agendar).toHaveBeenCalledTimes(1);
    });

    it('não deve agendar se aulas estiverem desativadas nas configurações', async () => {
      await service.atualizarConfiguracao({ aulasAtivas: false });

      const agendadas = await service.agendarLembretesAulas(horarios, disciplinas);

      expect(agendadas).toHaveLength(0);
      expect(notificadorMock.agendar).not.toHaveBeenCalled();
    });
  });

  describe('Lembretes de Avaliações (Provas, Trabalhos)', () => {
    const avaliacaoPendente: Avaliacao = {
      id: 'aval_1',
      disciplinaId: 'disc_1',
      titulo: 'Prova 1',
      tipo: 'PROVA',
      data: '2026-09-10',
      horario: '10:00',
      peso: 2,
      notaMaxima: 10,
      nota: null,
      dataCriacao: '2026-01-01',
      dataAtualizacao: '2026-01-01',
    };

    it('deve agendar múltiplos lembretes para avaliação pendente (24h e 2h antes)', async () => {
      const agendadas = await service.agendarLembretesAvaliacao(
        avaliacaoPendente,
        'Cálculo I',
        '#6366f1',
        [24, 2]
      );

      expect(agendadas).toHaveLength(2);
      expect(agendadas[0].antecedenciaHoras).toBe(24);
      expect(agendadas[0].tipo).toBe('AVALIACAO');
      expect(agendadas[0].titulo).toBe('Prova de Cálculo I');

      expect(agendadas[1].antecedenciaHoras).toBe(2);
      expect(agendadas[1].prioridade).toBe('ALTA');
      expect(notificadorMock.agendar).toHaveBeenCalledTimes(2);
    });

    it('não deve agendar se a avaliação já possui nota lançada', async () => {
      const avaliacaoConcluida: Avaliacao = {
        ...avaliacaoPendente,
        nota: 8.5,
      };

      const agendadas = await service.agendarLembretesAvaliacao(
        avaliacaoConcluida,
        'Cálculo I'
      );

      expect(agendadas).toHaveLength(0);
      expect(notificadorMock.agendar).not.toHaveBeenCalled();
    });

    it('não deve agendar se avaliações estiverem desativadas nas configurações', async () => {
      await service.atualizarConfiguracao({ avaliacoesAtivas: false });

      const agendadas = await service.agendarLembretesAvaliacao(
        avaliacaoPendente,
        'Cálculo I'
      );

      expect(agendadas).toHaveLength(0);
    });
  });

  describe('Lembretes de Tarefas (To-Do)', () => {
    const tarefaPendente: Tarefa = {
      id: 'tar_1',
      disciplinaId: 'disc_1',
      titulo: 'Lista de Exercícios 1',
      concluida: false,
      dataLimite: '2026-09-05',
      horarioLimite: '23:59',
      prioridade: 'ALTA',
      dataCriacao: '2026-01-01',
      dataAtualizacao: '2026-01-01',
    };

    it('deve agendar lembretes com antecedência para tarefas pendentes', async () => {
      const agendadas = await service.agendarLembretesTarefa(
        tarefaPendente,
        'Cálculo I',
        '#6366f1',
        [24, 2]
      );

      expect(agendadas).toHaveLength(2);
      expect(agendadas[0].tipo).toBe('TAREFA');
      expect(agendadas[0].mensagem).toContain('Lista de Exercícios 1');
      expect(notificadorMock.agendar).toHaveBeenCalledTimes(2);
    });

    it('não deve agendar lembretes para tarefa já concluída', async () => {
      const tarefaConcluida: Tarefa = {
        ...tarefaPendente,
        concluida: true,
      };

      const agendadas = await service.agendarLembretesTarefa(
        tarefaConcluida,
        'Cálculo I'
      );

      expect(agendadas).toHaveLength(0);
      expect(notificadorMock.agendar).not.toHaveBeenCalled();
    });

    it('não deve agendar se tarefa não tiver data limite', async () => {
      const tarefaSemData: Tarefa = {
        ...tarefaPendente,
        dataLimite: undefined,
      };

      const agendadas = await service.agendarLembretesTarefa(
        tarefaSemData,
        'Cálculo I'
      );

      expect(agendadas).toHaveLength(0);
    });
  });

  describe('Alerta Crítico Imediato de Limite de Faltas (RF10)', () => {
    const disciplinaComLimite: Disciplina = {
      id: 'disc_1',
      nome: 'Estruturas de Dados',
      limiteMaximoFaltas: 4,
      corIdentificacao: '#6366f1',
      criterioAprovacao: 'ARITMETICA',
      dataCriacao: '2026-01-01',
      dataAtualizacao: '2026-01-01',
    };

    it('deve disparar alerta crítico sonoro e tátil quando o limite é atingido (faltasRestantes === 0)', async () => {
      const resumo: ResumoFrequencia = {
        disciplinaId: 'disc_1',
        totalFaltas: 4,
        limiteMaximoFaltas: 4,
        presencaObrigatoria: true,
        faltasRestantes: 0,
        percentualConsumido: 100,
        status: 'CRITICO',
        reprovadoPorFalta: true,
      };

      const resultado = await service.verificarEDispararAlertaFaltas(
        disciplinaComLimite,
        resumo
      );

      expect(resultado.disparouAlerta).toBe(true);
      expect(resultado.mensagem).toContain('Estruturas de Dados');
      expect(notificadorMock.emitirAlertaCritico).toHaveBeenCalledTimes(1);

      // Deve ter salvo notificação no repositório com prioridade CRITICA
      const salvas = await notifRepo.listarPorTipo('LIMITE_FALTAS');
      expect(salvas).toHaveLength(1);
      expect(salvas[0].prioridade).toBe('CRITICA');
    });

    it('não deve disparar alerta se faltas restantes for maior que zero', async () => {
      const resumo: ResumoFrequencia = {
        disciplinaId: 'disc_1',
        totalFaltas: 2,
        limiteMaximoFaltas: 4,
        presencaObrigatoria: true,
        faltasRestantes: 2,
        percentualConsumido: 50,
        status: 'MODERADO',
        reprovadoPorFalta: false,
      };

      const resultado = await service.verificarEDispararAlertaFaltas(
        disciplinaComLimite,
        resumo
      );

      expect(resultado.disparouAlerta).toBe(false);
      expect(notificadorMock.emitirAlertaCritico).not.toHaveBeenCalled();
    });

    it('não deve disparar alerta para disciplina com presença facultativa (limite null)', async () => {
      const disciplinaFacultativa: Disciplina = {
        ...disciplinaComLimite,
        limiteMaximoFaltas: null,
      };

      const resumo: ResumoFrequencia = {
        disciplinaId: 'disc_1',
        totalFaltas: 5,
        limiteMaximoFaltas: null,
        presencaObrigatoria: false,
        faltasRestantes: null,
        percentualConsumido: 0,
        status: 'SEGURO',
        reprovadoPorFalta: false,
      };

      const resultado = await service.verificarEDispararAlertaFaltas(
        disciplinaFacultativa,
        resumo
      );

      expect(resultado.disparouAlerta).toBe(false);
      expect(notificadorMock.emitirAlertaCritico).not.toHaveBeenCalled();
    });
  });

  describe('Sincronização em Lote e Estatísticas', () => {
    it('deve sincronizar todas as notificações e calcular estatísticas consolidadas', async () => {
      const disciplinas: Disciplina[] = [
        {
          id: 'disc_1',
          nome: 'Cálculo I',
          limiteMaximoFaltas: 4,
          corIdentificacao: '#6366f1',
          criterioAprovacao: 'ARITMETICA',
          dataCriacao: '2026-01-01',
          dataAtualizacao: '2026-01-01',
        },
      ];

      const horarios: HorarioAula[] = [
        {
          id: 'h1',
          disciplinaId: 'disc_1',
          diaSemana: 'SEGUNDA',
          horarioInicio: '08:00',
          horarioFim: '09:40',
        },
      ];

      const avaliacoes: Avaliacao[] = [
        {
          id: 'a1',
          disciplinaId: 'disc_1',
          titulo: 'Prova 1',
          tipo: 'PROVA',
          data: '2026-09-15',
          peso: 1,
          notaMaxima: 10,
          nota: null,
          dataCriacao: '2026-01-01',
          dataAtualizacao: '2026-01-01',
        },
      ];

      const tarefas: Tarefa[] = [
        {
          id: 't1',
          disciplinaId: 'disc_1',
          titulo: 'Trabalho Prático',
          concluida: false,
          dataLimite: '2026-09-12',
          prioridade: 'MEDIA',
          dataCriacao: '2026-01-01',
          dataAtualizacao: '2026-01-01',
        },
      ];

      const stats = await service.sincronizarTodasNotificacoes(
        disciplinas,
        horarios,
        avaliacoes,
        tarefas
      );

      expect(stats.totalAulas).toBe(1);
      expect(stats.totalAvaliacoes).toBe(2); // 24h e 2h
      expect(stats.totalTarefas).toBe(2); // 24h e 2h
      expect(stats.totalAgendadas).toBe(5);
      expect(stats.alertaFaltasAtivo).toBe(true);
    });

    it('deve cancelar lembretes de uma entidade ao chamar cancelarLembretesPorReferencia', async () => {
      await notifRepo.salvar({
        tipo: 'AVALIACAO',
        titulo: 'Prova',
        mensagem: 'msg',
        referenciaId: 'aval_99',
      });

      expect(await notifRepo.listarTodas()).toHaveLength(1);

      const removidos = await service.cancelarLembretesPorReferencia('aval_99');

      expect(removidos).toBe(1);
      expect(await notifRepo.listarTodas()).toHaveLength(0);
      expect(notificadorMock.cancelar).toHaveBeenCalled();
    });
  });
});
