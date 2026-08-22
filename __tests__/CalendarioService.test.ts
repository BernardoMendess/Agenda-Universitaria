import { CalendarioService } from '../src/servicos/CalendarioService';
import { Avaliacao } from '../src/modelos/Avaliacao';
import { Tarefa } from '../src/modelos/Tarefa';
import { GradeSemanal } from '../src/servicos/GradeHorariaService';
import { EventoAcademico } from '../src/modelos/EventoAcademico';
import { Disciplina } from '../src/modelos/Disciplina';

describe('CalendarioService (RF09 - Calendário Integrado)', () => {
  let service: CalendarioService;

  beforeEach(() => {
    service = new CalendarioService();
  });

  describe('Funções Utilitárias de Datas', () => {
    it('deve converter Date para string ISO "YYYY-MM-DD" local', () => {
      const data = new Date(2026, 7, 22); // 22 de Agosto de 2026 (mês 7 = Agosto)
      expect(service.converterDateParaStringISO(data)).toBe('2026-08-22');
    });

    it('deve converter string "YYYY-MM-DD" para Date com horário zerado', () => {
      const data = service.converterStringParaDate('2026-08-22');
      expect(data.getFullYear()).toBe(2026);
      expect(data.getMonth()).toBe(7);
      expect(data.getDate()).toBe(22);
      expect(data.getHours()).toBe(0);
    });

    it('deve converter Date para DiaSemana corretamente', () => {
      // 2026-08-22 é Sábado
      const dataSabado = new Date(2026, 7, 22);
      expect(service.converterDateParaDiaSemana(dataSabado)).toBe('SABADO');

      // 2026-08-23 é Domingo
      const dataDomingo = new Date(2026, 7, 23);
      expect(service.converterDateParaDiaSemana(dataDomingo)).toBe('DOMINGO');

      // 2026-08-24 é Segunda
      const dataSegunda = new Date(2026, 7, 24);
      expect(service.converterDateParaDiaSemana(dataSegunda)).toBe('SEGUNDA');
    });

    it('deve formatar mês e ano por extenso', () => {
      expect(service.obterNomeMesAno(2026, 7)).toBe('Agosto de 2026');
      expect(service.obterNomeMesAno(2026, 0)).toBe('Janeiro de 2026');
    });

    it('deve formatar data completa por extenso', () => {
      expect(service.formatarDataExtenso('2026-08-22')).toBe(
        '22 de Agosto de 2026'
      );
    });
  });

  describe('Unificação de Eventos de Múltiplas Fontes', () => {
    const disciplinas: Disciplina[] = [
      {
        id: 'disc_1',
        nome: 'Cálculo I',
        codigo: 'MAT101',
        limiteMaximoFaltas: 10,
        corIdentificacao: '#6366f1',
        dataCriacao: '2026-01-01',
        dataAtualizacao: '2026-01-01',
      },
      {
        id: 'disc_2',
        nome: 'Algoritmos',
        codigo: 'CC101',
        limiteMaximoFaltas: 8,
        corIdentificacao: '#10b981',
        dataCriacao: '2026-01-01',
        dataAtualizacao: '2026-01-01',
      },
    ];

    const avaliacoes: Avaliacao[] = [
      {
        id: 'aval_1',
        disciplinaId: 'disc_1',
        titulo: 'Prova 1 - Limites e Derivadas',
        tipo: 'PROVA',
        data: '2026-08-25',
        horario: '08:00',
        peso: 2,
        notaMaxima: 10,
        nota: null,
        dataCriacao: '2026-01-01',
        dataAtualizacao: '2026-01-01',
      },
    ];

    const tarefas: Tarefa[] = [
      {
        id: 'tar_1',
        disciplinaId: 'disc_2',
        titulo: 'Entrega da Lista de Exercícios 1',
        concluida: false,
        dataLimite: '2026-08-26',
        horarioLimite: '23:59',
        prioridade: 'ALTA',
        dataCriacao: '2026-01-01',
        dataAtualizacao: '2026-01-01',
      },
      {
        id: 'tar_sem_prazo',
        titulo: 'Estudar tópicos extras',
        concluida: false,
        prioridade: 'BAIXA',
        dataCriacao: '2026-01-01',
        dataAtualizacao: '2026-01-01',
      },
    ];

    const gradeSemanal: GradeSemanal = {
      SEGUNDA: [
        {
          id: 'hor_1',
          disciplinaId: 'disc_1',
          nomeDisciplina: 'Cálculo I',
          corIdentificacao: '#6366f1',
          diaSemana: 'SEGUNDA',
          horarioInicio: '08:00',
          horarioFim: '09:40',
          localSala: 'Sala 101',
        },
      ],
      TERCA: [],
      QUARTA: [
        {
          id: 'hor_2',
          disciplinaId: 'disc_2',
          nomeDisciplina: 'Algoritmos',
          corIdentificacao: '#10b981',
          diaSemana: 'QUARTA',
          horarioInicio: '10:00',
          horarioFim: '11:40',
          localSala: 'Lab 3',
        },
      ],
      QUINTA: [],
      SEXTA: [],
      SABADO: [],
      DOMINGO: [],
    };

    const eventosAcademicos: EventoAcademico[] = [
      {
        id: 'eve_1',
        titulo: 'Palestra de Abertura do Semestre',
        data: '2026-08-24',
        horarioInicio: '14:00',
        horarioFim: '16:00',
        local: 'Auditório Principal',
        cor: '#f59e0b',
        dataCriacao: '2026-01-01',
        dataAtualizacao: '2026-01-01',
      },
    ];

    it('deve unificar avaliações, tarefas com prazo, expansão de grade horária e eventos avulsos', () => {
      // Período: 2026-08-24 (Segunda) até 2026-08-30 (Domingo)
      const itens = service.unificarEventos(
        avaliacoes,
        tarefas,
        gradeSemanal,
        eventosAcademicos,
        '2026-08-24',
        '2026-08-30',
        disciplinas
      );

      // Deve conter:
      // - 1 aula na Segunda (2026-08-24)
      // - 1 evento na Segunda (2026-08-24)
      // - 1 prova na Terça (2026-08-25)
      // - 1 aula na Quarta (2026-08-26)
      // - 1 tarefa na Quarta (2026-08-26)
      // Total = 5 itens (tarefa sem prazo é ignorada no calendário com data fixa)
      expect(itens.length).toBe(5);

      const prova = itens.find((i) => i.categoria === 'PROVAS');
      expect(prova).toBeDefined();
      expect(prova?.titulo).toBe('Prova 1 - Limites e Derivadas');
      expect(prova?.data).toBe('2026-08-25');
      expect(prova?.disciplinaNome).toBe('Cálculo I');

      const entrega = itens.find((i) => i.categoria === 'ENTREGAS');
      expect(entrega).toBeDefined();
      expect(entrega?.titulo).toBe('Entrega da Lista de Exercícios 1');
      expect(entrega?.data).toBe('2026-08-26');
      expect(entrega?.prioridadeTarefa).toBe('ALTA');

      const aulas = itens.filter((i) => i.categoria === 'AULAS');
      expect(aulas.length).toBe(2);
      expect(aulas[0].data).toBe('2026-08-24');
      expect(aulas[1].data).toBe('2026-08-26');

      const evento = itens.find((i) => i.categoria === 'EVENTOS');
      expect(evento).toBeDefined();
      expect(evento?.titulo).toBe('Palestra de Abertura do Semestre');
      expect(evento?.data).toBe('2026-08-24');
    });

    it('deve agrupar eventos por data e ordenar cronologicamente dentro do dia', () => {
      const itens = service.unificarEventos(
        avaliacoes,
        tarefas,
        gradeSemanal,
        eventosAcademicos,
        '2026-08-24',
        '2026-08-30',
        disciplinas
      );

      const agrupados = service.agruparEventosPorData(itens);

      expect(Object.keys(agrupados)).toContain('2026-08-24');
      expect(Object.keys(agrupados)).toContain('2026-08-25');
      expect(Object.keys(agrupados)).toContain('2026-08-26');

      // No dia 2026-08-24 temos a aula (08:00) e a palestra (14:00)
      const dia24 = agrupados['2026-08-24'];
      expect(dia24.length).toBe(2);
      expect(dia24[0].horarioInicio).toBe('08:00'); // Aula primeiro
      expect(dia24[1].horarioInicio).toBe('14:00'); // Palestra depois
    });

    it('deve filtrar eventos por categoria e por disciplina', () => {
      const itens = service.unificarEventos(
        avaliacoes,
        tarefas,
        gradeSemanal,
        eventosAcademicos,
        '2026-08-24',
        '2026-08-30',
        disciplinas
      );

      // Filtro por categoria PROVAS
      const apenasProvas = service.filtrarEventos(itens, 'PROVAS');
      expect(apenasProvas.length).toBe(1);
      expect(apenasProvas[0].categoria).toBe('PROVAS');

      // Filtro por disciplina Cálculo I (disc_1)
      const apenasCalculo = service.filtrarEventos(itens, 'TODOS', 'disc_1');
      expect(
        apenasCalculo.every((i) => i.disciplinaId === 'disc_1')
      ).toBe(true);
      expect(apenasCalculo.length).toBe(2); // 1 aula e 1 prova
    });
  });

  describe('Geração de Matriz Mensal', () => {
    it('deve gerar matriz mensal com dias do mês anterior e posterior preenchendo semanas cheias', () => {
      // Agosto de 2026: 1 de Agosto é Sábado. Mês tem 31 dias.
      const matriz = service.gerarMatrizMes(2026, 7, {}, new Date(2026, 7, 22));

      // Deve ser múltiplo de 7
      expect(matriz.length % 7).toBe(0);
      expect(matriz.length).toBeGreaterThanOrEqual(35);

      // Primeiro dia da matriz deve ser Domingo (26 de Julho de 2026)
      expect(matriz[0].diaSemana).toBe('DOMINGO');
      expect(matriz[0].ehMesAtual).toBe(false);

      // Dia 22 de Agosto deve estar marcado como hoje
      const dia22 = matriz.find((d) => d.dataStr === '2026-08-22');
      expect(dia22).toBeDefined();
      expect(dia22?.ehHoje).toBe(true);
      expect(dia22?.ehMesAtual).toBe(true);
    });
  });

  describe('Geração de Estrutura Semanal', () => {
    it('deve gerar os 7 dias exatos da semana a partir de uma data de referência', () => {
      // 2026-08-22 (Sábado)
      const semana = service.gerarSemana(
        '2026-08-22',
        {},
        new Date(2026, 7, 22)
      );

      expect(semana.dias.length).toBe(7);
      expect(semana.dias[0].diaSemana).toBe('DOMINGO');
      expect(semana.dias[0].dataStr).toBe('2026-08-16');
      expect(semana.dias[6].diaSemana).toBe('SABADO');
      expect(semana.dias[6].dataStr).toBe('2026-08-22');
      expect(semana.dias[6].ehHoje).toBe(true);
    });
  });

  describe('Cálculo de Estatísticas', () => {
    it('deve totalizar corretamente os tipos de itens', () => {
      const itens: any[] = [
        { categoria: 'PROVAS' },
        { categoria: 'PROVAS' },
        { categoria: 'ENTREGAS' },
        { categoria: 'AULAS' },
        { categoria: 'EVENTOS' },
      ];

      const stats = service.calcularEstatisticas(itens);
      expect(stats.totalItens).toBe(5);
      expect(stats.totalProvas).toBe(2);
      expect(stats.totalEntregas).toBe(1);
      expect(stats.totalAulas).toBe(1);
      expect(stats.totalEventos).toBe(1);
    });
  });
});
