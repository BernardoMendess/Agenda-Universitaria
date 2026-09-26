import { DiaSemana } from './HorarioAula';

/**
 * Categoria da notificação local (RF10).
 */
export type TipoNotificacao = 'AULA' | 'AVALIACAO' | 'TAREFA' | 'LIMITE_FALTAS';

/**
 * Nível de prioridade da notificação.
 */
export type PrioridadeNotificacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

/**
 * Representa um lembrete/alarme local agendado no dispositivo.
 */
export interface NotificacaoAgendada {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  referenciaId: string; // ID da disciplina, aula, avaliação ou tarefa
  disciplinaId?: string;
  disciplinaNome?: string;
  disciplinaCor?: string;
  dataHoraDisparo?: string; // Timestamp ISO quando aplicável
  diaSemana?: DiaSemana; // Para aulas semanais recorrentes
  horarioInicio?: string; // Formato HH:mm para aulas
  antecedenciaMinutos?: number; // Minutos de antecedência
  antecedenciaHoras?: number; // Horas de antecedência
  prioridade: PrioridadeNotificacao;
  ativa: boolean;
  dataCriacao: string;
  /** ID nativo retornado pelo expo-notifications após agendamento no SO */
  idNativoExpo?: string;
  /** Indica se o alarme foi efetivamente registrado no sistema operacional */
  agendadoNoSO?: boolean;
}

/**
 * DTO para agendamento de notificação.
 */
export interface CriarNotificacaoAgendadaDTO {
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  referenciaId: string;
  disciplinaId?: string;
  disciplinaNome?: string;
  disciplinaCor?: string;
  dataHoraDisparo?: string;
  diaSemana?: DiaSemana;
  horarioInicio?: string;
  antecedenciaMinutos?: number;
  antecedenciaHoras?: number;
  prioridade?: PrioridadeNotificacao;
}

/**
 * Configurações de preferências de notificações do usuário (RF10).
 */
export interface ConfiguracaoNotificacao {
  // Lembretes de Aulas
  aulasAtivas: boolean;
  antecedenciaAulaMinutos: number; // ex: 15, 30, 60

  // Lembretes de Avaliações (Provas, Trabalhos)
  avaliacoesAtivas: boolean;
  antecedenciaAvaliacoesHoras: number[]; // ex: [24, 2] -> 24h e 2h antes

  // Lembretes de Tarefas (To-Do List)
  tarefasAtivas: boolean;
  antecedenciaTarefasHoras: number[]; // ex: [24, 2] -> 24h e 2h antes

  // Alerta Crítico Imediato de Limite de Faltas
  alertaFaltasAtivo: boolean;

  // Feedback sonoro e tátil
  somHabilitado: boolean;
  vibracaoHabilitada: boolean;

  // Data de atualização da configuração
  dataAtualizacao: string;
}

/**
 * Configuração padrão inicial do sistema.
 */
export const CONFIGURACAO_NOTIFICACAO_PADRAO: ConfiguracaoNotificacao = {
  aulasAtivas: true,
  antecedenciaAulaMinutos: 15, // 15 minutos antes da aula
  avaliacoesAtivas: true,
  antecedenciaAvaliacoesHoras: [24, 2], // 24 horas e 2 horas antes
  tarefasAtivas: true,
  antecedenciaTarefasHoras: [24, 2], // 24 horas e 2 horas antes
  alertaFaltasAtivo: true,
  somHabilitado: true,
  vibracaoHabilitada: false,
  dataAtualizacao: new Date().toISOString(),
};

/**
 * Estatísticas resumidas dos agendamentos locais.
 */
export interface EstatisticasNotificacoes {
  /** Total de registros no banco local (SQLite) */
  totalAgendadas: number;
  totalAulas: number;
  totalAvaliacoes: number;
  totalTarefas: number;
  alertaFaltasAtivo: boolean;
  /** Total de alarmes realmente agendados no sistema operacional do celular */
  totalNoSistemaOperacional: number;
}
