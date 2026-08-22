/**
 * Metadados e métricas de auditoria de eficiência energética do CampusFlow (RNF04).
 */
export interface MetricasEficiencia {
  rotinasSegundoPlanoAtivas: number;
  usoWakeLocks: number;
  tipoAgendador: 'Agendador Nativo do Sistema' | 'Polling em Segundo Plano';
  consumoBateriaEstimado: 'Mínimo / Quase Nulo' | 'Moderado' | 'Alto';
  alarmesLocaisRegistrados: number;
  processamentoEventDriven: boolean;
  timestampAuditoria: string;
}

/**
 * Status consolidado do diagnóstico de eficiência energética.
 */
export interface DiagnosticoEficiencia {
  emConformidade: boolean;
  protocolo: 'RNF04 — Eficiência Energética';
  descricao: string;
  metricas: MetricasEficiencia;
  garantias: string[];
}
