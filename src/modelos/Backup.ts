import { Disciplina } from './Disciplina';
import { HorarioAula } from './HorarioAula';
import { Falta } from './Falta';
import { Avaliacao } from './Avaliacao';
import { Tarefa } from './Tarefa';
import { EventoAcademico } from './EventoAcademico';
import { ConfiguracaoNotificacao } from './Notificacao';

/**
 * Resumo estatístico quantitativo dos dados contidos no backup ou na base local.
 */
export interface EstatisticasBackup {
  totalDisciplinas: number;
  totalHorarios: number;
  totalFaltas: number;
  totalAvaliacoes: number;
  totalTarefas: number;
  totalEventos: number;
}

/**
 * Metadados de integridade e identificação do arquivo de backup do CampusFlow.
 */
export interface MetadadosBackup {
  versaoSchema: string;
  app: 'CampusFlow';
  dataExportacao: string;
  estatisticas: EstatisticasBackup;
}

/**
 * Estrutura agregada contendo todos os dados locais do usuário para portabilidade.
 */
export interface DadosBackup {
  disciplinas: Disciplina[];
  horariosAula: HorarioAula[];
  faltas: Falta[];
  avaliacoes: Avaliacao[];
  tarefas: Tarefa[];
  eventosAcademicos: EventoAcademico[];
  configuracaoNotificacoes?: ConfiguracaoNotificacao;
}

/**
 * Estrutura completa do arquivo JSON de backup exportado/importado.
 */
export interface ArquivoBackup {
  metadados: MetadadosBackup;
  dados: DadosBackup;
}

/**
 * Modos de restauração suportados pelo sistema:
 * - 'SUBSTITUIR': Limpa o banco atual e restaura exatamente os dados do arquivo de backup.
 * - 'MESCLAR': Mantém os dados existentes e adiciona os itens do backup que ainda não existem.
 */
export type ModoRestauracao = 'SUBSTITUIR' | 'MESCLAR';

/**
 * Diagnóstico de validação de um arquivo/conteúdo de backup.
 */
export interface ResultadoValidacaoBackup {
  valido: boolean;
  erros: string[];
  avisos: string[];
  metadados?: MetadadosBackup;
  dados?: DadosBackup;
}

/**
 * Resultado da operação de restauração de backup.
 */
export interface ResultadoRestauracaoBackup {
  sucesso: boolean;
  mensagem: string;
  modo: ModoRestauracao;
  estatisticasRestauradas: EstatisticasBackup;
  erros?: string[];
}
