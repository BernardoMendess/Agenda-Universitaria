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
  limiteMaximoFaltas: number; // Inteiro obrigatório >= 0
  criterioAprovacao: CriterioAprovacao;
  dataCriacao: string;
  dataAtualizacao: string;
}

export type CriarDisciplinaDTO = Omit<Disciplina, 'id' | 'dataCriacao' | 'dataAtualizacao'>;

export type AtualizarDisciplinaDTO = Partial<CriarDisciplinaDTO>;
