import {
  ArquivoBackup,
  DadosBackup,
  EstatisticasBackup,
  MetadadosBackup,
  ModoRestauracao,
  ResultadoRestauracaoBackup,
  ResultadoValidacaoBackup,
} from '../modelos/Backup';
import { IDisciplinaRepositorio, disciplinaRepositorio } from './banco/DisciplinaRepositorio';
import { IHorarioAulaRepositorio, horarioAulaRepositorio } from './banco/HorarioAulaRepositorio';
import { IFaltaRepositorio, faltaRepositorio } from './banco/FaltaRepositorio';
import { IAvaliacaoRepositorio, avaliacaoRepositorio } from './banco/AvaliacaoRepositorio';
import { ITarefaRepositorio, tarefaRepositorio } from './banco/TarefaRepositorio';
import { IEventoAcademicoRepositorio, eventoAcademicoRepositorio } from './banco/EventoAcademicoRepositorio';
import { IConfiguracaoNotificacaoRepositorio, configuracaoNotificacaoRepositorio } from './banco/ConfiguracaoNotificacaoRepositorio';
import { NotificacaoService, notificacaoService } from './NotificacaoService';

export const VERSAO_SCHEMA_ATUAL = '1.0.0';

/**
 * Serviço responsável pela gestão de portabilidade, exportação e restauração
 * manual de dados locais no CampusFlow (RF11).
 * Opera em modelo 100% Offline (RNF01, RNF02, RNF05).
 */
export class BackupService {
  private discRepo: IDisciplinaRepositorio;
  private horarioRepo: IHorarioAulaRepositorio;
  private faltaRepo: IFaltaRepositorio;
  private avaliacaoRepo: IAvaliacaoRepositorio;
  private tarefaRepo: ITarefaRepositorio;
  private eventoRepo: IEventoAcademicoRepositorio;
  private configRepo: IConfiguracaoNotificacaoRepositorio;
  private notifService: NotificacaoService;

  constructor(
    discRepo: IDisciplinaRepositorio = disciplinaRepositorio,
    horarioRepo: IHorarioAulaRepositorio = horarioAulaRepositorio,
    faltaRepo: IFaltaRepositorio = faltaRepositorio,
    avaliacaoRepo: IAvaliacaoRepositorio = avaliacaoRepositorio,
    tarefaRepo: ITarefaRepositorio = tarefaRepositorio,
    eventoRepo: IEventoAcademicoRepositorio = eventoAcademicoRepositorio,
    configRepo: IConfiguracaoNotificacaoRepositorio = configuracaoNotificacaoRepositorio,
    notifService: NotificacaoService = notificacaoService
  ) {
    this.discRepo = discRepo;
    this.horarioRepo = horarioRepo;
    this.faltaRepo = faltaRepo;
    this.avaliacaoRepo = avaliacaoRepo;
    this.tarefaRepo = tarefaRepo;
    this.eventoRepo = eventoRepo;
    this.configRepo = configRepo;
    this.notifService = notifService;
  }

  /**
   * Coleta o quantitativo atual de dados na base local.
   */
  async obterResumoDadosAtuais(): Promise<EstatisticasBackup> {
    const [disciplinas, horarios, faltas, avaliacoes, tarefas, eventos] =
      await Promise.all([
        this.discRepo.listarTodas(),
        this.horarioRepo.listarTodos(),
        this.faltaRepo.listarTodas(),
        this.avaliacaoRepo.listarTodas(),
        this.tarefaRepo.listarTodas(),
        this.eventoRepo.listarTodos(),
      ]);

    return {
      totalDisciplinas: disciplinas.length,
      totalHorarios: horarios.length,
      totalFaltas: faltas.length,
      totalAvaliacoes: avaliacoes.length,
      totalTarefas: tarefas.length,
      totalEventos: eventos.length,
    };
  }

  /**
   * Extrai todos os dados locais e empacota em um JSON estruturado com metadados de validação.
   */
  async gerarBackupJson(): Promise<string> {
    const [
      disciplinas,
      horariosAula,
      faltas,
      avaliacoes,
      tarefas,
      eventosAcademicos,
      configuracaoNotificacoes,
    ] = await Promise.all([
      this.discRepo.listarTodas(),
      this.horarioRepo.listarTodos(),
      this.faltaRepo.listarTodas(),
      this.avaliacaoRepo.listarTodas(),
      this.tarefaRepo.listarTodas(),
      this.eventoRepo.listarTodos(),
      this.configRepo.obterConfiguracao(),
    ]);

    const estatisticas: EstatisticasBackup = {
      totalDisciplinas: disciplinas.length,
      totalHorarios: horariosAula.length,
      totalFaltas: faltas.length,
      totalAvaliacoes: avaliacoes.length,
      totalTarefas: tarefas.length,
      totalEventos: eventosAcademicos.length,
    };

    const metadados: MetadadosBackup = {
      versaoSchema: VERSAO_SCHEMA_ATUAL,
      app: 'CampusFlow',
      dataExportacao: new Date().toISOString(),
      estatisticas,
    };

    const dados: DadosBackup = {
      disciplinas,
      horariosAula,
      faltas,
      avaliacoes,
      tarefas,
      eventosAcademicos,
      configuracaoNotificacoes,
    };

    const arquivo: ArquivoBackup = {
      metadados,
      dados,
    };

    return JSON.stringify(arquivo, null, 2);
  }

  /**
   * Valida a integridade, sintaxe JSON, metadados e integridade relacional do arquivo de backup.
   */
  validarBackupJson(conteudoJson: string): ResultadoValidacaoBackup {
    const erros: string[] = [];
    const avisos: string[] = [];

    if (!conteudoJson || conteudoJson.trim() === '') {
      return {
        valido: false,
        erros: ['O conteúdo do arquivo de backup está vazio.'],
        avisos: [],
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(conteudoJson);
    } catch (err: any) {
      return {
        valido: false,
        erros: [`Formato JSON inválido: ${err?.message || 'Erro de sintaxe'}`],
        avisos: [],
      };
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return {
        valido: false,
        erros: ['A estrutura raiz do backup deve ser um objeto JSON.'],
        avisos: [],
      };
    }

    // Validação de Metadados
    if (!parsed.metadados || typeof parsed.metadados !== 'object') {
      erros.push('Metadados de backup ausentes ou inválidos.');
    } else {
      if (parsed.metadados.app !== 'CampusFlow') {
        erros.push('O arquivo informado não é um backup oficial do CampusFlow.');
      }
      if (!parsed.metadados.versaoSchema) {
        avisos.push('Versão de schema ausente nos metadados. Assumindo versão padrão.');
      }
    }

    // Validação da Seção de Dados
    if (!parsed.dados || typeof parsed.dados !== 'object') {
      erros.push('Seção de dados do backup ausente ou inválida.');
      return { valido: false, erros, avisos };
    }

    const { dados } = parsed;

    if (!Array.isArray(dados.disciplinas)) {
      erros.push('A lista de disciplinas é obrigatória e deve ser um array.');
    }
    if (!Array.isArray(dados.horariosAula)) {
      erros.push('A lista de horários de aula é obrigatória e deve ser um array.');
    }
    if (!Array.isArray(dados.faltas)) {
      erros.push('A lista de faltas é obrigatória e deve ser um array.');
    }
    if (!Array.isArray(dados.avaliacoes)) {
      erros.push('A lista de avaliações é obrigatória e deve ser um array.');
    }
    if (!Array.isArray(dados.tarefas)) {
      erros.push('A lista de tarefas é obrigatória e deve ser um array.');
    }
    if (!Array.isArray(dados.eventosAcademicos)) {
      erros.push('A lista de eventos acadêmicos é obrigatória e deve ser um array.');
    }

    if (erros.length > 0) {
      return { valido: false, erros, avisos };
    }

    // Validação de Integridade Relacional (Chaves Estrangeiras)
    const idsDisciplinas = new Set<string>(
      dados.disciplinas.filter((d: any) => d && d.id).map((d: any) => d.id)
    );

    // 1. Horários de Aula
    dados.horariosAula.forEach((h: any, idx: number) => {
      if (!h.id || !h.disciplinaId || !h.diaSemana || !h.horarioInicio || !h.horarioFim) {
        erros.push(`Horário na posição ${idx} contém campos obrigatórios ausentes.`);
      } else if (!idsDisciplinas.has(h.disciplinaId)) {
        avisos.push(`Horário "${h.id}" referencia disciplina inexistente no backup (${h.disciplinaId}).`);
      }
    });

    // 2. Faltas
    dados.faltas.forEach((f: any, idx: number) => {
      if (!f.id || !f.disciplinaId || !f.data || !f.horario) {
        erros.push(`Falta na posição ${idx} contém campos obrigatórios ausentes.`);
      } else if (!idsDisciplinas.has(f.disciplinaId)) {
        avisos.push(`Falta "${f.id}" referencia disciplina inexistente no backup (${f.disciplinaId}).`);
      }
    });

    // 3. Avaliações
    dados.avaliacoes.forEach((a: any, idx: number) => {
      if (!a.id || !a.disciplinaId || !a.titulo || !a.tipo || !a.data) {
        erros.push(`Avaliação na posição ${idx} contém campos obrigatórios ausentes.`);
      } else if (!idsDisciplinas.has(a.disciplinaId)) {
        avisos.push(`Avaliação "${a.titulo}" referencia disciplina inexistente no backup (${a.disciplinaId}).`);
      }
    });

    // 4. Tarefas (disciplinaId opcional)
    dados.tarefas.forEach((t: any, idx: number) => {
      if (!t.id || !t.titulo) {
        erros.push(`Tarefa na posição ${idx} contém campos obrigatórios ausentes.`);
      } else if (t.disciplinaId && !idsDisciplinas.has(t.disciplinaId)) {
        avisos.push(`Tarefa "${t.titulo}" referencia disciplina inexistente (${t.disciplinaId}).`);
      }
    });

    // 5. Eventos Acadêmicos (disciplinaId opcional)
    dados.eventosAcademicos.forEach((e: any, idx: number) => {
      if (!e.id || !e.titulo || !e.data) {
        erros.push(`Evento na posição ${idx} contém campos obrigatórios ausentes.`);
      } else if (e.disciplinaId && !idsDisciplinas.has(e.disciplinaId)) {
        avisos.push(`Evento "${e.titulo}" referencia disciplina inexistente (${e.disciplinaId}).`);
      }
    });

    const valido = erros.length === 0;

    return {
      valido,
      erros,
      avisos,
      metadados: parsed.metadados,
      dados: parsed.dados,
    };
  }

  /**
   * Restaura os dados a partir de um JSON estruturado de backup.
   * Repopula os repositórios locais e dispara o reagendamento automático de todas as notificações.
   */
  async restaurarBackup(
    conteudoJson: string,
    modo: ModoRestauracao = 'SUBSTITUIR'
  ): Promise<ResultadoRestauracaoBackup> {
    const validacao = this.validarBackupJson(conteudoJson);

    if (!validacao.valido || !validacao.dados) {
      throw new Error(
        `Falha na validação do backup:\n${validacao.erros.join('\n')}`
      );
    }

    const { dados } = validacao;

    if (modo === 'SUBSTITUIR') {
      // 1. Limpa todas as tabelas locais
      this.discRepo.limpar();
      this.horarioRepo.limpar();
      this.faltaRepo.limpar();
      this.avaliacaoRepo.limpar();
      this.tarefaRepo.limpar();
      this.eventoRepo.limpar();
      await this.notifService.cancelarTodos();

      // 2. Restaura dados em lote
      await this.discRepo.restaurarEmLote(dados.disciplinas);
      await this.horarioRepo.restaurarEmLote(dados.horariosAula);
      await this.faltaRepo.restaurarEmLote(dados.faltas);
      await this.avaliacaoRepo.restaurarEmLote(dados.avaliacoes);
      await this.tarefaRepo.restaurarEmLote(dados.tarefas);
      await this.eventoRepo.restaurarEmLote(dados.eventosAcademicos);

      if (dados.configuracaoNotificacoes) {
        await this.configRepo.salvarConfiguracao(dados.configuracaoNotificacoes);
      }
    } else {
      // MODO MESCLAR (Merge)
      // Restaura dados preservando o que já existe (chaves iguais são sobrescritas ou adicionadas)
      await this.discRepo.restaurarEmLote(dados.disciplinas);
      await this.horarioRepo.restaurarEmLote(dados.horariosAula);
      await this.faltaRepo.restaurarEmLote(dados.faltas);
      await this.avaliacaoRepo.restaurarEmLote(dados.avaliacoes);
      await this.tarefaRepo.restaurarEmLote(dados.tarefas);
      await this.eventoRepo.restaurarEmLote(dados.eventosAcademicos);

      if (dados.configuracaoNotificacoes) {
        await this.configRepo.salvarConfiguracao(dados.configuracaoNotificacoes);
      }
    }

    // 3. Re-sincroniza todos os alarmes locais e notificações com base nos dados restaurados
    const [todasDisciplinas, todosHorarios, todasAvaliacoes, todasTarefas] =
      await Promise.all([
        this.discRepo.listarTodas(),
        this.horarioRepo.listarTodos(),
        this.avaliacaoRepo.listarTodas(),
        this.tarefaRepo.listarTodas(),
      ]);

    await this.notifService.sincronizarTodasNotificacoes(
      todasDisciplinas,
      todosHorarios,
      todasAvaliacoes,
      todasTarefas
    );

    const estatisticasRestauradas: EstatisticasBackup = {
      totalDisciplinas: todasDisciplinas.length,
      totalHorarios: todosHorarios.length,
      totalFaltas: (await this.faltaRepo.listarTodas()).length,
      totalAvaliacoes: todasAvaliacoes.length,
      totalTarefas: todasTarefas.length,
      totalEventos: (await this.eventoRepo.listarTodos()).length,
    };

    return {
      sucesso: true,
      mensagem:
        modo === 'SUBSTITUIR'
          ? 'Backup restaurado com sucesso! Todos os dados e lembretes foram sincronizados.'
          : 'Dados mesclados com sucesso! O ecossistema de dados foi atualizado.',
      modo,
      estatisticasRestauradas,
      erros: validacao.avisos.length > 0 ? validacao.avisos : undefined,
    };
  }
}

// Instância singleton do serviço
export const backupService = new BackupService();
