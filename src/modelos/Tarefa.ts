/**
 * Tipos de prioridade de uma tarefa.
 */
export type PrioridadeTarefa = 'BAIXA' | 'MEDIA' | 'ALTA';

/**
 * Status do prazo de uma tarefa em relação à data atual.
 */
export type StatusPrazoTarefa = 'EM_DIA' | 'HOJE' | 'AMANHA' | 'ATRASADA' | 'SEM_PRAZO';

/**
 * Entidade principal que representa uma Tarefa no sistema (RF07).
 * Pode ser vinculada a uma disciplina ou ser avulsa (disciplinaId opcional/indefinido).
 */
export interface Tarefa {
  id: string;
  disciplinaId?: string; // Se indefinido, é uma tarefa avulsa
  titulo: string;
  descricao?: string;
  concluida: boolean;
  dataLimite?: string; // Formato YYYY-MM-DD
  horarioLimite?: string; // Formato HH:mm
  prioridade: PrioridadeTarefa;
  dataConclusao?: string; // Timestamp ISO quando concluída
  dataCriacao: string; // Timestamp ISO
  dataAtualizacao: string; // Timestamp ISO
}

/**
 * DTO para criação de uma nova tarefa.
 */
export interface CriarTarefaDTO {
  disciplinaId?: string;
  titulo: string;
  descricao?: string;
  dataLimite?: string;
  horarioLimite?: string;
  prioridade?: PrioridadeTarefa;
}

/**
 * DTO para atualização de tarefa existente.
 */
export interface AtualizarTarefaDTO {
  disciplinaId?: string | null;
  titulo?: string;
  descricao?: string | null;
  dataLimite?: string | null;
  horarioLimite?: string | null;
  prioridade?: PrioridadeTarefa;
  concluida?: boolean;
}

/**
 * Filtros de consulta para listagem de tarefas.
 */
export interface FiltroTarefasDTO {
  disciplinaId?: string;
  status?: 'TODAS' | 'PENDENTES' | 'CONCLUIDAS';
  apenasHoje?: boolean;
  atrasadas?: boolean;
}

/**
 * Tarefa enriquecida com informações visuais da disciplina (se vinculada).
 */
export interface TarefaComDisciplina extends Tarefa {
  disciplinaNome?: string;
  disciplinaCor?: string;
  statusPrazo: StatusPrazoTarefa;
  diasRestantes?: number;
}

/**
 * Resumo estatístico das tarefas cadastradas.
 */
export interface EstatisticasTarefas {
  total: number;
  pendentes: number;
  concluidas: number;
  atrasadas: number;
  hoje: number;
  percentualConclusao: number;
}

/**
 * Rótulos para exibição amigável das prioridades.
 */
export const PRIORIDADE_LABELS: Record<PrioridadeTarefa, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
};

/**
 * Cores associadas às prioridades.
 */
export const PRIORIDADE_CORES: Record<PrioridadeTarefa, string> = {
  BAIXA: '#3b82f6', // Azul
  MEDIA: '#d29922', // Âmbar/Amarelo
  ALTA: '#f85149',  // Vermelho
};
