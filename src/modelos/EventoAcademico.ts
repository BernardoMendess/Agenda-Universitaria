/**
 * Entidade que representa um Evento Acadêmico avulso ou especial no sistema (RF09).
 * Exemplos: Semana de Provas, Feira de Carreiras, Início/Fim do Semestre, Palestra, Feriado.
 */
export interface EventoAcademico {
  id: string;
  titulo: string;
  descricao?: string;
  data: string; // Formato YYYY-MM-DD
  horarioInicio?: string; // Formato HH:mm
  horarioFim?: string; // Formato HH:mm
  disciplinaId?: string; // Opcional (se vinculado a uma matéria específica)
  local?: string;
  cor?: string; // Cor customizada ou herdada da disciplina
  dataCriacao: string; // Timestamp ISO
  dataAtualizacao: string; // Timestamp ISO
}

/**
 * DTO para criação de um novo evento acadêmico.
 */
export interface CriarEventoAcademicoDTO {
  titulo: string;
  descricao?: string;
  data: string; // Formato YYYY-MM-DD
  horarioInicio?: string;
  horarioFim?: string;
  disciplinaId?: string;
  local?: string;
  cor?: string;
}

/**
 * DTO para atualização de evento acadêmico existente.
 */
export type AtualizarEventoAcademicoDTO = Partial<CriarEventoAcademicoDTO>;
