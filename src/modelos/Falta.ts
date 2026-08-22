export type StatusFrequencia = 'SEGURO' | 'MODERADO' | 'ALERTA' | 'CRITICO';

export interface Falta {
  id: string;
  disciplinaId: string;
  data: string; // Formato YYYY-MM-DD
  horario: string; // Formato HH:mm
  justificativa?: string;
  dataCriacao: string;
}

export type CriarFaltaDTO = {
  disciplinaId: string;
  data?: string;
  horario?: string;
  justificativa?: string;
};

export interface ResumoFrequencia {
  disciplinaId: string;
  totalFaltas: number;
  limiteMaximoFaltas?: number | null; // null/undefined se presença não for obrigatória
  presencaObrigatoria: boolean; // false se não houver limite
  faltasRestantes: number | null; // null se não houver limite
  percentualConsumido: number; // 0 se não houver limite
  status: StatusFrequencia;
  reprovadoPorFalta: boolean; // sempre false se presença não for obrigatória
}
