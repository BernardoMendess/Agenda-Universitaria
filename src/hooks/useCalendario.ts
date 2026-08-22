import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDisciplinas } from './useDisciplinas';
import { useGradeHoraria } from './useGradeHoraria';
import { useAvaliacoes } from './useAvaliacoes';
import { useTarefas } from './useTarefas';
import { eventoAcademicoRepositorio } from '../servicos/banco/EventoAcademicoRepositorio';
import { calendarioService } from '../servicos/CalendarioService';
import {
  ItemCalendario,
  DiaCalendario,
  SemanaCalendario,
  ModoVisaoCalendario,
  CategoriaFiltroCalendario,
  EstatisticasCalendario,
} from '../modelos/Calendario';
import {
  EventoAcademico,
  CriarEventoAcademicoDTO,
  AtualizarEventoAcademicoDTO,
} from '../modelos/EventoAcademico';

export const useCalendario = () => {
  const hoje = useMemo(() => new Date(), []);
  const hojeStr = useMemo(
    () => calendarioService.converterDateParaStringISO(hoje),
    [hoje]
  );

  const { disciplinas } = useDisciplinas();
  const { gradeSemanal, carregarGrade } = useGradeHoraria();
  const { avaliacoes, carregarAvaliacoes } = useAvaliacoes();
  const { tarefas, carregarTarefas, alternarConclusao: alternarConclusaoTarefa } =
    useTarefas();

  const [eventosAcademicos, setEventosAcademicos] = useState<EventoAcademico[]>(
    []
  );
  const [dataSelecionada, setDataSelecionada] = useState<string>(hojeStr);
  const [anoVisualizacao, setAnoVisualizacao] = useState<number>(
    hoje.getFullYear()
  );
  const [mesVisualizacao, setMesVisualizacao] = useState<number>(
    hoje.getMonth()
  ); // 0-11
  const [semanaReferencia, setSemanaReferencia] = useState<string>(hojeStr);
  const [modoVisao, setModoVisao] = useState<ModoVisaoCalendario>('MENSAL');
  const [filtroCategoria, setFiltroCategoria] =
    useState<CategoriaFiltroCalendario>('TODOS');
  const [filtroDisciplinaId, setFiltroDisciplinaId] = useState<
    string | undefined
  >(undefined);
  const [carregando, setCarregando] = useState<boolean>(false);

  // Carrega eventos acadêmicos do repositório
  const carregarEventosAcademicos = useCallback(async () => {
    try {
      const lista = await eventoAcademicoRepositorio.listarTodos();
      setEventosAcademicos(lista);
    } catch (e) {
      // Ignora erro ou mantém estado
    }
  }, []);

  // Recarrega todos os dados necessários
  const recarregarTodosDados = useCallback(async () => {
    setCarregando(true);
    try {
      await Promise.all([
        carregarGrade(),
        carregarAvaliacoes(),
        carregarTarefas(),
        carregarEventosAcademicos(),
      ]);
    } finally {
      setCarregando(false);
    }
  }, [
    carregarGrade,
    carregarAvaliacoes,
    carregarTarefas,
    carregarEventosAcademicos,
  ]);

  useEffect(() => {
    recarregarTodosDados();
  }, [recarregarTodosDados]);

  // Intervalo de datas a unificar no calendário (cobre o mês atual + margem de 10 dias antes/depois)
  const intervaloDatas = useMemo(() => {
    if (modoVisao === 'MENSAL') {
      const primeiroDiaMatriz = new Date(anoVisualizacao, mesVisualizacao, -6);
      const ultimoDiaMatriz = new Date(
        anoVisualizacao,
        mesVisualizacao + 1,
        14
      );
      return {
        inicioStr: calendarioService.converterDateParaStringISO(primeiroDiaMatriz),
        fimStr: calendarioService.converterDateParaStringISO(ultimoDiaMatriz),
      };
    } else {
      const dataRef = calendarioService.converterStringParaDate(semanaReferencia);
      const dom = new Date(dataRef);
      dom.setDate(dataRef.getDate() - dataRef.getDay() - 1);
      const sab = new Date(dataRef);
      sab.setDate(dataRef.getDate() + (6 - dataRef.getDay()) + 1);
      return {
        inicioStr: calendarioService.converterDateParaStringISO(dom),
        fimStr: calendarioService.converterDateParaStringISO(sab),
      };
    }
  }, [anoVisualizacao, mesVisualizacao, semanaReferencia, modoVisao]);

  // 1. Todos os itens unificados no intervalo ativo
  const todosEventosUnificados: ItemCalendario[] = useMemo(() => {
    return calendarioService.unificarEventos(
      avaliacoes,
      tarefas,
      gradeSemanal,
      eventosAcademicos,
      intervaloDatas.inicioStr,
      intervaloDatas.fimStr,
      disciplinas
    );
  }, [
    avaliacoes,
    tarefas,
    gradeSemanal,
    eventosAcademicos,
    intervaloDatas,
    disciplinas,
  ]);

  // 2. Itens após aplicação dos filtros de categoria e disciplina
  const eventosFiltrados: ItemCalendario[] = useMemo(() => {
    return calendarioService.filtrarEventos(
      todosEventosUnificados,
      filtroCategoria,
      filtroDisciplinaId
    );
  }, [todosEventosUnificados, filtroCategoria, filtroDisciplinaId]);

  // 3. Mapa de eventos agrupados por data
  const eventosAgrupadosPorData = useMemo(() => {
    return calendarioService.agruparEventosPorData(eventosFiltrados);
  }, [eventosFiltrados]);

  // 4. Matriz do Grid Mensal
  const matrizMes: DiaCalendario[] = useMemo(() => {
    return calendarioService.gerarMatrizMes(
      anoVisualizacao,
      mesVisualizacao,
      eventosAgrupadosPorData,
      hoje
    );
  }, [anoVisualizacao, mesVisualizacao, eventosAgrupadosPorData, hoje]);

  // 5. Estrutura da Semana Atual na visão semanal
  const semanaAtual: SemanaCalendario = useMemo(() => {
    return calendarioService.gerarSemana(
      semanaReferencia,
      eventosAgrupadosPorData,
      hoje
    );
  }, [semanaReferencia, eventosAgrupadosPorData, hoje]);

  // 6. Itens do dia selecionado
  const eventosDoDiaSelecionado: ItemCalendario[] = useMemo(() => {
    return eventosAgrupadosPorData[dataSelecionada] || [];
  }, [eventosAgrupadosPorData, dataSelecionada]);

  // 7. Estatísticas do período
  const estatisticasPeriodo: EstatisticasCalendario = useMemo(() => {
    return calendarioService.calcularEstatisticas(eventosFiltrados);
  }, [eventosFiltrados]);

  // Ações de Navegação
  const avancarMes = useCallback(() => {
    if (mesVisualizacao === 11) {
      setMesVisualizacao(0);
      setAnoVisualizacao((a) => a + 1);
    } else {
      setMesVisualizacao((m) => m + 1);
    }
  }, [mesVisualizacao]);

  const voltarMes = useCallback(() => {
    if (mesVisualizacao === 0) {
      setMesVisualizacao(11);
      setAnoVisualizacao((a) => a - 1);
    } else {
      setMesVisualizacao((m) => m - 1);
    }
  }, [mesVisualizacao]);

  const avancarSemana = useCallback(() => {
    const dataRef = calendarioService.converterStringParaDate(semanaReferencia);
    dataRef.setDate(dataRef.getDate() + 7);
    const novaDataStr = calendarioService.converterDateParaStringISO(dataRef);
    setSemanaReferencia(novaDataStr);
    setDataSelecionada(novaDataStr);
  }, [semanaReferencia]);

  const voltarSemana = useCallback(() => {
    const dataRef = calendarioService.converterStringParaDate(semanaReferencia);
    dataRef.setDate(dataRef.getDate() - 7);
    const novaDataStr = calendarioService.converterDateParaStringISO(dataRef);
    setSemanaReferencia(novaDataStr);
    setDataSelecionada(novaDataStr);
  }, [semanaReferencia]);

  const irParaHoje = useCallback(() => {
    const agora = new Date();
    const agoraStr = calendarioService.converterDateParaStringISO(agora);
    setAnoVisualizacao(agora.getFullYear());
    setMesVisualizacao(agora.getMonth());
    setSemanaReferencia(agoraStr);
    setDataSelecionada(agoraStr);
  }, []);

  const selecionarData = useCallback(
    (dataStr: string) => {
      setDataSelecionada(dataStr);
      setSemanaReferencia(dataStr);
      const dataObj = calendarioService.converterStringParaDate(dataStr);
      if (
        dataObj.getMonth() !== mesVisualizacao ||
        dataObj.getFullYear() !== anoVisualizacao
      ) {
        setMesVisualizacao(dataObj.getMonth());
        setAnoVisualizacao(dataObj.getFullYear());
      }
    },
    [mesVisualizacao, anoVisualizacao]
  );

  // Operações de Eventos Acadêmicos
  const criarEventoAcademico = useCallback(
    async (dados: CriarEventoAcademicoDTO) => {
      const novo = await eventoAcademicoRepositorio.criar(dados);
      await carregarEventosAcademicos();
      return novo;
    },
    [carregarEventosAcademicos]
  );

  const atualizarEventoAcademico = useCallback(
    async (id: string, dados: AtualizarEventoAcademicoDTO) => {
      const atualizado = await eventoAcademicoRepositorio.atualizar(id, dados);
      await carregarEventosAcademicos();
      return atualizado;
    },
    [carregarEventosAcademicos]
  );

  const excluirEventoAcademico = useCallback(
    async (id: string) => {
      const res = await eventoAcademicoRepositorio.excluir(id);
      await carregarEventosAcademicos();
      return res;
    },
    [carregarEventosAcademicos]
  );

  const alternarConclusao = useCallback(
    async (tarefaId: string) => {
      await alternarConclusaoTarefa(tarefaId);
    },
    [alternarConclusaoTarefa]
  );

  const tituloPeriodo = useMemo(() => {
    if (modoVisao === 'MENSAL') {
      return calendarioService.obterNomeMesAno(
        anoVisualizacao,
        mesVisualizacao
      );
    } else {
      return semanaAtual.rotuloSemana;
    }
  }, [modoVisao, anoVisualizacao, mesVisualizacao, semanaAtual]);

  return {
    disciplinas,
    dataSelecionada,
    anoVisualizacao,
    mesVisualizacao,
    semanaReferencia,
    modoVisao,
    filtroCategoria,
    filtroDisciplinaId,
    carregando,
    tituloPeriodo,
    matrizMes,
    semanaAtual,
    eventosDoDiaSelecionado,
    estatisticasPeriodo,
    hojeStr,
    avancarMes,
    voltarMes,
    avancarSemana,
    voltarSemana,
    irParaHoje,
    selecionarData,
    setModoVisao,
    setFiltroCategoria,
    setFiltroDisciplinaId,
    criarEventoAcademico,
    atualizarEventoAcademico,
    excluirEventoAcademico,
    alternarConclusao,
    recarregarTodosDados,
  };
};
