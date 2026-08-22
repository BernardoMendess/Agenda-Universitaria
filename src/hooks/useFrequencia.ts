import { useState, useCallback } from 'react';
import { Falta, CriarFaltaDTO, ResumoFrequencia } from '../modelos/Falta';
import { Disciplina } from '../modelos/Disciplina';
import { frequenciaService } from '../servicos/FrequenciaService';

export const useFrequencia = () => {
  const [resumos, setResumos] = useState<Record<string, ResumoFrequencia>>({});
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Carrega os resumos de frequência de uma lista de disciplinas.
   */
  const carregarResumos = useCallback(async (disciplinas: Disciplina[]) => {
    try {
      setCarregando(true);
      setErro(null);
      const novosResumos = await frequenciaService.calcularResumosEmLote(disciplinas);
      setResumos(novosResumos);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar frequência das disciplinas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  /**
   * Incremento rápido (+1 falta).
   */
  const incrementar = useCallback(async (disciplinaId: string, justificativa?: string) => {
    try {
      setErro(null);
      const { resumo } = await frequenciaService.incrementarFalta(disciplinaId, justificativa);
      setResumos((prev) => ({
        ...prev,
        [disciplinaId]: resumo,
      }));
      return resumo;
    } catch (e: any) {
      setErro(e.message || 'Erro ao registrar falta.');
      throw e;
    }
  }, []);

  /**
   * Decremento rápido (-1 falta).
   */
  const decrementar = useCallback(async (disciplinaId: string) => {
    try {
      setErro(null);
      const { resumo } = await frequenciaService.decrementarFalta(disciplinaId);
      setResumos((prev) => ({
        ...prev,
        [disciplinaId]: resumo,
      }));
      return resumo;
    } catch (e: any) {
      setErro(e.message || 'Erro ao decrementar falta.');
      throw e;
    }
  }, []);

  /**
   * Registro detalhado de falta com data, horário e justificativa.
   */
  const registrarFaltaDetalhada = useCallback(async (dados: CriarFaltaDTO) => {
    try {
      setErro(null);
      const { falta, resumo } = await frequenciaService.registrarFaltaDetalhada(dados);
      setResumos((prev) => ({
        ...prev,
        [dados.disciplinaId]: resumo,
      }));
      return { falta, resumo };
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar falta detalhada.');
      throw e;
    }
  }, []);

  /**
   * Remoção de uma falta individual pelo ID.
   */
  const removerFalta = useCallback(async (id: string, disciplinaId: string) => {
    try {
      setErro(null);
      const { resumo } = await frequenciaService.removerFaltaPorId(id, disciplinaId);
      setResumos((prev) => ({
        ...prev,
        [disciplinaId]: resumo,
      }));
      return resumo;
    } catch (e: any) {
      setErro(e.message || 'Erro ao remover falta do histórico.');
      throw e;
    }
  }, []);

  /**
   * Obtém a lista de histórico de faltas para uma disciplina.
   */
  const obterHistorico = useCallback(async (disciplinaId: string): Promise<Falta[]> => {
    try {
      setErro(null);
      return await frequenciaService.obterHistorico(disciplinaId);
    } catch (e: any) {
      setErro(e.message || 'Erro ao buscar histórico de faltas.');
      return [];
    }
  }, []);

  /**
   * Obtém resumo de frequência de uma disciplina específica já em cache.
   */
  const obterResumo = useCallback(
    (disciplinaId: string): ResumoFrequencia | undefined => {
      return resumos[disciplinaId];
    },
    [resumos]
  );

  return {
    resumos,
    carregando,
    erro,
    carregarResumos,
    incrementar,
    decrementar,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistorico,
    obterResumo,
  };
};
