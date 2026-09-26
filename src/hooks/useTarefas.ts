import { useState, useCallback } from 'react';
import {
  Tarefa,
  CriarTarefaDTO,
  AtualizarTarefaDTO,
  FiltroTarefasDTO,
  TarefaComDisciplina,
  EstatisticasTarefas,
} from '../modelos/Tarefa';
import { tarefaService } from '../servicos/TarefaService';
import { notificacaoService } from '../servicos/NotificacaoService';

export const useTarefas = () => {
  const [tarefas, setTarefas] = useState<TarefaComDisciplina[]>([]);
  const [tarefasHome, setTarefasHome] = useState<TarefaComDisciplina[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasTarefas>({
    total: 0,
    pendentes: 0,
    concluidas: 0,
    atrasadas: 0,
    hoje: 0,
    percentualConclusao: 0,
  });
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Carrega lista de tarefas aplicando filtros.
   */
  const carregarTarefas = useCallback(async (filtro?: FiltroTarefasDTO) => {
    try {
      setCarregando(true);
      setErro(null);
      const lista = await tarefaService.listarComFiltros(filtro);
      setTarefas(lista);
      const stats = await tarefaService.obterEstatisticas(filtro?.disciplinaId);
      setEstatisticas(stats);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar tarefas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  /**
   * Carrega estatísticas gerais ou para uma disciplina.
   */
  const carregarEstatisticas = useCallback(async (disciplinaId?: string) => {
    try {
      const stats = await tarefaService.obterEstatisticas(disciplinaId);
      setEstatisticas(stats);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar estatísticas.');
    }
  }, []);

  /**
   * Carrega tarefas mais urgentes para exibição no Dashboard Home.
   */
  const carregarTarefasHome = useCallback(async (limite = 5) => {
    try {
      const lista = await tarefaService.obterTarefasPendentesProximas(limite);
      setTarefasHome(lista);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar tarefas da home.');
    }
  }, []);

  /**
   * Cria uma nova tarefa.
   */
  const criarTarefa = useCallback(async (dados: CriarTarefaDTO): Promise<Tarefa> => {
    try {
      setErro(null);
      const nova = await tarefaService.criarTarefa(dados);
      await carregarTarefas();
      await carregarTarefasHome();
      notificacaoService.sincronizarGeral().catch(() => {});
      return nova;
    } catch (e: any) {
      setErro(e.message || 'Erro ao criar tarefa.');
      throw e;
    }
  }, [carregarTarefas, carregarTarefasHome]);

  /**
   * Atualiza dados de uma tarefa existente.
   */
  const atualizarTarefa = useCallback(async (id: string, dados: AtualizarTarefaDTO): Promise<Tarefa> => {
    try {
      setErro(null);
      const atualizada = await tarefaService.atualizarTarefa(id, dados);
      await carregarTarefas();
      await carregarTarefasHome();
      notificacaoService.sincronizarGeral().catch(() => {});
      return atualizada;
    } catch (e: any) {
      setErro(e.message || 'Erro ao atualizar tarefa.');
      throw e;
    }
  }, [carregarTarefas, carregarTarefasHome]);

  /**
   * Alterna a conclusão de uma tarefa (1 Toque).
   */
  const alternarConclusao = useCallback(async (id: string): Promise<Tarefa> => {
    try {
      setErro(null);
      const alterada = await tarefaService.alternarStatusConclusao(id);
      // Atualiza o estado local imediatamente para fluidez
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                concluida: alterada.concluida,
                dataConclusao: alterada.dataConclusao,
                statusPrazo: tarefaService.calcularStatusPrazo(t.dataLimite, t.horarioLimite, alterada.concluida),
              }
            : t
        )
      );
      if (alterada.concluida) {
        setTarefasHome((prev) => prev.filter((t) => t.id !== id));
      }
      // Sempre recarrega as tarefas pendentes da home (garante que tarefas desfeitas reapareçam imediatamente)
      await carregarTarefasHome();
      // Recarrega estatísticas em segundo plano
      await carregarEstatisticas();
      notificacaoService.sincronizarGeral().catch(() => {});
      return alterada;
    } catch (e: any) {
      setErro(e.message || 'Erro ao alternar conclusão.');
      throw e;
    }
  }, [carregarTarefasHome, carregarEstatisticas]);

  /**
   * Exclui uma tarefa.
   */
  const excluirTarefa = useCallback(async (id: string): Promise<boolean> => {
    try {
      setErro(null);
      const sucesso = await tarefaService.excluirTarefa(id);
      if (sucesso) {
        setTarefas((prev) => prev.filter((t) => t.id !== id));
        setTarefasHome((prev) => prev.filter((t) => t.id !== id));
        await carregarEstatisticas();
        notificacaoService.sincronizarGeral().catch(() => {});
      }
      return sucesso;
    } catch (e: any) {
      setErro(e.message || 'Erro ao excluir tarefa.');
      throw e;
    }
  }, [carregarEstatisticas]);

  return {
    tarefas,
    tarefasHome,
    estatisticas,
    carregando,
    erro,
    carregarTarefas,
    carregarEstatisticas,
    carregarTarefasHome,
    criarTarefa,
    atualizarTarefa,
    alternarConclusao,
    excluirTarefa,
  };
};
