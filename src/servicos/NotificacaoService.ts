import {
  NotificacaoAgendada,
  ConfiguracaoNotificacao,
  CriarNotificacaoAgendadaDTO,
  EstatisticasNotificacoes,
  TipoNotificacao,
} from '../modelos/Notificacao';
import { HorarioAula, DIAS_SEMANA_LABELS } from '../modelos/HorarioAula';
import { Disciplina } from '../modelos/Disciplina';
import { Avaliacao, TIPO_AVALIACAO_LABELS } from '../modelos/Avaliacao';
import { Tarefa } from '../modelos/Tarefa';
import { ResumoFrequencia } from '../modelos/Falta';
import {
  IConfiguracaoNotificacaoRepositorio,
  configuracaoNotificacaoRepositorio,
} from './banco/ConfiguracaoNotificacaoRepositorio';
import {
  INotificacaoAgendadaRepositorio,
  notificacaoAgendadaRepositorio,
} from './banco/NotificacaoAgendadaRepositorio';
import {
  INotificadorLocal,
  notificadorLocalDriver,
} from './notificacoes/NotificadorLocalDriver';

/**
 * Serviço responsável por toda a lógica de negócio das notificações locais e alarmes (RF10).
 * Opera em modo 100% Offline (RNF01, RNF04, RNF05).
 */
export class NotificacaoService {
  private configRepo: IConfiguracaoNotificacaoRepositorio;
  private notifRepo: INotificacaoAgendadaRepositorio;
  private notificador: INotificadorLocal;

  constructor(
    configRepo: IConfiguracaoNotificacaoRepositorio = configuracaoNotificacaoRepositorio,
    notifRepo: INotificacaoAgendadaRepositorio = notificacaoAgendadaRepositorio,
    notificador: INotificadorLocal = notificadorLocalDriver
  ) {
    this.configRepo = configRepo;
    this.notifRepo = notifRepo;
    this.notificador = notificador;
  }

  // --- Gestão de Configurações ---

  async obterConfiguracao(): Promise<ConfiguracaoNotificacao> {
    return await this.configRepo.obterConfiguracao();
  }

  async atualizarConfiguracao(
    dados: Partial<ConfiguracaoNotificacao>
  ): Promise<ConfiguracaoNotificacao> {
    const configAtualizada = await this.configRepo.salvarConfiguracao(dados);
    return configAtualizada;
  }

  async restaurarConfiguracaoPadrao(): Promise<ConfiguracaoNotificacao> {
    return await this.configRepo.restaurarPadrao();
  }

  // --- Lembretes de Aulas (Grade Horária) ---

  /**
   * Agenda lembretes locais para os blocos de horário de aula semanais.
   */
  async agendarLembretesAulas(
    horarios: HorarioAula[],
    disciplinas: Disciplina[],
    antecedenciaMinutos?: number
  ): Promise<NotificacaoAgendada[]> {
    const config = await this.configRepo.obterConfiguracao();
    if (!config.aulasAtivas) {
      await this.notifRepo.removerPorTipo('AULA');
      return [];
    }

    const minutos = antecedenciaMinutos ?? config.antecedenciaAulaMinutos;
    const mapaDisciplinas = new Map(disciplinas.map((d) => [d.id, d]));

    // Limpa notificações antigas de aulas para evitar duplicações
    await this.notifRepo.removerPorTipo('AULA');

    const agendamentos: CriarNotificacaoAgendadaDTO[] = [];

    for (const h of horarios) {
      const disc = mapaDisciplinas.get(h.disciplinaId);
      if (!disc) continue;

      const salaTexto = h.localSala || disc.localSala ? ` na sala ${h.localSala || disc.localSala}` : '';
      const diaTexto = DIAS_SEMANA_LABELS[h.diaSemana] || h.diaSemana;

      const horarioDisparo = this.calcularHorarioDisparo(h.horarioInicio, minutos);

      agendamentos.push({
        tipo: 'AULA',
        titulo: `Aula de ${disc.nome}`,
        mensagem: `Sua aula de ${disc.nome} começará às ${h.horarioInicio}${salaTexto} (${diaTexto}).`,
        referenciaId: h.id,
        disciplinaId: disc.id,
        disciplinaNome: disc.nome,
        disciplinaCor: disc.corIdentificacao,
        diaSemana: h.diaSemana,
        horarioInicio: h.horarioInicio,
        antecedenciaMinutos: minutos,
        prioridade: 'MEDIA',
      });
    }

    const salvas = await this.notifRepo.salvarEmLote(agendamentos);
    for (const notif of salvas) {
      await this.notificador.agendar(notif);
    }

    return salvas;
  }

  // --- Lembretes de Avaliações (Provas, Testes, Trabalhos) ---

  /**
   * Agenda lembretes de avaliações com antecedência configurável (ex: 24h e 2h antes).
   */
  async agendarLembretesAvaliacao(
    avaliacao: Avaliacao,
    disciplinaNome: string,
    disciplinaCor?: string,
    antecedenciasHoras?: number[]
  ): Promise<NotificacaoAgendada[]> {
    const config = await this.configRepo.obterConfiguracao();
    if (!config.avaliacoesAtivas) {
      return [];
    }

    // Remove lembretes anteriores desta avaliação específica
    await this.cancelarLembretesPorReferencia(avaliacao.id);

    // Se já foi lançada nota, a avaliação já ocorreu, não precisa agendar
    if (avaliacao.nota !== null && avaliacao.nota !== undefined) {
      return [];
    }

    const horasLista = antecedenciasHoras ?? config.antecedenciaAvaliacoesHoras;
    const tipoRotulo = TIPO_AVALIACAO_LABELS[avaliacao.tipo] || 'Avaliação';
    const horaTexto = avaliacao.horario ? ` às ${avaliacao.horario}` : '';

    const agendamentos: CriarNotificacaoAgendadaDTO[] = [];

    for (const horas of horasLista) {
      const dataHoraDisparo = this.calcularDataHoraDisparo(
        avaliacao.data,
        avaliacao.horario || '08:00',
        horas
      );

      agendamentos.push({
        tipo: 'AVALIACAO',
        titulo: `${tipoRotulo} de ${disciplinaNome}`,
        mensagem: `Lembrete: "${avaliacao.titulo}" de ${disciplinaNome} está agendada para ${avaliacao.data}${horaTexto} (em ${horas}h).`,
        referenciaId: avaliacao.id,
        disciplinaId: avaliacao.disciplinaId,
        disciplinaNome,
        disciplinaCor,
        dataHoraDisparo,
        antecedenciaHoras: horas,
        prioridade: horas <= 2 ? 'ALTA' : 'MEDIA',
      });
    }

    const salvas = await this.notifRepo.salvarEmLote(agendamentos);
    for (const notif of salvas) {
      await this.notificador.agendar(notif);
    }

    return salvas;
  }

  // --- Lembretes de Tarefas (To-Do List) ---

  /**
   * Agenda lembretes locais para prazos de tarefas pendentes.
   */
  async agendarLembretesTarefa(
    tarefa: Tarefa,
    disciplinaNome?: string,
    disciplinaCor?: string,
    antecedenciasHoras?: number[]
  ): Promise<NotificacaoAgendada[]> {
    const config = await this.configRepo.obterConfiguracao();
    if (!config.tarefasAtivas) {
      return [];
    }

    // Remove lembretes anteriores desta tarefa
    await this.cancelarLembretesPorReferencia(tarefa.id);

    // Se tarefa já concluída ou sem data limite definida, não agenda
    if (tarefa.concluida || !tarefa.dataLimite) {
      return [];
    }

    const horasLista = antecedenciasHoras ?? config.antecedenciaTarefasHoras;
    const horaTexto = tarefa.horarioLimite ? ` às ${tarefa.horarioLimite}` : '';
    const materiaTexto = disciplinaNome ? ` [${disciplinaNome}]` : '';

    const agendamentos: CriarNotificacaoAgendadaDTO[] = [];

    for (const horas of horasLista) {
      const dataHoraDisparo = this.calcularDataHoraDisparo(
        tarefa.dataLimite,
        tarefa.horarioLimite || '23:59',
        horas
      );

      agendamentos.push({
        tipo: 'TAREFA',
        titulo: `Prazo de Tarefa${materiaTexto}`,
        mensagem: `A tarefa "${tarefa.titulo}" vence em ${horas}h (Data limite: ${tarefa.dataLimite}${horaTexto}).`,
        referenciaId: tarefa.id,
        disciplinaId: tarefa.disciplinaId,
        disciplinaNome,
        disciplinaCor,
        dataHoraDisparo,
        antecedenciaHoras: horas,
        prioridade: tarefa.prioridade === 'ALTA' || horas <= 2 ? 'ALTA' : 'MEDIA',
      });
    }

    const salvas = await this.notifRepo.salvarEmLote(agendamentos);
    for (const notif of salvas) {
      await this.notificador.agendar(notif);
    }

    return salvas;
  }

  // --- Alerta Crítico Imediato de Limite de Faltas (RF10) ---

  /**
   * Verifica a frequência de uma disciplina e dispara alerta imediato sonoro/tátil
   * caso o limite de faltas tenha sido atingido ou ultrapassado.
   */
  async verificarEDispararAlertaFaltas(
    disciplina: Disciplina,
    resumo: ResumoFrequencia
  ): Promise<{ disparouAlerta: boolean; mensagem?: string }> {
    const config = await this.configRepo.obterConfiguracao();
    if (!config.alertaFaltasAtivo) {
      return { disparouAlerta: false };
    }

    // Disciplinas sem limite de faltas não geram alerta de limite
    if (!resumo.presencaObrigatoria || resumo.limiteMaximoFaltas === null) {
      return { disparouAlerta: false };
    }

    // Limite atingido (faltasRestantes === 0) ou ultrapassado (reprovadoPorFalta === true)
    if (resumo.reprovadoPorFalta || resumo.faltasRestantes === 0) {
      const titulo = `LIMITE DE FALTAS ATINGIDO: ${disciplina.nome}`;
      const mensagem = resumo.reprovadoPorFalta
        ? `Atenção! Você ultrapassou o limite de faltas em ${disciplina.nome} (${resumo.totalFaltas}/${resumo.limiteMaximoFaltas} faltas registradas).`
        : `Atenção! Você atingiu o limite máximo de ${resumo.limiteMaximoFaltas} faltas em ${disciplina.nome}. Próxima falta causará reprovação!`;

      if (config.vibracaoHabilitada || config.somHabilitado) {
        await this.notificador.emitirAlertaCritico(titulo, mensagem);
      }

      await this.notifRepo.salvar({
        tipo: 'LIMITE_FALTAS',
        titulo,
        mensagem,
        referenciaId: disciplina.id,
        disciplinaId: disciplina.id,
        disciplinaNome: disciplina.nome,
        disciplinaCor: disciplina.corIdentificacao,
        prioridade: 'CRITICA',
      });

      return { disparouAlerta: true, mensagem };
    }

    return { disparouAlerta: false };
  }

  // --- Cancelamento & Limpeza ---

  async cancelarLembretesPorReferencia(referenciaId: string): Promise<number> {
    const notifs = await this.notifRepo.listarPorReferenciaId(referenciaId);
    for (const n of notifs) {
      await this.notificador.cancelar(n.id);
    }
    return await this.notifRepo.removerPorReferenciaId(referenciaId);
  }

  async cancelarTodos(): Promise<void> {
    await this.notificador.cancelarTodos();
    this.notifRepo.limpar();
  }

  // --- Sincronização Geral em Lote ---

  /**
   * Sincroniza e recalcula todos os lembretes do aplicativo com base nos dados atuais.
   */
  async sincronizarTodasNotificacoes(
    disciplinas: Disciplina[],
    horarios: HorarioAula[],
    avaliacoes: Avaliacao[],
    tarefas: Tarefa[]
  ): Promise<EstatisticasNotificacoes> {
    const config = await this.configRepo.obterConfiguracao();
    const mapaDisciplinas = new Map(disciplinas.map((d) => [d.id, d]));

    // 1. Aulas
    if (config.aulasAtivas) {
      await this.agendarLembretesAulas(horarios, disciplinas);
    } else {
      await this.notifRepo.removerPorTipo('AULA');
    }

    // 2. Avaliações
    if (config.avaliacoesAtivas) {
      await this.notifRepo.removerPorTipo('AVALIACAO');
      for (const aval of avaliacoes) {
        const disc = mapaDisciplinas.get(aval.disciplinaId);
        await this.agendarLembretesAvaliacao(
          aval,
          disc?.nome || 'Disciplina',
          disc?.corIdentificacao
        );
      }
    } else {
      await this.notifRepo.removerPorTipo('AVALIACAO');
    }

    // 3. Tarefas
    if (config.tarefasAtivas) {
      await this.notifRepo.removerPorTipo('TAREFA');
      for (const tar of tarefas) {
        const disc = tar.disciplinaId ? mapaDisciplinas.get(tar.disciplinaId) : undefined;
        await this.agendarLembretesTarefa(
          tar,
          disc?.nome,
          disc?.corIdentificacao
        );
      }
    } else {
      await this.notifRepo.removerPorTipo('TAREFA');
    }

    return await this.obterEstatisticas();
  }

  // --- Estatísticas & Listagens ---

  async listarNotificacoesAtivas(): Promise<NotificacaoAgendada[]> {
    return await this.notifRepo.listarTodas();
  }

  async obterEstatisticas(): Promise<EstatisticasNotificacoes> {
    const todas = await this.notifRepo.listarTodas();
    const config = await this.configRepo.obterConfiguracao();

    const aulas = todas.filter((n) => n.tipo === 'AULA').length;
    const avaliacoes = todas.filter((n) => n.tipo === 'AVALIACAO').length;
    const tarefas = todas.filter((n) => n.tipo === 'TAREFA').length;

    return {
      totalAgendadas: todas.length,
      totalAulas: aulas,
      totalAvaliacoes: avaliacoes,
      totalTarefas: tarefas,
      alertaFaltasAtivo: config.alertaFaltasAtivo,
    };
  }

  /**
   * Realiza um teste de alerta imediato com vibração/som para validação do usuário.
   */
  async testarAlertaSonoroETatil(): Promise<void> {
    await this.notificador.emitirAlertaCritico(
      'Teste de Alerta CampusFlow',
      'As notificações sonoras e táteis estão funcionando corretamente!'
    );
  }

  // --- Funções Auxiliares de Cálculo de Horários ---

  private calcularHorarioDisparo(horarioInicio: string, antecedenciaMinutos: number): string {
    const [h, m] = horarioInicio.split(':').map(Number);
    let totalMinutos = h * 60 + m - antecedenciaMinutos;

    if (totalMinutos < 0) {
      totalMinutos += 24 * 60; // dia anterior
    }

    const horas = Math.floor(totalMinutos / 60) % 24;
    const minutos = totalMinutos % 60;

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }

  private calcularDataHoraDisparo(
    dataStr: string,
    horaStr: string,
    antecedenciaHoras: number
  ): string {
    try {
      const dataHora = new Date(`${dataStr}T${horaStr}:00`);
      const disparoTime = dataHora.getTime() - antecedenciaHoras * 60 * 60 * 1000;
      return new Date(disparoTime).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}

export const notificacaoService = new NotificacaoService();
