import { useState, useEffect, useCallback } from 'react';
import {
  ConfiguracaoNotificacao,
  CONFIGURACAO_NOTIFICACAO_PADRAO,
  NotificacaoAgendada,
  EstatisticasNotificacoes,
} from '../modelos/Notificacao';
import { notificacaoService } from '../servicos/NotificacaoService';
import { Disciplina } from '../modelos/Disciplina';
import { ResumoFrequencia } from '../modelos/Falta';

export const useNotificacoes = () => {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoNotificacao>(
    CONFIGURACAO_NOTIFICACAO_PADRAO
  );
  const [estatisticas, setEstatisticas] = useState<EstatisticasNotificacoes>({
    totalAgendadas: 0,
    totalAulas: 0,
    totalAvaliacoes: 0,
    totalTarefas: 0,
    alertaFaltasAtivo: true,
  });
  const [notificacoes, setNotificacoes] = useState<NotificacaoAgendada[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Carrega as configurações, estatísticas e agendamentos locais ativos.
   */
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const [config, stats, lista] = await Promise.all([
        notificacaoService.obterConfiguracao(),
        notificacaoService.obterEstatisticas(),
        notificacaoService.listarNotificacoesAtivas(),
      ]);

      setConfiguracao(config);
      setEstatisticas(stats);
      setNotificacoes(lista);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar configurações de notificações.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  /**
   * Atualiza preferências do usuário e recarrega estatísticas.
   */
  const atualizarConfiguracao = useCallback(
    async (dados: Partial<ConfiguracaoNotificacao>) => {
      try {
        setSalvando(true);
        setErro(null);

        const atualizada = await notificacaoService.atualizarConfiguracao(dados);
        setConfiguracao(atualizada);

        const [novasStats, novaLista] = await Promise.all([
          notificacaoService.obterEstatisticas(),
          notificacaoService.listarNotificacoesAtivas(),
        ]);

        setEstatisticas(novasStats);
        setNotificacoes(novaLista);
        return atualizada;
      } catch (e: any) {
        setErro(e.message || 'Erro ao salvar preferências de notificação.');
        throw e;
      } finally {
        setSalvando(false);
      }
    },
    []
  );

  /**
   * Restaura as configurações padrão recomendadas.
   */
  const restaurarPadrao = useCallback(async () => {
    try {
      setSalvando(true);
      setErro(null);

      const padrao = await notificacaoService.restaurarConfiguracaoPadrao();
      setConfiguracao(padrao);

      const stats = await notificacaoService.obterEstatisticas();
      setEstatisticas(stats);
      return padrao;
    } catch (e: any) {
      setErro(e.message || 'Erro ao restaurar configurações padrão.');
      throw e;
    } finally {
      setSalvando(false);
    }
  }, []);

  /**
   * Executa um teste sonoro e tátil imediato no aparelho.
   */
  const testarAlerta = useCallback(async () => {
    try {
      await notificacaoService.testarAlertaSonoroETatil();
    } catch (e: any) {
      setErro(e.message || 'Erro ao executar teste de alerta.');
    }
  }, []);

  /**
   * Verifica se o registro de faltas atingiu/excedeu o limite e emite o alerta crítico imediato.
   */
  const verificarAlertaFaltas = useCallback(
    async (disciplina: Disciplina, resumo: ResumoFrequencia) => {
      return await notificacaoService.verificarEDispararAlertaFaltas(
        disciplina,
        resumo
      );
    },
    []
  );

  return {
    configuracao,
    estatisticas,
    notificacoes,
    carregando,
    salvando,
    erro,
    carregarDados,
    atualizarConfiguracao,
    restaurarPadrao,
    testarAlerta,
    verificarAlertaFaltas,
  };
};
