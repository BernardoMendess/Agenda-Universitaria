import { DashboardService } from '../src/servicos/DashboardService';
import { Disciplina } from '../src/modelos/Disciplina';
import { AulaGradeItem } from '../src/servicos/GradeHorariaService';
import { ResumoFrequencia } from '../src/modelos/Falta';
import { ResumoDesempenhoDisciplina } from '../src/modelos/Avaliacao';
import { EstatisticasTarefas } from '../src/modelos/Tarefa';

describe('DashboardService - RF08 (Dashboard Inicial)', () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService();
  });

  describe('horaParaMinutos e obterHoraAtualString', () => {
    it('deve converter corretamente horário HH:mm para minutos do dia', () => {
      expect(service.horaParaMinutos('00:00')).toBe(0);
      expect(service.horaParaMinutos('08:30')).toBe(510);
      expect(service.horaParaMinutos('14:45')).toBe(885);
      expect(service.horaParaMinutos('23:59')).toBe(1439);
    });

    it('deve retornar 0 para horários com formato inválido', () => {
      expect(service.horaParaMinutos('')).toBe(0);
      expect(service.horaParaMinutos('invalid')).toBe(0);
      expect(service.horaParaMinutos('25:00')).toBe(0);
    });
  });

  describe('calcularStatusMomentoAula', () => {
    it('deve identificar aula EM_ANDAMENTO quando a hora atual está dentro do intervalo', () => {
      const resultado = service.calcularStatusMomentoAula('08:00', '10:00', '09:00');
      expect(resultado.statusMomento).toBe('EM_ANDAMENTO');
      expect(resultado.minutosParaInicio).toBe(-60);
      expect(resultado.minutosParaFim).toBe(60);
    });

    it('deve identificar aula FUTURA quando a hora atual é anterior ao início', () => {
      const resultado = service.calcularStatusMomentoAula('14:00', '16:00', '10:00');
      expect(resultado.statusMomento).toBe('FUTURA');
      expect(resultado.minutosParaInicio).toBe(240);
      expect(resultado.minutosParaFim).toBe(360);
    });

    it('deve identificar aula ENCERRADA quando a hora atual é posterior ao término', () => {
      const resultado = service.calcularStatusMomentoAula('08:00', '10:00', '11:00');
      expect(resultado.statusMomento).toBe('ENCERRADA');
      expect(resultado.minutosParaInicio).toBe(-180);
      expect(resultado.minutosParaFim).toBe(-60);
    });
  });

  describe('processarAulasDeHoje', () => {
    const aulasMock: AulaGradeItem[] = [
      {
        id: 'aula-3',
        disciplinaId: 'd3',
        nomeDisciplina: 'Sistemas Operacionais',
        corIdentificacao: '#3b82f6',
        diaSemana: 'SEGUNDA',
        horarioInicio: '19:00',
        horarioFim: '21:00',
        localSala: 'Lab 2',
      },
      {
        id: 'aula-1',
        disciplinaId: 'd1',
        nomeDisciplina: 'Cálculo I',
        corIdentificacao: '#6366f1',
        diaSemana: 'SEGUNDA',
        horarioInicio: '08:00',
        horarioFim: '10:00',
        localSala: 'Sala 101',
      },
      {
        id: 'aula-2',
        disciplinaId: 'd2',
        nomeDisciplina: 'Estrutura de Dados',
        corIdentificacao: '#10b981',
        diaSemana: 'SEGUNDA',
        horarioInicio: '10:15',
        horarioFim: '12:00',
        localSala: 'Sala 102',
      },
    ];

    it('deve ordenar aulas cronologicamente e destacar a PROXIMA aula', () => {
      // Hora atual: 09:30 (Cálculo I está EM_ANDAMENTO, Estrutura de Dados é PROXIMA, SO é FUTURA)
      const resultado = service.processarAulasDeHoje(aulasMock, '09:30');

      expect(resultado).toHaveLength(3);
      expect(resultado[0].nomeDisciplina).toBe('Cálculo I');
      expect(resultado[0].statusMomento).toBe('EM_ANDAMENTO');

      expect(resultado[1].nomeDisciplina).toBe('Estrutura de Dados');
      expect(resultado[1].statusMomento).toBe('PROXIMA');

      expect(resultado[2].nomeDisciplina).toBe('Sistemas Operacionais');
      expect(resultado[2].statusMomento).toBe('FUTURA');
    });

    it('deve marcar todas como ENCERRADAS se a hora for posterior a todas as aulas', () => {
      const resultado = service.processarAulasDeHoje(aulasMock, '22:00');
      expect(resultado.every((a) => a.statusMomento === 'ENCERRADA')).toBe(true);
    });
  });

  describe('identificarMateriasEmAlerta (Faltas e Notas Baixas)', () => {
    const disciplinas: Disciplina[] = [
      {
        id: 'd1',
        nome: 'Cálculo I',
        codigo: 'MAT101',
        limiteMaximoFaltas: 4,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#6366f1',
        dataCriacao: '2026-01-01',
      },
      {
        id: 'd2',
        nome: 'Segurança da Informação',
        codigo: 'SEG201',
        limiteMaximoFaltas: 0, // Limite zero
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#ef4444',
        dataCriacao: '2026-01-01',
      },
      {
        id: 'd3',
        nome: 'Física I',
        codigo: 'FIS101',
        limiteMaximoFaltas: 8,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#10b981',
        dataCriacao: '2026-01-01',
      },
    ];

    it('deve retornar lista vazia se todas as matérias estão com situação regular', () => {
      const resumosFreq: Record<string, ResumoFrequencia> = {
        d1: {
          disciplinaId: 'd1',
          totalFaltas: 1,
          limiteMaximoFaltas: 4,
          faltasRestantes: 3,
          percentualConsumido: 25,
          status: 'SEGURO',
          reprovadoPorFalta: false,
        },
        d2: {
          disciplinaId: 'd2',
          totalFaltas: 0,
          limiteMaximoFaltas: 0,
          faltasRestantes: 0,
          percentualConsumido: 0,
          status: 'SEGURO',
          reprovadoPorFalta: false,
        },
        d3: {
          disciplinaId: 'd3',
          totalFaltas: 2,
          limiteMaximoFaltas: 8,
          faltasRestantes: 6,
          percentualConsumido: 25,
          status: 'SEGURO',
          reprovadoPorFalta: false,
        },
      };

      const resumosNotas: Record<string, ResumoDesempenhoDisciplina> = {
        d1: {
          disciplinaId: 'd1',
          mediaAtual: 8.0,
          totalAvaliacoes: 2,
          avaliacoesLancadas: 2,
          avaliacoesPendentes: 0,
          notaMinimaAprovacao: 6.0,
          projecaoNotaNecessaria: null,
          statusAprovacao: 'APROVADO',
          mensagemProjecao: 'Aprovado!',
        },
        d2: {
          disciplinaId: 'd2',
          mediaAtual: 7.5,
          totalAvaliacoes: 2,
          avaliacoesLancadas: 1,
          avaliacoesPendentes: 1,
          notaMinimaAprovacao: 6.0,
          projecaoNotaNecessaria: 4.5,
          statusAprovacao: 'EM_CURSO',
          mensagemProjecao: 'Em curso',
        },
        d3: {
          disciplinaId: 'd3',
          mediaAtual: null,
          totalAvaliacoes: 0,
          avaliacoesLancadas: 0,
          avaliacoesPendentes: 0,
          notaMinimaAprovacao: 6.0,
          projecaoNotaNecessaria: null,
          statusAprovacao: 'EM_CURSO',
          mensagemProjecao: 'Sem avaliações',
        },
      };

      const alertas = service.identificarMateriasEmAlerta(
        disciplinas,
        resumosFreq,
        resumosNotas
      );

      expect(alertas).toEqual([]);
    });

    it('deve identificar matéria com falta em limite zero como CRITICO e tipo FALTA', () => {
      const resumosFreq: Record<string, ResumoFrequencia> = {
        d2: {
          disciplinaId: 'd2',
          totalFaltas: 1,
          limiteMaximoFaltas: 0,
          faltasRestantes: 0,
          percentualConsumido: 100,
          status: 'CRITICO',
          reprovadoPorFalta: true,
        },
      };

      const alertas = service.identificarMateriasEmAlerta(
        [disciplinas[1]],
        resumosFreq,
        {}
      );

      expect(alertas).toHaveLength(1);
      expect(alertas[0].disciplinaNome).toBe('Segurança da Informação');
      expect(alertas[0].nivelGravidade).toBe('CRITICO');
      expect(alertas[0].tipoAlerta).toBe('FALTA');
      expect(alertas[0].motivosFalta[0]).toContain('Limite Zero');
    });

    it('deve identificar matéria com >= 75% do limite de faltas como ALERTA', () => {
      const resumosFreq: Record<string, ResumoFrequencia> = {
        d1: {
          disciplinaId: 'd1',
          totalFaltas: 3,
          limiteMaximoFaltas: 4,
          faltasRestantes: 1,
          percentualConsumido: 75,
          status: 'ALERTA',
          reprovadoPorFalta: false,
        },
      };

      const alertas = service.identificarMateriasEmAlerta(
        [disciplinas[0]],
        resumosFreq,
        {}
      );

      expect(alertas).toHaveLength(1);
      expect(alertas[0].nivelGravidade).toBe('ALERTA');
      expect(alertas[0].tipoAlerta).toBe('FALTA');
      expect(alertas[0].motivosFalta[0]).toContain('restam apenas 1 falta(s)');
    });

    it('deve identificar matéria com notas em risco (EM_RISCO) como ALERTA de NOTA', () => {
      const resumosNotas: Record<string, ResumoDesempenhoDisciplina> = {
        d1: {
          disciplinaId: 'd1',
          mediaAtual: 4.0,
          totalAvaliacoes: 2,
          avaliacoesLancadas: 1,
          avaliacoesPendentes: 1,
          notaMinimaAprovacao: 6.0,
          projecaoNotaNecessaria: 8.0,
          statusAprovacao: 'EM_RISCO',
          mensagemProjecao: 'Precisa de 8.0 na próxima',
        },
      };

      const alertas = service.identificarMateriasEmAlerta(
        [disciplinas[0]],
        {},
        resumosNotas
      );

      expect(alertas).toHaveLength(1);
      expect(alertas[0].tipoAlerta).toBe('NOTA');
      expect(alertas[0].nivelGravidade).toBe('ALERTA');
      expect(alertas[0].motivosNota[0]).toContain('precisa de média 8.0');
    });

    it('deve identificar matéria com alerta simultâneo de faltas e notas como AMBOS', () => {
      const resumosFreq: Record<string, ResumoFrequencia> = {
        d1: {
          disciplinaId: 'd1',
          totalFaltas: 4,
          limiteMaximoFaltas: 4,
          faltasRestantes: 0,
          percentualConsumido: 100,
          status: 'CRITICO',
          reprovadoPorFalta: true,
        },
      };

      const resumosNotas: Record<string, ResumoDesempenhoDisciplina> = {
        d1: {
          disciplinaId: 'd1',
          mediaAtual: 3.0,
          totalAvaliacoes: 2,
          avaliacoesLancadas: 2,
          avaliacoesPendentes: 0,
          notaMinimaAprovacao: 6.0,
          projecaoNotaNecessaria: null,
          statusAprovacao: 'REPROVADO_POR_NOTA',
          mensagemProjecao: 'Reprovado por nota',
        },
      };

      const alertas = service.identificarMateriasEmAlerta(
        [disciplinas[0]],
        resumosFreq,
        resumosNotas
      );

      expect(alertas).toHaveLength(1);
      expect(alertas[0].tipoAlerta).toBe('AMBOS');
      expect(alertas[0].nivelGravidade).toBe('CRITICO');
      expect(alertas[0].motivosFalta).toHaveLength(1);
      expect(alertas[0].motivosNota).toHaveLength(1);
    });

    it('deve ordenar priorizando CRITICO antes de ALERTA', () => {
      const resumosFreq: Record<string, ResumoFrequencia> = {
        d1: {
          disciplinaId: 'd1',
          totalFaltas: 3,
          limiteMaximoFaltas: 4,
          faltasRestantes: 1,
          percentualConsumido: 75,
          status: 'ALERTA',
          reprovadoPorFalta: false,
        },
        d2: {
          disciplinaId: 'd2',
          totalFaltas: 1,
          limiteMaximoFaltas: 0,
          faltasRestantes: 0,
          percentualConsumido: 100,
          status: 'CRITICO',
          reprovadoPorFalta: true,
        },
      };

      const alertas = service.identificarMateriasEmAlerta(
        disciplinas,
        resumosFreq,
        {}
      );

      expect(alertas).toHaveLength(2);
      expect(alertas[0].disciplinaNome).toBe('Segurança da Informação'); // CRITICO vem primeiro
      expect(alertas[0].nivelGravidade).toBe('CRITICO');
      expect(alertas[1].disciplinaNome).toBe('Cálculo I');
      expect(alertas[1].nivelGravidade).toBe('ALERTA');
    });
  });

  describe('calcularMetricasDashboard', () => {
    it('deve consolidar as métricas gerais com precisão', () => {
      const metricas = service.calcularMetricasDashboard(
        [{ id: '1' }, { id: '2' }] as any,
        [{ id: 'a1' }] as any,
        {
          total: 5,
          pendentes: 3,
          concluidas: 2,
          atrasadas: 1,
          hoje: 2,
          percentualConclusao: 40,
        },
        [{ disciplinaId: '1' }] as any,
        4
      );

      expect(metricas.totalDisciplinas).toBe(2);
      expect(metricas.aulasHoje).toBe(1);
      expect(metricas.tarefasPendentes).toBe(3);
      expect(metricas.tarefasAtrasadas).toBe(1);
      expect(metricas.materiasEmAlerta).toBe(1);
      expect(metricas.proximasAvaliacoes).toBe(4);
    });
  });

  describe('formatarDataExtenso', () => {
    it('deve formatar data em português por extenso', () => {
      const data = new Date(2026, 7, 22); // 22 de Agosto de 2026 (Sábado)
      const texto = service.formatarDataExtenso(data);
      expect(texto).toContain('22 de Agosto');
    });
  });
});
