import { AulaGradeItem } from '../servicos/GradeHorariaService';
import { ResumoFrequencia } from './Falta';
import { ResumoDesempenhoDisciplina } from './Avaliacao';

/**
 * Status temporal da aula em relação ao horário atual.
 */
export type StatusMomentoAula = 'EM_ANDAMENTO' | 'PROXIMA' | 'ENCERRADA' | 'FUTURA';

/**
 * Aula do dia enriquecida com cálculo de status em tempo real.
 */
export interface AulaHojeComStatus extends AulaGradeItem {
  statusMomento: StatusMomentoAula;
  minutosParaInicio?: number;
  minutosParaFim?: number;
}

/**
 * Tipo de pendência/risco identificado na matéria.
 */
export type TipoAlertaMateria = 'FALTA' | 'NOTA' | 'AMBOS';

/**
 * Nível de gravidade do alerta da matéria.
 * - 'CRITICO': Limite de faltas atingido/estourado, falta em limite zero, ou reprovação/risco severo por nota.
 * - 'ALERTA': Faltas >= 75% do limite ou nota necessária na projeção >= 75% da nota máxima.
 */
export type NivelGravidadeAlerta = 'ALERTA' | 'CRITICO';

/**
 * Dados estruturados de uma matéria que requer atenção do estudante.
 */
export interface MateriaAlertaItem {
  disciplinaId: string;
  disciplinaNome: string;
  disciplinaCodigo?: string;
  corIdentificacao: string;
  tipoAlerta: TipoAlertaMateria;
  nivelGravidade: NivelGravidadeAlerta;
  motivosFalta: string[];
  motivosNota: string[];
  resumoFrequencia?: ResumoFrequencia;
  resumoDesempenho?: ResumoDesempenhoDisciplina;
}

/**
 * Métricas consolidadas exibidas no topo do Dashboard.
 */
export interface MetricasDashboard {
  totalDisciplinas: number;
  aulasHoje: number;
  tarefasPendentes: number;
  tarefasAtrasadas: number;
  materiasEmAlerta: number;
  proximasAvaliacoes: number;
}
