import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDisciplinas } from './useDisciplinas';
import { useGradeHoraria } from './useGradeHoraria';
import { useFrequencia } from './useFrequencia';
import { useAvaliacoes } from './useAvaliacoes';
import { useTarefas } from './useTarefas';
import { dashboardService } from '../servicos/DashboardService';
import {
  acoesRapidasService,
  FeedbackAcaoRapida,
} from '../servicos/AcoesRapidasService';
import {
  AulaHojeComStatus,
  MateriaAlertaItem,
  MetricasDashboard,
} from '../modelos/Dashboard';

export const useDashboard = () => {
  const { disciplinas, carregando: carregandoDisciplinas, excluirDisciplina } = useDisciplinas();
  const { aulasDeHoje, carregando: carregandoGrade, carregarGrade } = useGradeHoraria();
  const {
    resumos,
    alertaCritico,
    fecharAlertaCritico,
    carregarResumos,
    incrementar,
    decrementar,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistorico,
  } = useFrequencia();
  const {
    resumosDesempenho,
    carregarDesempenhos,
    proximasAvaliacoes,
    carregarProximasAvaliacoes,
  } = useAvaliacoes();
  const {
    tarefasHome,
    estatisticas,
    carregando: carregandoTarefas,
    carregarTarefasHome,
    alternarConclusao,
    criarTarefa,
  } = useTarefas();

  const [carregandoGeral, setCarregandoGeral] = useState(false);
  const [feedbackAcaoRapida, setFeedbackAcaoRapida] = useState<FeedbackAcaoRapida | null>(null);

  /**
   * Recarrega todos os dados do dashboard em paralelo.
   */
  const recarregarDashboard = useCallback(async () => {
    try {
      setCarregandoGeral(true);
      await Promise.all([
        carregarGrade(),
        carregarProximasAvaliacoes(5),
        carregarTarefasHome(5),
      ]);
      if (disciplinas.length > 0) {
        await Promise.all([
          carregarResumos(disciplinas),
          carregarDesempenhos(disciplinas),
        ]);
      }
    } catch (e) {
      // Erros tratados pelos hooks individuais
    } finally {
      setCarregandoGeral(false);
    }
  }, [
    disciplinas,
    carregarGrade,
    carregarProximasAvaliacoes,
    carregarTarefasHome,
    carregarResumos,
    carregarDesempenhos,
  ]);

  useEffect(() => {
    if (disciplinas.length > 0) {
      carregarResumos(disciplinas);
      carregarDesempenhos(disciplinas);
    }
    carregarProximasAvaliacoes(5);
    carregarTarefasHome(5);
  }, [
    disciplinas,
    carregarResumos,
    carregarDesempenhos,
    carregarProximasAvaliacoes,
    carregarTarefasHome,
  ]);

  // Aulas de hoje enriquecidas com status em tempo real (EM_ANDAMENTO, PROXIMA, ENCERRADA, FUTURA)
  const aulasProcessadas: AulaHojeComStatus[] = useMemo(() => {
    return dashboardService.processarAulasDeHoje(aulasDeHoje);
  }, [aulasDeHoje]);

  // Matérias que requerem atenção (Faltas >= 75%, limite 0 estourado, ou notas baixas/em risco)
  const materiasEmAlerta: MateriaAlertaItem[] = useMemo(() => {
    return dashboardService.identificarMateriasEmAlerta(
      disciplinas,
      resumos,
      resumosDesempenho
    );
  }, [disciplinas, resumos, resumosDesempenho]);

  // Métricas unificadas do topo do Dashboard
  const metricas: MetricasDashboard = useMemo(() => {
    return dashboardService.calcularMetricasDashboard(
      disciplinas,
      aulasDeHoje,
      estatisticas,
      materiasEmAlerta,
      proximasAvaliacoes.length
    );
  }, [
    disciplinas,
    aulasDeHoje,
    estatisticas,
    materiasEmAlerta,
    proximasAvaliacoes.length,
  ]);

  const dataExtenso = useMemo(() => {
    return dashboardService.formatarDataExtenso();
  }, []);

  /**
   * Registro de falta em 1 toque com feedback imediato e suporte a desfazer (RNF03).
   */
  const incrementarFaltaRapida = useCallback(
    async (disciplinaId: string) => {
      const disc = disciplinas.find((d) => d.id === disciplinaId);
      const resumoAtual = resumos[disciplinaId];
      const faltasAnteriores = resumoAtual?.totalFaltas || 0;
      const novoTotal = faltasAnteriores + 1;

      await incrementar(disciplinaId);

      const acao = acoesRapidasService.registrarAcao({
        tipo: 'INCREMENTAR_FALTA',
        descricao: `Falta registrada em ${disc?.nome || 'Disciplina'}`,
        disciplinaId,
        disciplinaNome: disc?.nome,
        totalFaltasAposAcao: novoTotal,
        limiteFaltas: disc?.limiteMaximoFaltas,
      });

      const feedback = acoesRapidasService.criarFeedback(acao);
      setFeedbackAcaoRapida(feedback);
    },
    [disciplinas, resumos, incrementar]
  );

  /**
   * Remoção de falta em 1 toque com feedback imediato (RNF03).
   */
  const decrementarFaltaRapida = useCallback(
    async (disciplinaId: string) => {
      const disc = disciplinas.find((d) => d.id === disciplinaId);
      const resumoAtual = resumos[disciplinaId];
      const faltasAnteriores = resumoAtual?.totalFaltas || 0;
      const novoTotal = Math.max(0, faltasAnteriores - 1);

      await decrementar(disciplinaId);

      const acao = acoesRapidasService.registrarAcao({
        tipo: 'DECREMENTAR_FALTA',
        descricao: `Falta removida de ${disc?.nome || 'Disciplina'}`,
        disciplinaId,
        disciplinaNome: disc?.nome,
        totalFaltasAposAcao: novoTotal,
        limiteFaltas: disc?.limiteMaximoFaltas,
      });

      const feedback = acoesRapidasService.criarFeedback(acao);
      setFeedbackAcaoRapida(feedback);
    },
    [disciplinas, resumos, decrementar]
  );

  /**
   * Conclusão de tarefa em 1 toque com feedback imediato e suporte a desfazer (RNF03).
   */
  const alternarConclusaoTarefaRapida = useCallback(
    async (tarefaId: string) => {
      const tarefa = tarefasHome.find((t) => t.id === tarefaId);
      const novoEstado = !tarefa?.concluida;

      await alternarConclusao(tarefaId);

      const acao = acoesRapidasService.registrarAcao({
        tipo: novoEstado ? 'CONCLUIR_TAREFA' : 'REABRIR_TAREFA',
        descricao: novoEstado ? 'Tarefa concluída' : 'Tarefa reaberta',
        tarefaId,
        tarefaTitulo: tarefa?.titulo,
        concluidaAposAcao: novoEstado,
      });

      const feedback = acoesRapidasService.criarFeedback(acao);
      setFeedbackAcaoRapida(feedback);
    },
    [tarefasHome, alternarConclusao]
  );

  /**
   * Desfaz a última ação rápida de 1 toque executada (RNF03).
   */
  const desfazerUltimaAcao = useCallback(async () => {
    const ultimaAcao = acoesRapidasService.desfazerUltimaAcao();
    if (!ultimaAcao) return;

    if (ultimaAcao.tipo === 'INCREMENTAR_FALTA' && ultimaAcao.disciplinaId) {
      await decrementar(ultimaAcao.disciplinaId);
    } else if (ultimaAcao.tipo === 'DECREMENTAR_FALTA' && ultimaAcao.disciplinaId) {
      await incrementar(ultimaAcao.disciplinaId);
    } else if (
      (ultimaAcao.tipo === 'CONCLUIR_TAREFA' || ultimaAcao.tipo === 'REABRIR_TAREFA') &&
      ultimaAcao.tarefaId
    ) {
      await alternarConclusao(ultimaAcao.tarefaId);
    }

    setFeedbackAcaoRapida(null);
  }, [incrementar, decrementar, alternarConclusao]);

  const fecharFeedback = useCallback(() => {
    setFeedbackAcaoRapida(null);
  }, []);

  const carregando =
    carregandoDisciplinas ||
    carregandoGrade ||
    carregandoTarefas ||
    carregandoGeral;

  return {
    disciplinas,
    aulasProcessadas,
    materiasEmAlerta,
    tarefasHome,
    proximasAvaliacoes,
    estatisticas,
    metricas,
    dataExtenso,
    resumosFrequencia: resumos,
    resumosDesempenho,
    carregando,
    alertaCritico,
    fecharAlertaCritico,
    recarregarDashboard,
    alternarConclusao: alternarConclusaoTarefaRapida,
    criarTarefa,
    incrementarFalta: incrementarFaltaRapida,
    decrementarFalta: decrementarFaltaRapida,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistoricoFaltas: obterHistorico,
    excluirDisciplina,
    feedbackAcaoRapida,
    desfazerUltimaAcao,
    fecharFeedback,
  };
};
