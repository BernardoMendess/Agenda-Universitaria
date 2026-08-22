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
  limiteMaximoFaltas: number;
  faltasRestantes: number;
  percentualConsumido: number;
  status: StatusFrequencia;
  reprovadoPorFalta: boolean;
}
