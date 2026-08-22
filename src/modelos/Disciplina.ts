export type CriterioAprovacao = 'ARITMETICA' | 'PONDERADA' | 'CUSTOMIZADA';

export interface Disciplina {
  id: string;
  nome: string;
  codigo?: string;
  nomeProfessor?: string;
  contatoProfessor?: string;
  localSala?: string;
  anotacoes?: string;
  corIdentificacao: string;
  limiteMaximoFaltas?: number | null; // Opcional (se não informado/null, presença não é obrigatória)
  criterioAprovacao: CriterioAprovacao;
  notaMinimaAprovacao?: number; // Nota mínima para aprovação (padrão 6.0, entre 0 e 10)
  dataCriacao: string;
  dataAtualizacao: string;
}

export type CriarDisciplinaDTO = Omit<Disciplina, 'id' | 'dataCriacao' | 'dataAtualizacao'>;

export type AtualizarDisciplinaDTO = Partial<CriarDisciplinaDTO>;
