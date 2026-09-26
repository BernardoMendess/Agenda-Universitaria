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

const normalizarConfig = (cfg: ConfiguracaoNotificacao): ConfiguracaoNotificacao => ({
  ...cfg,
  antecedenciaAulaMinutos: Number(cfg.antecedenciaAulaMinutos) || 15,
  antecedenciaAvaliacoesHoras: Array.isArray(cfg.antecedenciaAvaliacoesHoras)
    ? cfg.antecedenciaAvaliacoesHoras.map(Number)
    : [24, 2],
  antecedenciaTarefasHoras: Array.isArray(cfg.antecedenciaTarefasHoras)
    ? cfg.antecedenciaTarefasHoras.map(Number)
    : [24, 2],
});

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
  const [permissaoConcedida, setPermissaoConcedida] = useState<boolean>(true);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Carrega as configurações, estatísticas, permissões e agendamentos locais ativos.
   */
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const [config, stats, lista, permissao] = await Promise.all([
        notificacaoService.obterConfiguracao(),
        notificacaoService.obterEstatisticas(),
        notificacaoService.listarNotificacoesAtivas(),
        notificacaoService.verificarPermissao(),
      ]);

      setConfiguracao(normalizarConfig(config));
      setEstatisticas(stats);
      setNotificacoes(lista);
      setPermissaoConcedida(permissao);
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
   * Atualiza preferências do usuário com atualização otimista imediata na UI.
   */
  const atualizarConfiguracao = useCallback(
    async (dados: Partial<ConfiguracaoNotificacao>) => {
      // 1. Atualização Otimista Imediata na Interface
      setConfiguracao((prev) => normalizarConfig({ ...prev, ...dados }));

      try {
        setSalvando(true);
        setErro(null);

        const atualizada = await notificacaoService.atualizarConfiguracao(dados);
        const configNormalizada = normalizarConfig(atualizada);
        setConfiguracao(configNormalizada);

        try {
          const [novasStats, novaLista] = await Promise.all([
            notificacaoService.obterEstatisticas(),
            notificacaoService.listarNotificacoesAtivas(),
          ]);
          setEstatisticas(novasStats);
          setNotificacoes(novaLista);
        } catch {
          // Estatísticas secundárias não bloqueiam retorno
        }

        return configNormalizada;
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
      setConfiguracao(normalizarConfig(padrao));

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
   * Solicita concessão de permissão de notificações do sistema operacional.
   */
  const solicitarPermissao = useCallback(async () => {
    try {
      const concedida = await notificacaoService.solicitarPermissao();
      setPermissaoConcedida(concedida);
      return concedida;
    } catch {
      return false;
    }
  }, []);

  const verificarPermissao = useCallback(async () => {
    try {
      const concedida = await notificacaoService.verificarPermissao();
      setPermissaoConcedida(concedida);
      return concedida;
    } catch {
      return false;
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
    permissaoConcedida,
    carregando,
    salvando,
    erro,
    solicitarPermissao,
    verificarPermissao,
    carregarDados,
    carregarConfiguracoes: carregarDados, // Alias para compatibilidade e correção de quebra
    atualizarConfiguracao,
    restaurarPadrao,
    testarAlerta,
    verificarAlertaFaltas,
  };
};
