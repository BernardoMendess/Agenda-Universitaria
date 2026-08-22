import {
  Tarefa,
  CriarTarefaDTO,
  AtualizarTarefaDTO,
  FiltroTarefasDTO,
  TarefaComDisciplina,
  EstatisticasTarefas,
  StatusPrazoTarefa,
} from '../modelos/Tarefa';
import {
  ITarefaRepositorio,
  tarefaRepositorio,
} from './banco/TarefaRepositorio';
import {
  IDisciplinaRepositorio,
  disciplinaRepositorio,
} from './banco/DisciplinaRepositorio';

/**
 * Camada de Serviço responsável pela lógica de negócios das Tarefas (RF07).
 * Segue os princípios SOLID (Responsabilidade Única, Inversão de Dependência).
 */
export class TarefaService {
  constructor(
    private repositorio: ITarefaRepositorio = tarefaRepositorio,
    private repoDisciplina: IDisciplinaRepositorio = disciplinaRepositorio
  ) {}

  /**
   * Valida o formato e valores para criação/atualização de uma tarefa.
   */
  private async validarDadosTarefa(
    dados: Partial<CriarTarefaDTO>,
    ehCriacao = true
  ): Promise<void> {
    if (ehCriacao || dados.titulo !== undefined) {
      if (!dados.titulo || dados.titulo.trim().length === 0) {
        throw new Error('O título da tarefa é obrigatório.');
      }
      if (dados.titulo.trim().length < 2) {
        throw new Error('O título da tarefa deve ter pelo menos 2 caracteres.');
      }
      if (dados.titulo.trim().length > 150) {
        throw new Error('O título da tarefa não pode exceder 150 caracteres.');
      }
    }

    if (dados.disciplinaId) {
      const disc = await this.repoDisciplina.buscarPorId(dados.disciplinaId);
      if (!disc) {
        throw new Error(`Disciplina vinculada não encontrada (ID: ${dados.disciplinaId}).`);
      }
    }

    if (dados.dataLimite) {
      const regexData = /^\d{4}-\d{2}-\d{2}$/;
      if (!regexData.test(dados.dataLimite)) {
        throw new Error('A data limite deve estar no formato AAAA-MM-DD.');
      }
      const dataObj = new Date(`${dados.dataLimite}T00:00:00`);
      if (isNaN(dataObj.getTime())) {
        throw new Error('Data limite inválida.');
      }
    }

    if (dados.horarioLimite) {
      const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!regexHora.test(dados.horarioLimite)) {
        throw new Error('O horário limite deve estar no formato HH:mm (24 horas).');
      }
    }
  }

  /**
   * Calcula o status do prazo de uma tarefa em relação à data atual.
   */
  public calcularStatusPrazo(
    dataLimite?: string,
    horarioLimite?: string,
    concluida = false
  ): StatusPrazoTarefa {
    if (!dataLimite) {
      return 'SEM_PRAZO';
    }

    if (concluida) {
      return 'EM_DIA';
    }

    const agora = new Date();
    const [ano, mes, dia] = dataLimite.split('-').map(Number);
    let hora = 23;
    let minuto = 59;

    if (horarioLimite) {
      const [h, m] = horarioLimite.split(':').map(Number);
      hora = h;
      minuto = m;
    }

    const dataHoraLimite = new Date(ano, mes - 1, dia, hora, minuto, 59, 999);

    if (dataHoraLimite.getTime() < agora.getTime()) {
      return 'ATRASADA';
    }

    const hojeZero = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const dataLimiteZero = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
    const diffDias = Math.round((dataLimiteZero.getTime() - hojeZero.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return 'HOJE';
    }

    if (diffDias === 1) {
      return 'AMANHA';
    }

    return 'EM_DIA';
  }

  /**
   * Calcula os dias restantes até a data limite.
   */
  public calcularDiasRestantes(dataLimite?: string): number | undefined {
    if (!dataLimite) return undefined;

    const agora = new Date();
    const hojeZero = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const [ano, mes, dia] = dataLimite.split('-').map(Number);
    const dataLimiteZero = new Date(ano, mes - 1, dia, 0, 0, 0, 0);

    return Math.round((dataLimiteZero.getTime() - hojeZero.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Cria uma nova tarefa (vinculada a uma disciplina ou avulsa).
   */
  async criarTarefa(dados: CriarTarefaDTO): Promise<Tarefa> {
    await this.validarDadosTarefa(dados, true);
    return this.repositorio.criar(dados);
  }

  /**
   * Atualiza dados de uma tarefa existente.
   */
  async atualizarTarefa(id: string, dados: AtualizarTarefaDTO): Promise<Tarefa> {
    const existente = await this.repositorio.buscarPorId(id);
    if (!existente) {
      throw new Error(`Tarefa com ID ${id} não encontrada.`);
    }

    await this.validarDadosTarefa(dados as Partial<CriarTarefaDTO>, false);
    return this.repositorio.atualizar(id, dados);
  }

  /**
   * Alterna o estado de conclusão da tarefa (feita / não feita).
   */
  async alternarStatusConclusao(id: string): Promise<Tarefa> {
    return this.repositorio.alternarConclusao(id);
  }

  /**
   * Marca explicitamente a tarefa como concluída.
   */
  async marcarComoConcluida(id: string): Promise<Tarefa> {
    return this.repositorio.marcarConcluida(id, true);
  }

  /**
   * Marca explicitamente a tarefa como pendente.
   */
  async marcarComoPendente(id: string): Promise<Tarefa> {
    return this.repositorio.marcarConcluida(id, false);
  }

  /**
   * Exclui uma tarefa pelo ID.
   */
  async excluirTarefa(id: string): Promise<boolean> {
    return this.repositorio.excluir(id);
  }

  /**
   * Busca uma tarefa por ID.
   */
  async buscarPorId(id: string): Promise<Tarefa | null> {
    return this.repositorio.buscarPorId(id);
  }

  /**
   * Lista tarefas aplicando filtros e enriquecendo com dados de Disciplina e Status de Prazo.
   */
  async listarComFiltros(filtro?: FiltroTarefasDTO): Promise<TarefaComDisciplina[]> {
    let tarefas: Tarefa[];

    if (filtro?.disciplinaId) {
      tarefas = await this.repositorio.listarPorDisciplina(filtro.disciplinaId);
    } else {
      tarefas = await this.repositorio.listarTodas();
    }

    // Carrega mapa de disciplinas para enriquecer informações
    const disciplinas = await this.repoDisciplina.listarTodas();
    const mapaDisciplinas = new Map(disciplinas.map((d) => [d.id, d]));

    const tarefasEnriquecidas: TarefaComDisciplina[] = tarefas.map((t) => {
      const disc = t.disciplinaId ? mapaDisciplinas.get(t.disciplinaId) : undefined;
      const statusPrazo = this.calcularStatusPrazo(t.dataLimite, t.horarioLimite, t.concluida);
      const diasRestantes = this.calcularDiasRestantes(t.dataLimite);

      return {
        ...t,
        disciplinaNome: disc?.nome,
        disciplinaCor: disc?.corIdentificacao,
        statusPrazo,
        diasRestantes,
      };
    });

    // Aplica filtros adicionais em memória
    return tarefasEnriquecidas.filter((t) => {
      if (filtro?.status === 'PENDENTES' && t.concluida) return false;
      if (filtro?.status === 'CONCLUIDAS' && !t.concluida) return false;
      if (filtro?.apenasHoje && t.statusPrazo !== 'HOJE') return false;
      if (filtro?.atrasadas && t.statusPrazo !== 'ATRASADA') return false;
      return true;
    });
  }

  /**
   * Retorna as próximas tarefas pendentes mais urgentes (Atrasadas, Hoje, Próximas).
   */
  async obterTarefasPendentesProximas(limite = 5): Promise<TarefaComDisciplina[]> {
    const pendentes = await this.listarComFiltros({ status: 'PENDENTES' });

    // Ordenação por urgência: Atrasadas > Hoje > Amanhã > Outras datas > Sem prazo
    const pesoStatus: Record<StatusPrazoTarefa, number> = {
      ATRASADA: 0,
      HOJE: 1,
      AMANHA: 2,
      EM_DIA: 3,
      SEM_PRAZO: 4,
    };

    pendentes.sort((a, b) => {
      const pesoA = pesoStatus[a.statusPrazo];
      const pesoB = pesoStatus[b.statusPrazo];
      if (pesoA !== pesoB) return pesoA - pesoB;

      if (a.dataLimite && b.dataLimite) {
        const comp = a.dataLimite.localeCompare(b.dataLimite);
        if (comp !== 0) return comp;
        return (a.horarioLimite || '').localeCompare(b.horarioLimite || '');
      }

      return b.dataCriacao.localeCompare(a.dataCriacao);
    });

    return pendentes.slice(0, limite);
  }

  /**
   * Calcula estatísticas gerais ou para uma disciplina específica.
   */
  async obterEstatisticas(disciplinaId?: string): Promise<EstatisticasTarefas> {
    const lista = await this.listarComFiltros(disciplinaId ? { disciplinaId } : undefined);

    const total = lista.length;
    const concluidas = lista.filter((t) => t.concluida).length;
    const pendentes = total - concluidas;
    const atrasadas = lista.filter((t) => !t.concluida && t.statusPrazo === 'ATRASADA').length;
    const hoje = lista.filter((t) => !t.concluida && t.statusPrazo === 'HOJE').length;
    const percentualConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    return {
      total,
      pendentes,
      concluidas,
      atrasadas,
      hoje,
      percentualConclusao,
    };
  }

  /**
   * Exclui todas as tarefas vinculadas a uma disciplina (usado em cascata).
   */
  async excluirTarefasPorDisciplina(disciplinaId: string): Promise<number> {
    return this.repositorio.excluirPorDisciplina(disciplinaId);
  }

  /**
   * Limpa todos os dados (útil para testes unitários).
   */
  limpar(): void {
    this.repositorio.limpar();
  }
}

// Instância singleton do serviço
export const tarefaService = new TarefaService();
