/**
 * Categorias de dados acadêmicos e do usuário armazenados no dispositivo.
 */
export type CategoriaDadosAcademico =
  | 'DISCIPLINAS'
  | 'GRADE_HORARIA'
  | 'FALTAS_FREQUENCIA'
  | 'AVALIACOES_NOTAS'
  | 'TAREFAS'
  | 'CONFIGURACOES'
  | 'NOTIFICACOES_LOCAIS';

/**
 * Item de auditoria do inventário de dados locais.
 */
export interface ItemInventarioDados {
  categoria: CategoriaDadosAcademico;
  descricao: string;
  tabelaLocal: string;
  totalRegistros: number;
  armazenamento: 'Sandbox Local SQLite';
  sincronizacaoNuvem: false;
  compartilhamentoTerceiros: false;
}

/**
 * Certificado oficial de auditoria de Privacidade Total (RNF05).
 */
export interface CertificadoPrivacidade {
  idCertificado: string;
  emissao: string;
  status: 'Totalmente Privado' | 'Conforme';
  transmissaoExternaBytes: 0;
  telemetriaAtiva: false;
  analyticsAtivo: false;
  rastreamentoIdentificadores: false;
  localArmazenamento: 'Sandbox Local Isolada (campusflow.db)';
  garantias: string[];
  inventario: ItemInventarioDados[];
  hashAuditoria: string;
}

/**
 * Relatório resumido de conformidade com a privacidade.
 */
export interface RelatorioAuditoriaPrivacidade {
  emConformidade: boolean;
  protocolo: 'RNF05 — Privacidade Total';
  resumo: string;
  totalItensLocais: number;
  dataUltimaAuditoria: string;
  certificado: CertificadoPrivacidade;
}
