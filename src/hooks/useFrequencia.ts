import { useState, useCallback } from 'react';
import { Falta, CriarFaltaDTO, ResumoFrequencia } from '../modelos/Falta';
import { Disciplina } from '../modelos/Disciplina';
import { frequenciaService } from '../servicos/FrequenciaService';
import { notificacaoService } from '../servicos/NotificacaoService';
import { disciplinaRepositorio } from '../servicos/banco/DisciplinaRepositorio';

export interface AlertaFaltaCriticoInfo {
  disciplinaNome: string;
  limiteMaximoFaltas: number;
  totalFaltas: number;
  reprovadoPorFalta: boolean;
  disciplinaId: string;
}

export const useFrequencia = () => {
  const [resumos, setResumos] = useState<Record<string, ResumoFrequencia>>({});
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [alertaCritico, setAlertaCritico] = useState<AlertaFaltaCriticoInfo | null>(null);

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
   * Helper interno para avaliar se dispara alerta crítico imediato (RF10).
   */
  const processarAlertaFaltas = async (
    disciplinaId: string,
    resumo: ResumoFrequencia
  ) => {
    try {
      const disc = await disciplinaRepositorio.buscarPorId(disciplinaId);
      if (disc) {
        const resultado = await notificacaoService.verificarEDispararAlertaFaltas(
          disc,
          resumo
        );
        if (
          resultado.disparouAlerta &&
          typeof disc.limiteMaximoFaltas === 'number'
        ) {
          setAlertaCritico({
            disciplinaId: disc.id,
            disciplinaNome: disc.nome,
            limiteMaximoFaltas: disc.limiteMaximoFaltas,
            totalFaltas: resumo.totalFaltas,
            reprovadoPorFalta: resumo.reprovadoPorFalta,
          });
        }
      }
    } catch {
      // Falha silenciosa no alerta para não bloquear a operação principal
    }
  };

  /**
   * Incremento rápido (+1 falta).
   */
  const incrementar = useCallback(
    async (disciplinaId: string, justificativa?: string) => {
      try {
        setErro(null);
        const { resumo } = await frequenciaService.incrementarFalta(
          disciplinaId,
          justificativa
        );
        setResumos((prev) => ({
          ...prev,
          [disciplinaId]: resumo,
        }));

        await processarAlertaFaltas(disciplinaId, resumo);

        return resumo;
      } catch (e: any) {
        setErro(e.message || 'Erro ao registrar falta.');
        throw e;
      }
    },
    []
  );

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
  const registrarFaltaDetalhada = useCallback(
    async (dados: CriarFaltaDTO) => {
      try {
        setErro(null);
        const { falta, resumo } = await frequenciaService.registrarFaltaDetalhada(
          dados
        );
        setResumos((prev) => ({
          ...prev,
          [dados.disciplinaId]: resumo,
        }));

        await processarAlertaFaltas(dados.disciplinaId, resumo);

        return { falta, resumo };
      } catch (e: any) {
        setErro(e.message || 'Erro ao salvar falta detalhada.');
        throw e;
      }
    },
    []
  );

  /**
   * Remoção de uma falta individual pelo ID.
   */
  const removerFalta = useCallback(async (id: string, disciplinaId: string) => {
    try {
      setErro(null);
      const { resumo } = await frequenciaService.removerFaltaPorId(
        id,
        disciplinaId
      );
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
  const obterHistorico = useCallback(
    async (disciplinaId: string): Promise<Falta[]> => {
      try {
        setErro(null);
        return await frequenciaService.obterHistorico(disciplinaId);
      } catch (e: any) {
        setErro(e.message || 'Erro ao buscar histórico de faltas.');
        return [];
      }
    },
    []
  );

  /**
   * Obtém resumo de frequência de uma disciplina específica já em cache.
   */
  const obterResumo = useCallback(
    (disciplinaId: string): ResumoFrequencia | undefined => {
      return resumos[disciplinaId];
    },
    [resumos]
  );

  const fecharAlertaCritico = useCallback(() => {
    setAlertaCritico(null);
  }, []);

  return {
    resumos,
    carregando,
    erro,
    alertaCritico,
    fecharAlertaCritico,
    carregarResumos,
    incrementar,
    decrementar,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistorico,
    obterResumo,
  };
};
