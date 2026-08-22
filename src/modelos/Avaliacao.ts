export type TipoAvaliacao = 'PROVA' | 'TRABALHO' | 'TESTE' | 'SEMINARIO' | 'OUTRO';

export type StatusAprovacao =
  | 'APROVADO'
  | 'EM_CURSO'
  | 'EM_RISCO'
  | 'REPROVADO_POR_NOTA';

export interface Avaliacao {
  id: string;
  disciplinaId: string;
  titulo: string;
  tipo: TipoAvaliacao;
  data: string; // Formato YYYY-MM-DD
  horario?: string; // Formato HH:mm
  peso: number; // >= 0, padrão 1
  notaMaxima: number; // padrão 10.0
  nota?: number | null; // nota obtida; null/undefined = pendente
  descricao?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export type CriarAvaliacaoDTO = Omit<
  Avaliacao,
  'id' | 'dataCriacao' | 'dataAtualizacao' | 'nota' | 'peso' | 'notaMaxima'
> & {
  peso?: number;
  notaMaxima?: number;
};

export type AtualizarAvaliacaoDTO = Partial<Omit<CriarAvaliacaoDTO, 'disciplinaId'>>;

export type LancarNotaDTO = {
  nota: number | null; // null para remover nota
};

export interface ResumoDesempenhoDisciplina {
  disciplinaId: string;
  mediaAtual: number | null; // null quando nenhuma avaliação foi lançada
  totalAvaliacoes: number;
  avaliacoesLancadas: number;
  avaliacoesPendentes: number;
  notaMinimaAprovacao: number;
  projecaoNotaNecessaria: number | null; // null quando não há avaliações pendentes
  statusAprovacao: StatusAprovacao;
  mensagemProjecao: string;
}

export const TIPO_AVALIACAO_LABELS: Record<TipoAvaliacao, string> = {
  PROVA: 'Prova',
  TRABALHO: 'Trabalho',
  TESTE: 'Teste',
  SEMINARIO: 'Seminário',
  OUTRO: 'Outro',
};

export const TIPO_AVALIACAO_CORES: Record<TipoAvaliacao, string> = {
  PROVA: '#f85149',
  TRABALHO: '#3b82f6',
  TESTE: '#d29922',
  SEMINARIO: '#10b981',
  OUTRO: '#8b949e',
};
