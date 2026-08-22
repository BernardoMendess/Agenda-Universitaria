import { DiaSemana } from '../modelos/HorarioAula';
import { Disciplina } from '../modelos/Disciplina';
import { Avaliacao, TIPO_AVALIACAO_CORES } from '../modelos/Avaliacao';
import { Tarefa, PRIORIDADE_CORES } from '../modelos/Tarefa';
import { AulaGradeItem, GradeSemanal } from './GradeHorariaService';
import { EventoAcademico } from '../modelos/EventoAcademico';
import {
  ItemCalendario,
  DiaCalendario,
  SemanaCalendario,
  CategoriaFiltroCalendario,
  EstatisticasCalendario,
} from '../modelos/Calendario';

export class CalendarioService {
  /**
   * Converte um objeto Date para string no formato "YYYY-MM-DD" local (evitando problemas de timezone UTC).
   */
  public converterDateParaStringISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  /**
   * Converte uma string "YYYY-MM-DD" para um objeto Date à meia-noite local.
   */
  public converterStringParaDate(dataStr: string): Date {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
  }

  /**
   * Converte um Date para o DiaSemana do sistema.
   */
  public converterDateParaDiaSemana(data: Date): DiaSemana {
    const diaNum = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const mapa: Record<number, DiaSemana> = {
      0: 'DOMINGO',
      1: 'SEGUNDA',
      2: 'TERCA',
      3: 'QUARTA',
      4: 'QUINTA',
      5: 'SEXTA',
      6: 'SABADO',
    };
    return mapa[diaNum];
  }

  /**
   * Formata o mês e ano por extenso (ex: "Agosto de 2026").
   */
  public obterNomeMesAno(ano: number, mes: number): string {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${meses[mes]} de ${ano}`;
  }

  /**
   * Formata uma data no formato "DD de MMMM de YYYY".
   */
  public formatarDataExtenso(dataStr: string): string {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    return `${dia} de ${meses[mes - 1]} de ${ano}`;
  }

  /**
   * Unifica dados de Avaliações, Tarefas, Grade de Aulas e Eventos Acadêmicos para um intervalo de datas.
   */
  public unificarEventos(
    avaliacoes: Avaliacao[],
    tarefas: Tarefa[],
    gradeSemanal: GradeSemanal,
    eventosAcademicos: EventoAcademico[],
    dataInicioStr: string,
    dataFimStr: string,
    disciplinas: Disciplina[] = []
  ): ItemCalendario[] {
    const mapaDisciplinas = new Map(disciplinas.map((d) => [d.id, d]));
    const itens: ItemCalendario[] = [];

    // 1. Unificar Avaliações (Provas, Trabalhos, Testes, Seminários)
    for (const aval of avaliacoes) {
      if (aval.data >= dataInicioStr && aval.data <= dataFimStr) {
        const disc = mapaDisciplinas.get(aval.disciplinaId);
        const corTipo = TIPO_AVALIACAO_CORES[aval.tipo] || '#6366f1';

        itens.push({
          id: `aval_${aval.id}`,
          origemId: aval.id,
          origem: 'AVALIACAO',
          categoria: 'PROVAS',
          tipo: aval.tipo,
          titulo: aval.titulo,
          subtitulo: disc ? disc.nome : undefined,
          descricao: aval.descricao,
          data: aval.data,
          horarioInicio: aval.horario,
          disciplinaId: aval.disciplinaId,
          disciplinaNome: disc?.nome,
          disciplinaCodigo: disc?.codigo,
          disciplinaCor: disc?.corIdentificacao || corTipo,
          concluida: aval.nota !== undefined && aval.nota !== null,
          destaqueCor: corTipo,
          tipoAvaliacao: aval.tipo,
          pesoAvaliacao: aval.peso,
          notaAvaliacao: aval.nota,
          notaMaximaAvaliacao: aval.notaMaxima,
        });
      }
    }

    // 2. Unificar Tarefas (Entregas e To-Do com data limite)
    for (const tar of tarefas) {
      if (tar.dataLimite && tar.dataLimite >= dataInicioStr && tar.dataLimite <= dataFimStr) {
        const disc = tar.disciplinaId ? mapaDisciplinas.get(tar.disciplinaId) : undefined;
        const corPrioridade = PRIORIDADE_CORES[tar.prioridade] || '#3b82f6';

        itens.push({
          id: `tar_${tar.id}`,
          origemId: tar.id,
          origem: 'TAREFA',
          categoria: 'ENTREGAS',
          tipo: 'TAREFA',
          titulo: tar.titulo,
          subtitulo: disc ? disc.nome : 'Tarefa Avulsa',
          descricao: tar.descricao,
          data: tar.dataLimite,
          horarioInicio: tar.horarioLimite,
          disciplinaId: tar.disciplinaId,
          disciplinaNome: disc?.nome,
          disciplinaCodigo: disc?.codigo,
          disciplinaCor: disc?.corIdentificacao || corPrioridade,
          concluida: tar.concluida,
          destaqueCor: corPrioridade,
          prioridadeTarefa: tar.prioridade,
        });
      }
    }

    // 3. Unificar Grade Horária (Expansão de dias da semana para datas reais no intervalo)
    const dataAtual = this.converterStringParaDate(dataInicioStr);
    const dataFim = this.converterStringParaDate(dataFimStr);

    while (dataAtual <= dataFim) {
      const dataStr = this.converterDateParaStringISO(dataAtual);
      const diaSemana = this.converterDateParaDiaSemana(dataAtual);
      const aulasDoDia = gradeSemanal[diaSemana] || [];

      for (const aula of aulasDoDia) {
        const disc = mapaDisciplinas.get(aula.disciplinaId);
        itens.push({
          id: `aula_${aula.id}_${dataStr}`,
          origemId: aula.id,
          origem: 'AULA',
          categoria: 'AULAS',
          tipo: 'AULA',
          titulo: aula.nomeDisciplina || disc?.nome || 'Aula',
          subtitulo: aula.localSala ? `Sala: ${aula.localSala}` : undefined,
          data: dataStr,
          horarioInicio: aula.horarioInicio,
          horarioFim: aula.horarioFim,
          disciplinaId: aula.disciplinaId,
          disciplinaNome: aula.nomeDisciplina || disc?.nome,
          disciplinaCodigo: aula.codigoDisciplina || disc?.codigo,
          disciplinaCor: aula.corIdentificacao || disc?.corIdentificacao || '#6366f1',
          destaqueCor: aula.corIdentificacao || disc?.corIdentificacao || '#6366f1',
          localSala: aula.localSala,
        });
      }

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // 4. Unificar Eventos Acadêmicos Especiais / Avulsos
    for (const eve of eventosAcademicos) {
      if (eve.data >= dataInicioStr && eve.data <= dataFimStr) {
        const disc = eve.disciplinaId ? mapaDisciplinas.get(eve.disciplinaId) : undefined;
        const corEvento = eve.cor || disc?.corIdentificacao || '#10b981';

        itens.push({
          id: `eve_${eve.id}`,
          origemId: eve.id,
          origem: 'EVENTO_ACADEMICO',
          categoria: 'EVENTOS',
          tipo: 'EVENTO',
          titulo: eve.titulo,
          subtitulo: disc ? disc.nome : eve.local,
          descricao: eve.descricao,
          data: eve.data,
          horarioInicio: eve.horarioInicio,
          horarioFim: eve.horarioFim,
          disciplinaId: eve.disciplinaId,
          disciplinaNome: disc?.nome,
          disciplinaCodigo: disc?.codigo,
          disciplinaCor: disc?.corIdentificacao || corEvento,
          destaqueCor: corEvento,
          localSala: eve.local,
        });
      }
    }

    return itens;
  }

  /**
   * Agrupa itens de calendário por data no formato YYYY-MM-DD e ordena cada dia cronologicamente.
   */
  public agruparEventosPorData(
    itens: ItemCalendario[]
  ): Record<string, ItemCalendario[]> {
    const mapa: Record<string, ItemCalendario[]> = {};

    for (const item of itens) {
      if (!mapa[item.data]) {
        mapa[item.data] = [];
      }
      mapa[item.data].push(item);
    }

    // Ordenação cronológica dentro de cada dia
    for (const dataKey of Object.keys(mapa)) {
      mapa[dataKey].sort((a, b) => {
        // Itens com horário primeiro
        if (a.horarioInicio && !b.horarioInicio) return -1;
        if (!a.horarioInicio && b.horarioInicio) return 1;
        if (a.horarioInicio && b.horarioInicio) {
          const compHora = a.horarioInicio.localeCompare(b.horarioInicio);
          if (compHora !== 0) return compHora;
        }

        // Prioridade por categoria: PROVAS > ENTREGAS > AULAS > EVENTOS
        const pesoCategoria: Record<string, number> = {
          PROVAS: 1,
          ENTREGAS: 2,
          AULAS: 3,
          EVENTOS: 4,
        };
        const pesoA = pesoCategoria[a.categoria] || 5;
        const pesoB = pesoCategoria[b.categoria] || 5;
        if (pesoA !== pesoB) return pesoA - pesoB;

        return a.titulo.localeCompare(b.titulo);
      });
    }

    return mapa;
  }

  /**
   * Filtra uma lista de itens de calendário por categoria e disciplina.
   */
  public filtrarEventos(
    itens: ItemCalendario[],
    filtroCategoria: CategoriaFiltroCalendario = 'TODOS',
    disciplinaId?: string
  ): ItemCalendario[] {
    return itens.filter((item) => {
      // Filtro por Categoria
      if (filtroCategoria !== 'TODOS' && item.categoria !== filtroCategoria) {
        return false;
      }

      // Filtro por Disciplina
      if (disciplinaId && item.disciplinaId !== disciplinaId) {
        return false;
      }

      return true;
    });
  }

  /**
   * Gera a matriz mensal (35 ou 42 células) com dias do mês atual e preenchimentos do mês anterior/seguinte.
   */
  public gerarMatrizMes(
    ano: number,
    mes: number, // 0-11
    eventosPorData: Record<string, ItemCalendario[]> = {},
    dataHoje: Date = new Date()
  ): DiaCalendario[] {
    const dataHojeStr = this.converterDateParaStringISO(dataHoje);
    const matriz: DiaCalendario[] = [];

    const primeiroDiaMes = new Date(ano, mes, 1);
    const ultimoDiaMes = new Date(ano, mes + 1, 0);

    const diaSemanaInicio = primeiroDiaMes.getDay(); // 0 (Dom) a 6 (Sáb)
    const totalDiasMes = ultimoDiaMes.getDate();

    // Dias do mês anterior para preenchimento da primeira semana
    if (diaSemanaInicio > 0) {
      const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
      for (let i = diaSemanaInicio - 1; i >= 0; i--) {
        const diaNum = ultimoDiaMesAnterior - i;
        const dataDia = new Date(ano, mes - 1, diaNum);
        const dataStr = this.converterDateParaStringISO(dataDia);
        const eventosDia = eventosPorData[dataStr] || [];

        matriz.push(
          this.construirDiaCalendario(
            dataStr,
            diaNum,
            mes - 1,
            ano,
            this.converterDateParaDiaSemana(dataDia),
            false,
            dataStr === dataHojeStr,
            eventosDia
          )
        );
      }
    }

    // Dias do mês atual
    for (let diaNum = 1; diaNum <= totalDiasMes; diaNum++) {
      const dataDia = new Date(ano, mes, diaNum);
      const dataStr = this.converterDateParaStringISO(dataDia);
      const eventosDia = eventosPorData[dataStr] || [];

      matriz.push(
        this.construirDiaCalendario(
          dataStr,
          diaNum,
          mes,
          ano,
          this.converterDateParaDiaSemana(dataDia),
          true,
          dataStr === dataHojeStr,
          eventosDia
        )
      );
    }

    // Dias do próximo mês para completar semanas cheias (múltiplo de 7)
    const restoSemana = matriz.length % 7;
    if (restoSemana > 0) {
      const diasParaCompletar = 7 - restoSemana;
      for (let diaNum = 1; diaNum <= diasParaCompletar; diaNum++) {
        const dataDia = new Date(ano, mes + 1, diaNum);
        const dataStr = this.converterDateParaStringISO(dataDia);
        const eventosDia = eventosPorData[dataStr] || [];

        matriz.push(
          this.construirDiaCalendario(
            dataStr,
            diaNum,
            mes + 1,
            ano,
            this.converterDateParaDiaSemana(dataDia),
            false,
            dataStr === dataHojeStr,
            eventosDia
          )
        );
      }
    }

    return matriz;
  }

  /**
   * Gera os 7 dias da semana (Domingo a Sábado) para a visão semanal.
   */
  public gerarSemana(
    dataReferencia: Date | string,
    eventosPorData: Record<string, ItemCalendario[]> = {},
    dataHoje: Date = new Date()
  ): SemanaCalendario {
    const dataRef =
      typeof dataReferencia === 'string'
        ? this.converterStringParaDate(dataReferencia)
        : new Date(dataReferencia);

    const dataHojeStr = this.converterDateParaStringISO(dataHoje);

    // Encontra o domingo que inicia a semana
    const diaSemanaNum = dataRef.getDay();
    const domingoInicio = new Date(dataRef);
    domingoInicio.setDate(dataRef.getDate() - diaSemanaNum);

    const dias: DiaCalendario[] = [];

    for (let i = 0; i < 7; i++) {
      const dataDia = new Date(domingoInicio);
      dataDia.setDate(domingoInicio.getDate() + i);

      const dataStr = this.converterDateParaStringISO(dataDia);
      const eventosDia = eventosPorData[dataStr] || [];

      dias.push(
        this.construirDiaCalendario(
          dataStr,
          dataDia.getDate(),
          dataDia.getMonth(),
          dataDia.getFullYear(),
          this.converterDateParaDiaSemana(dataDia),
          true,
          dataStr === dataHojeStr,
          eventosDia
        )
      );
    }

    const dataInicioStr = dias[0].dataStr;
    const dataFimStr = dias[6].dataStr;

    const diaIni = dias[0].diaDoMes;
    const diaFim = dias[6].diaDoMes;
    const mesIni = dias[0].mes;
    const mesFim = dias[6].mes;
    const ano = dias[6].ano;

    const meses = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    let rotuloSemana = `${diaIni} de ${meses[mesIni]} a ${diaFim} de ${meses[mesFim]} de ${ano}`;
    if (mesIni === mesFim) {
      rotuloSemana = `${diaIni} a ${diaFim} de ${meses[mesIni]} de ${ano}`;
    }

    return {
      dataInicioStr,
      dataFimStr,
      rotuloSemana,
      dias,
    };
  }

  /**
   * Constrói a entidade DiaCalendario com indicadores calculados.
   */
  private construirDiaCalendario(
    dataStr: string,
    diaDoMes: number,
    mes: number,
    ano: number,
    diaSemana: DiaSemana,
    ehMesAtual: boolean,
    ehHoje: boolean,
    eventos: ItemCalendario[]
  ): DiaCalendario {
    let temProva = false;
    let temEntrega = false;
    let temAula = false;
    let temEvento = false;

    const coresSet = new Set<string>();

    for (const ev of eventos) {
      if (ev.categoria === 'PROVAS') temProva = true;
      else if (ev.categoria === 'ENTREGAS') temEntrega = true;
      else if (ev.categoria === 'AULAS') temAula = true;
      else if (ev.categoria === 'EVENTOS') temEvento = true;

      if (ev.destaqueCor) {
        coresSet.add(ev.destaqueCor);
      }
    }

    return {
      dataStr,
      diaDoMes,
      mes,
      ano,
      diaSemana,
      ehHoje,
      ehMesAtual,
      eventos,
      indicadoresCores: Array.from(coresSet).slice(0, 4), // Máximo de 4 indicadores visuais
      temProva,
      temEntrega,
      temAula,
      temEvento,
    };
  }

  /**
   * Consolida estatísticas gerais para os itens de um período.
   */
  public calcularEstatisticas(itens: ItemCalendario[]): EstatisticasCalendario {
    let totalProvas = 0;
    let totalEntregas = 0;
    let totalAulas = 0;
    let totalEventos = 0;

    for (const item of itens) {
      if (item.categoria === 'PROVAS') totalProvas++;
      else if (item.categoria === 'ENTREGAS') totalEntregas++;
      else if (item.categoria === 'AULAS') totalAulas++;
      else if (item.categoria === 'EVENTOS') totalEventos++;
    }

    return {
      totalItens: itens.length,
      totalProvas,
      totalEntregas,
      totalAulas,
      totalEventos,
    };
  }
}

// Instância singleton do serviço
export const calendarioService = new CalendarioService();
