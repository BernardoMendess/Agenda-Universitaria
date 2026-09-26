import { useState, useCallback } from 'react';
import { Avaliacao, CriarAvaliacaoDTO, AtualizarAvaliacaoDTO, ResumoDesempenhoDisciplina } from '../modelos/Avaliacao';
import { Disciplina } from '../modelos/Disciplina';
import { avaliacaoService } from '../servicos/AvaliacaoService';
import { notificacaoService } from '../servicos/NotificacaoService';

export const useAvaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [resumosDesempenho, setResumosDesempenho] = useState<Record<string, ResumoDesempenhoDisciplina>>({});
  const [proximasAvaliacoes, setProximasAvaliacoes] = useState<(Avaliacao & { disciplinaNome: string; corIdentificacao: string })[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Carrega as avaliações de uma disciplina específica ou todas as avaliações cadastradas.
   */
  const carregarAvaliacoes = useCallback(async (disciplinaId?: string) => {
    try {
      setCarregando(true);
      setErro(null);
      const lista = disciplinaId
        ? await avaliacaoService.listarPorDisciplina(disciplinaId)
        : await avaliacaoService.listarTodas();
      setAvaliacoes(lista);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar avaliações.');
    } finally {
      setCarregando(false);
    }
  }, []);

  /**
   * Carrega resumos de desempenho em lote para uma lista de disciplinas.
   */
  const carregarDesempenhos = useCallback(async (disciplinas: Disciplina[]) => {
    try {
      setCarregando(true);
      setErro(null);
      const resumos = await avaliacaoService.calcularDesempenhosEmLote(disciplinas);
      setResumosDesempenho(resumos);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar desempenho de notas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  /**
   * Carrega as próximas avaliações futuras pendentes.
   */
  const carregarProximasAvaliacoes = useCallback(async (limite: number = 5) => {
    try {
      setErro(null);
      const proximas = await avaliacaoService.obterProximasAvaliacoes(limite);
      setProximasAvaliacoes(proximas);
    } catch (e: any) {
      setErro(e.message || 'Erro ao buscar próximas avaliações.');
    }
  }, []);

  /**
   * Cria uma nova avaliação.
   */
  const criarAvaliacao = useCallback(async (dados: CriarAvaliacaoDTO): Promise<Avaliacao> => {
    try {
      setErro(null);
      const novaAvaliacao = await avaliacaoService.criarAvaliacao(dados);
      setAvaliacoes((prev) => [...prev, novaAvaliacao].sort((a, b) => a.data.localeCompare(b.data)));
      
      const resumo = await avaliacaoService.calcularDesempenho(dados.disciplinaId);
      setResumosDesempenho((prev) => ({ ...prev, [dados.disciplinaId]: resumo }));

      notificacaoService.sincronizarGeral().catch(() => {});
      return novaAvaliacao;
    } catch (e: any) {
      setErro(e.message || 'Erro ao criar avaliação.');
      throw e;
    }
  }, []);

  /**
   * Atualiza uma avaliação existente.
   */
  const atualizarAvaliacao = useCallback(async (id: string, dados: AtualizarAvaliacaoDTO): Promise<Avaliacao> => {
    try {
      setErro(null);
      const atualizada = await avaliacaoService.atualizarAvaliacao(id, dados);
      setAvaliacoes((prev) =>
        prev.map((a) => (a.id === id ? atualizada : a))
      );

      const resumo = await avaliacaoService.calcularDesempenho(atualizada.disciplinaId);
      setResumosDesempenho((prev) => ({ ...prev, [atualizada.disciplinaId]: resumo }));

      notificacaoService.sincronizarGeral().catch(() => {});
      return atualizada;
    } catch (e: any) {
      setErro(e.message || 'Erro ao atualizar avaliação.');
      throw e;
    }
  }, []);

  /**
   * Lança a nota de uma avaliação e atualiza o resumo de desempenho.
   */
  const lancarNota = useCallback(async (id: string, nota: number | null): Promise<{ avaliacao: Avaliacao; resumo: ResumoDesempenhoDisciplina }> => {
    try {
      setErro(null);
      const resultado = await avaliacaoService.lancarNota(id, nota);
      setAvaliacoes((prev) =>
        prev.map((a) => (a.id === id ? resultado.avaliacao : a))
      );
      setResumosDesempenho((prev) => ({
        ...prev,
        [resultado.avaliacao.disciplinaId]: resultado.resumo,
      }));
      notificacaoService.sincronizarGeral().catch(() => {});
      return resultado;
    } catch (e: any) {
      setErro(e.message || 'Erro ao lançar nota.');
      throw e;
    }
  }, []);

  /**
   * Remove a nota de uma avaliação (deixa pendente).
   */
  const removerNota = useCallback(async (id: string) => {
    return await lancarNota(id, null);
  }, [lancarNota]);

  /**
   * Exclui uma avaliação.
   */
  const excluirAvaliacao = useCallback(async (id: string): Promise<boolean> => {
    try {
      setErro(null);
      const disciplinaId = avaliacoes.find((a) => a.id === id)?.disciplinaId;
      const sucesso = await avaliacaoService.excluirAvaliacao(id);
      if (sucesso) {
        setAvaliacoes((prev) => prev.filter((a) => a.id !== id));
        // Recalcula o resumo de desempenho da disciplina
        if (disciplinaId) {
          const resumo = await avaliacaoService.calcularDesempenho(disciplinaId);
          setResumosDesempenho((prev) => ({ ...prev, [disciplinaId]: resumo }));
        }
        notificacaoService.sincronizarGeral().catch(() => {});
      }
      return sucesso;
    } catch (e: any) {
      setErro(e.message || 'Erro ao excluir avaliação.');
      throw e;
    }
  }, [avaliacoes]);

  return {
    avaliacoes,
    resumosDesempenho,
    proximasAvaliacoes,
    carregando,
    erro,
    carregarAvaliacoes,
    carregarDesempenhos,
    carregarProximasAvaliacoes,
    criarAvaliacao,
    atualizarAvaliacao,
    lancarNota,
    removerNota,
    excluirAvaliacao,
  };
};
