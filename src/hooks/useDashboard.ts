import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDisciplinas } from './useDisciplinas';
import { useGradeHoraria } from './useGradeHoraria';
import { useFrequencia } from './useFrequencia';
import { useAvaliacoes } from './useAvaliacoes';
import { useTarefas } from './useTarefas';
import { dashboardService } from '../servicos/DashboardService';
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
    alternarConclusao,
    criarTarefa,
    incrementarFalta: incrementar,
    decrementarFalta: decrementar,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistoricoFaltas: obterHistorico,
    excluirDisciplina,
  };
};
