/**
 * Constantes utilizadas para a funcionalidade de Apoio ao Projeto (Buy me a coffee / Pix).
 */

export const CHAVE_PIX_DOACAO = '2661e7a2-c448-4cb7-937e-fcab0195bd0e';

/**
 * Tempo acumulado de uso do app necessário para disparar o pop-up (10 minutos = 600 segundos).
 */
export const TEMPO_SEGUNDOS_DISPARO_POPUP = 10 * 60; // 600 segundos

/**
 * Chaves de persistência local no SQLite.
 */
export const CHAVES_PREFERENCIAS_APOIO = {
  JA_EXIBIU: 'apoio_modal_exibido',
  TEMPO_USO_SEGUNDOS: 'apoio_tempo_uso_segundos',
} as const;
