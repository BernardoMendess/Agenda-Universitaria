import { Disciplina } from '../modelos/Disciplina';
import { AulaGradeItem } from './GradeHorariaService';
import { ResumoFrequencia } from '../modelos/Falta';
import { ResumoDesempenhoDisciplina } from '../modelos/Avaliacao';
import { TarefaComDisciplina, EstatisticasTarefas } from '../modelos/Tarefa';
import {
  AulaHojeComStatus,
  StatusMomentoAula,
  MateriaAlertaItem,
  TipoAlertaMateria,
  NivelGravidadeAlerta,
  MetricasDashboard,
} from '../modelos/Dashboard';

/**
 * Camada de Serviço responsável pela inteligência, agregações e lógica de negócio do Dashboard (RF08).
 * Segue os princípios SOLID e Clean Code.
 */
export class DashboardService {
  /**
   * Converte uma string no formato HH:mm em minutos a partir da meia-noite.
   */
  public horaParaMinutos(horaStr: string): number {
    if (!horaStr || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(horaStr.trim())) {
      return 0;
    }
    const [h, m] = horaStr.trim().split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Obtém a hora atual do dispositivo no formato "HH:mm".
   */
  public obterHoraAtualString(data: Date = new Date()): string {
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  /**
   * Calcula o status temporal da aula em relação a um horário de referência ("HH:mm").
   */
  public calcularStatusMomentoAula(
    horarioInicio: string,
    horarioFim: string,
    horaReferencia?: string
  ): {
    statusMomento: StatusMomentoAula;
    minutosParaInicio: number;
    minutosParaFim: number;
  } {
    const horaRefStr = horaReferencia || this.obterHoraAtualString();
    const minRef = this.horaParaMinutos(horaRefStr);
    const minInicio = this.horaParaMinutos(horarioInicio);
    const minFim = this.horaParaMinutos(horarioFim);

    const minutosParaInicio = minInicio - minRef;
    const minutosParaFim = minFim - minRef;

    let statusMomento: StatusMomentoAula = 'FUTURA';

    if (minRef >= minInicio && minRef <= minFim) {
      statusMomento = 'EM_ANDAMENTO';
    } else if (minRef > minFim) {
      statusMomento = 'ENCERRADA';
    } else {
      statusMomento = 'FUTURA';
    }

    return {
      statusMomento,
      minutosParaInicio,
      minutosParaFim,
    };
  }

  /**
   * Processa a lista de aulas de hoje, ordenando cronologicamente e atribuindo status temporal.
   * A primeira aula futura do dia é destacada como 'PROXIMA'.
   */
  public processarAulasDeHoje(
    aulas: AulaGradeItem[],
    horaReferencia?: string
  ): AulaHojeComStatus[] {
    const ordenadas = [...aulas].sort((a, b) =>
      a.horarioInicio.localeCompare(b.horarioInicio)
    );

    let proximaIdentificada = false;

    return ordenadas.map((aula) => {
      const { statusMomento, minutosParaInicio, minutosParaFim } =
        this.calcularStatusMomentoAula(
          aula.horarioInicio,
          aula.horarioFim,
          horaReferencia
        );

      let statusFinal = statusMomento;

      // Se é a primeira aula futura do dia após as encerradas ou em andamento, marca como 'PROXIMA'
      if (statusMomento === 'FUTURA' && !proximaIdentificada) {
        statusFinal = 'PROXIMA';
        proximaIdentificada = true;
      }

      return {
        ...aula,
        statusMomento: statusFinal,
        minutosParaInicio,
        minutosParaFim,
      };
    });
  }

  /**
   * Avalia todas as disciplinas e identifica matérias em estado de alerta (faltas ou notas baixas).
   * Consolida os motivos de alerta para exibição direta no Dashboard (RF08).
   */
  public identificarMateriasEmAlerta(
    disciplinas: Disciplina[],
    resumosFrequencia: Record<string, ResumoFrequencia>,
    resumosNotas: Record<string, ResumoDesempenhoDisciplina>
  ): MateriaAlertaItem[] {
    const listaAlertas: MateriaAlertaItem[] = [];

    for (const disc of disciplinas) {
      const freq = resumosFrequencia[disc.id];
      const nota = resumosNotas[disc.id];

      const motivosFalta: string[] = [];
      const motivosNota: string[] = [];

      let ehCriticoFalta = false;
      let ehCriticoNota = false;

      // 1. Análise de Frequência (RF04 / RF05)
      if (freq && freq.presencaObrigatoria && typeof freq.limiteMaximoFaltas === 'number' && freq.limiteMaximoFaltas > 0) {
        if (freq.reprovadoPorFalta || freq.totalFaltas >= freq.limiteMaximoFaltas) {
          ehCriticoFalta = true;
          motivosFalta.push(
            `Limite de faltas atingido ou excedido: ${freq.totalFaltas}/${freq.limiteMaximoFaltas} faltas.`
          );
        } else if (freq.status === 'ALERTA' || freq.percentualConsumido >= 75) {
          motivosFalta.push(
            `Atenção: restam apenas ${freq.faltasRestantes} falta(s) (${freq.percentualConsumido}% do limite de ${freq.limiteMaximoFaltas}).`
          );
        }
      }

      // 2. Análise de Desempenho de Notas (RF06)
      if (nota) {
        if (nota.statusAprovacao === 'REPROVADO_POR_NOTA') {
          ehCriticoNota = true;
          if (nota.avaliacoesPendentes === 0) {
            motivosNota.push(
              `Média final ${nota.mediaAtual?.toFixed(1) ?? '0.0'} abaixo do mínimo para aprovação (${nota.notaMinimaAprovacao.toFixed(1)}).`
            );
          } else {
            motivosNota.push(
              `Situação crítica: nota projetada necessária (${nota.projecaoNotaNecessaria?.toFixed(1)}) excede a nota máxima permitida.`
            );
          }
        } else if (nota.statusAprovacao === 'EM_RISCO') {
          motivosNota.push(
            `Atenção: precisa de média ${nota.projecaoNotaNecessaria?.toFixed(1)} nas ${nota.avaliacoesPendentes} avaliação(ões) restante(s).`
          );
        } else if (
          nota.mediaAtual !== null &&
          nota.mediaAtual < nota.notaMinimaAprovacao &&
          nota.avaliacoesPendentes > 0
        ) {
          motivosNota.push(
            `Média atual parcial (${nota.mediaAtual.toFixed(1)}) abaixo do mínimo (${nota.notaMinimaAprovacao.toFixed(1)}).`
          );
        }
      }

      // Se houver algum motivo de alerta, adiciona aos alertas
      if (motivosFalta.length > 0 || motivosNota.length > 0) {
        let tipoAlerta: TipoAlertaMateria = 'FALTA';
        if (motivosFalta.length > 0 && motivosNota.length > 0) {
          tipoAlerta = 'AMBOS';
        } else if (motivosNota.length > 0) {
          tipoAlerta = 'NOTA';
        }

        const nivelGravidade: NivelGravidadeAlerta =
          ehCriticoFalta || ehCriticoNota ? 'CRITICO' : 'ALERTA';

        listaAlertas.push({
          disciplinaId: disc.id,
          disciplinaNome: disc.nome,
          disciplinaCodigo: disc.codigo,
          corIdentificacao: disc.corIdentificacao,
          tipoAlerta,
          nivelGravidade,
          motivosFalta,
          motivosNota,
          resumoFrequencia: freq,
          resumoDesempenho: nota,
        });
      }
    }

    // Ordenação: CRITICO primeiro, depois alfabética
    listaAlertas.sort((a, b) => {
      if (a.nivelGravidade !== b.nivelGravidade) {
        return a.nivelGravidade === 'CRITICO' ? -1 : 1;
      }
      return a.disciplinaNome.localeCompare(b.disciplinaNome);
    });

    return listaAlertas;
  }

  /**
   * Consolida os números para as métricas do topo do Dashboard.
   */
  public calcularMetricasDashboard(
    disciplinas: Disciplina[],
    aulasHoje: AulaGradeItem[],
    estatisticasTarefas: EstatisticasTarefas,
    materiasEmAlerta: MateriaAlertaItem[],
    proximasAvaliacoesTotal: number = 0
  ): MetricasDashboard {
    return {
      totalDisciplinas: disciplinas.length,
      aulasHoje: aulasHoje.length,
      tarefasPendentes: estatisticasTarefas.pendentes,
      tarefasAtrasadas: estatisticasTarefas.atrasadas,
      materiasEmAlerta: materiasEmAlerta.length,
      proximasAvaliacoes: proximasAvaliacoesTotal,
    };
  }

  /**
   * Formata a data atual em português por extenso (ex: "Sábado, 22 de Agosto").
   */
  public formatarDataExtenso(data: Date = new Date()): string {
    const diasDaSemana = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const diaSemana = diasDaSemana[data.getDay()];
    const dia = data.getDate();
    const mes = meses[data.getMonth()];

    return `${diaSemana}, ${dia} de ${mes}`;
  }
}

// Instância singleton do serviço
export const dashboardService = new DashboardService();
