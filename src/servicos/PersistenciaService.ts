import { gerenciadorBancoDados, RelatorioStatusBanco } from './banco/sqlite/GerenciadorBancoDados';
import { disciplinaRepositorio } from './banco/DisciplinaRepositorio';
import { horarioAulaRepositorio } from './banco/HorarioAulaRepositorio';
import { faltaRepositorio } from './banco/FaltaRepositorio';
import { avaliacaoRepositorio } from './banco/AvaliacaoRepositorio';
import { tarefaRepositorio } from './banco/TarefaRepositorio';
import { eventoAcademicoRepositorio } from './banco/EventoAcademicoRepositorio';
import { notificacaoAgendadaRepositorio } from './banco/NotificacaoAgendadaRepositorio';

export interface EstatisticasRegistrosLocais {
  disciplinas: number;
  horariosAula: number;
  faltas: number;
  avaliacoes: number;
  tarefas: number;
  eventosAcademicos: number;
  notificacoesAgendadas: number;
  totalRegistros: number;
}

export interface StatusPersistenciaCompleto {
  motor: 'SQLite (Local)' | 'Room / WatermelonDB';
  statusBanco: RelatorioStatusBanco;
  registros: EstatisticasRegistrosLocais;
  armazenamentoEstritamenteLocal: boolean;
  isolamentoGarantido: boolean;
  timestamp: string;
}

/**
 * Interface do serviço de persistência local (RNF02).
 */
export interface IPersistenciaService {
  inicializarPersistencia(): Promise<boolean>;
  obterStatusPersistencia(): Promise<StatusPersistenciaCompleto>;
  contarRegistrosLocais(): Promise<EstatisticasRegistrosLocais>;
  verificarIntegridadeLocal(): Promise<boolean>;
}

/**
 * Serviço responsável por gerenciar e auditar o armazenamento estritamente local (RNF02).
 */
export class PersistenciaService implements IPersistenciaService {
  /**
   * Inicializa o banco de dados e as tabelas relacionais.
   */
  async inicializarPersistencia(): Promise<boolean> {
    return gerenciadorBancoDados.inicializar();
  }

  /**
   * Contabiliza o número de registros armazenados localmente em cada tabela.
   */
  async contarRegistrosLocais(): Promise<EstatisticasRegistrosLocais> {
    const [
      disciplinas,
      horariosAula,
      faltas,
      avaliacoes,
      tarefas,
      eventosAcademicos,
      notificacoes,
    ] = await Promise.all([
      disciplinaRepositorio.listarTodas(),
      horarioAulaRepositorio.listarTodos(),
      faltaRepositorio.listarTodas(),
      avaliacaoRepositorio.listarTodas(),
      tarefaRepositorio.listarTodas(),
      eventoAcademicoRepositorio.listarTodos(),
      notificacaoAgendadaRepositorio.listarTodas(),
    ]);

    const totalRegistros =
      disciplinas.length +
      horariosAula.length +
      faltas.length +
      avaliacoes.length +
      tarefas.length +
      eventosAcademicos.length +
      notificacoes.length;

    return {
      disciplinas: disciplinas.length,
      horariosAula: horariosAula.length,
      faltas: faltas.length,
      avaliacoes: avaliacoes.length,
      tarefas: tarefas.length,
      eventosAcademicos: eventosAcademicos.length,
      notificacoesAgendadas: notificacoes.length,
      totalRegistros,
    };
  }

  /**
   * Retorna o diagnóstico completo da persistência local.
   */
  async obterStatusPersistencia(): Promise<StatusPersistenciaCompleto> {
    const statusBanco = gerenciadorBancoDados.obterRelatorioStatus();
    const registros = await this.contarRegistrosLocais();

    return {
      motor: 'SQLite (Local)',
      statusBanco,
      registros,
      armazenamentoEstritamenteLocal: true,
      isolamentoGarantido: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verifica se os dados e o schema local estão íntegros.
   */
  async verificarIntegridadeLocal(): Promise<boolean> {
    const status = await this.obterStatusPersistencia();
    return status.statusBanco.integridade === 'OK' && status.armazenamentoEstritamenteLocal;
  }
}

export const persistenciaService = new PersistenciaService();
