export type DiaSemana =
  | 'SEGUNDA'
  | 'TERCA'
  | 'QUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SABADO'
  | 'DOMINGO';

export const DIAS_DA_SEMANA: DiaSemana[] = [
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
  'DOMINGO',
];

export const DIAS_SEMANA_LABELS: Record<DiaSemana, string> = {
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export const DIAS_SEMANA_ABREV: Record<DiaSemana, string> = {
  SEGUNDA: 'Seg',
  TERCA: 'Ter',
  QUARTA: 'Qua',
  QUINTA: 'Qui',
  SEXTA: 'Sex',
  SABADO: 'Sáb',
  DOMINGO: 'Dom',
};

export interface HorarioAula {
  id: string;
  disciplinaId: string;
  diaSemana: DiaSemana;
  horarioInicio: string; // Formato "HH:mm" (ex: "08:00")
  horarioFim: string;    // Formato "HH:mm" (ex: "09:40")
  localSala?: string;    // Local ou sala específica deste bloco
}

export type CriarHorarioAulaDTO = Omit<HorarioAula, 'id'>;

export type AtualizarHorarioAulaDTO = Partial<CriarHorarioAulaDTO>;
