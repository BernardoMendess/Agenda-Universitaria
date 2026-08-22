import { DiaSemana } from './HorarioAula';
import { TipoAvaliacao } from './Avaliacao';
import { PrioridadeTarefa } from './Tarefa';

/**
 * Categorias de filtragem no Calendário Integrado (RF09).
 */
export type CategoriaFiltroCalendario =
  | 'TODOS'
  | 'PROVAS'
  | 'ENTREGAS'
  | 'AULAS'
  | 'EVENTOS';

/**
 * Modos de visualização suportados pelo Calendário.
 */
export type ModoVisaoCalendario = 'MENSAL' | 'SEMANAL';

/**
 * Tipo específico de um item unificado do calendário.
 */
export type TipoItemCalendario =
  | 'PROVA'
  | 'TRABALHO'
  | 'TESTE'
  | 'SEMINARIO'
  | 'TAREFA'
  | 'AULA'
  | 'EVENTO'
  | 'OUTRO';

/**
 * Origem do item unificado no banco de dados local.
 */
export type OrigemItemCalendario =
  | 'AVALIACAO'
  | 'TAREFA'
  | 'AULA'
  | 'EVENTO_ACADEMICO';

/**
 * Item unificado de calendário consolidando Provas, Entregas/Tarefas, Aulas e Eventos (RF09).
 */
export interface ItemCalendario {
  id: string; // ID unificado (ex: "aval_123", "tar_456", "aula_seg_789", "eve_101")
  origemId: string; // ID original na respectiva entidade
  origem: OrigemItemCalendario;
  categoria: 'PROVAS' | 'ENTREGAS' | 'AULAS' | 'EVENTOS';
  tipo: TipoItemCalendario;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  data: string; // Formato YYYY-MM-DD
  horarioInicio?: string; // Formato HH:mm
  horarioFim?: string; // Formato HH:mm
  disciplinaId?: string;
  disciplinaNome?: string;
  disciplinaCodigo?: string;
  disciplinaCor?: string;
  concluida?: boolean; // Para tarefas ou avaliações com nota
  destaqueCor?: string;
  localSala?: string;
  // Detalhes extras específicos
  prioridadeTarefa?: PrioridadeTarefa;
  tipoAvaliacao?: TipoAvaliacao;
  pesoAvaliacao?: number;
  notaAvaliacao?: number | null;
  notaMaximaAvaliacao?: number;
}

/**
 * Estrutura representativa de um dia no Grid Mensal ou Visão Semanal.
 */
export interface DiaCalendario {
  dataStr: string; // Formato YYYY-MM-DD
  diaDoMes: number; // 1 a 31
  mes: number; // 0 a 11 (padrão JS) ou 1 a 12
  ano: number;
  diaSemana: DiaSemana;
  ehHoje: boolean;
  ehMesAtual: boolean;
  eventos: ItemCalendario[];
  indicadoresCores: string[]; // Cores dos eventos presentes no dia para badges/pontos
  temProva: boolean;
  temEntrega: boolean;
  temAula: boolean;
  temEvento: boolean;
}

/**
 * Estrutura de uma semana consolidada para a visão semanal.
 */
export interface SemanaCalendario {
  dataInicioStr: string; // YYYY-MM-DD
  dataFimStr: string; // YYYY-MM-DD
  rotuloSemana: string; // Ex: "17 a 23 de Agosto de 2026"
  dias: DiaCalendario[];
}

/**
 * Resumo estatístico do período ativo no calendário.
 */
export interface EstatisticasCalendario {
  totalItens: number;
  totalProvas: number;
  totalEntregas: number;
  totalAulas: number;
  totalEventos: number;
}

export const CATEGORIA_FILTRO_LABELS: Record<CategoriaFiltroCalendario, string> = {
  TODOS: 'Tudo',
  PROVAS: 'Provas & Avaliações',
  ENTREGAS: 'Entregas & Tarefas',
  AULAS: 'Aulas',
  EVENTOS: 'Eventos',
};
