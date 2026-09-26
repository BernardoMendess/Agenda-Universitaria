import { ConfiguracaoNotificacaoRepositorioSQLite } from '../src/servicos/banco/sqlite/ConfiguracaoNotificacaoRepositorioSQLite';
import { gerenciadorBancoDados } from '../src/servicos/banco/sqlite/GerenciadorBancoDados';
import { CONFIGURACAO_NOTIFICACAO_PADRAO } from '../src/modelos/Notificacao';

describe('ConfiguracaoNotificacaoRepositorioSQLite', () => {
  let repositorio: ConfiguracaoNotificacaoRepositorioSQLite;

  beforeEach(() => {
    repositorio = new ConfiguracaoNotificacaoRepositorioSQLite();
    jest.restoreAllMocks();
  });

  it('não deve causar recursão infinita quando o banco SQLite não possui configuração salva', async () => {
    let registroSalvo: any = null;

    const mockDb = {
      getFirstSync: jest.fn().mockImplementation((sql: string) => {
        return registroSalvo;
      }),
      runSync: jest.fn().mockImplementation((sql: string, params: any[]) => {
        registroSalvo = {
          id: params[0],
          aulas_ativas: params[1],
          antecedencia_aula_minutos: params[2],
          avaliacoes_ativas: params[3],
          antecedencia_avaliacoes_horas: params[4],
          tarefas_ativas: params[5],
          antecedencia_tarefas_horas: params[6],
          alerta_faltas_ativo: params[7],
          som_habilitado: params[8],
          vibracao_habilitada: params[9],
          data_atualizacao: params[10],
        };
        return { changes: 1, lastInsertRowId: 1 };
      }),
      execSync: jest.fn(),
      getAllSync: jest.fn(),
    };

    jest.spyOn(gerenciadorBancoDados, 'obterBanco').mockReturnValue(mockDb as any);

    // Na primeira chamada, o banco está vazio. Não pode dar Maximum call stack size exceeded!
    const config = await repositorio.obterConfiguracao();

    expect(config).toBeDefined();
    expect(config.aulasAtivas).toBe(CONFIGURACAO_NOTIFICACAO_PADRAO.aulasAtivas);
    expect(mockDb.runSync).toHaveBeenCalledTimes(1);

    // Na segunda chamada, deve ler o registro salvo
    const configExistente = await repositorio.obterConfiguracao();
    expect(configExistente.aulasAtivas).toBe(CONFIGURACAO_NOTIFICACAO_PADRAO.aulasAtivas);
    expect(mockDb.runSync).toHaveBeenCalledTimes(1); // Não gravou de novo
  });

  it('deve atualizar configurações no banco sem chamar obterConfiguracao recursivamente', async () => {
    let registroSalvo: any = null;

    const mockDb = {
      getFirstSync: jest.fn().mockImplementation(() => registroSalvo),
      runSync: jest.fn().mockImplementation((sql: string, params: any[]) => {
        registroSalvo = {
          id: params[0],
          aulas_ativas: params[1],
          antecedencia_aula_minutos: params[2],
          avaliacoes_ativas: params[3],
          antecedencia_avaliacoes_horas: params[4],
          tarefas_ativas: params[5],
          antecedencia_tarefas_horas: params[6],
          alerta_faltas_ativo: params[7],
          som_habilitado: params[8],
          vibracao_habilitada: params[9],
          data_atualizacao: params[10],
        };
        return { changes: 1, lastInsertRowId: 1 };
      }),
      execSync: jest.fn(),
      getAllSync: jest.fn(),
    };

    jest.spyOn(gerenciadorBancoDados, 'obterBanco').mockReturnValue(mockDb as any);

    const atualizada = await repositorio.salvarConfiguracao({
      antecedenciaAulaMinutos: 30,
    });

    expect(atualizada.antecedenciaAulaMinutos).toBe(30);
    expect(mockDb.runSync).toHaveBeenCalledTimes(1);
  });

  it('deve restaurar o padrão no banco', async () => {
    let registroSalvo: any = null;

    const mockDb = {
      getFirstSync: jest.fn().mockImplementation(() => registroSalvo),
      runSync: jest.fn().mockImplementation((sql: string, params: any[]) => {
        registroSalvo = {
          id: params[0],
          aulas_ativas: params[1],
          antecedencia_aula_minutos: params[2],
          avaliacoes_ativas: params[3],
          antecedencia_avaliacoes_horas: params[4],
          tarefas_ativas: params[5],
          antecedencia_tarefas_horas: params[6],
          alerta_faltas_ativo: params[7],
          som_habilitado: params[8],
          vibracao_habilitada: params[9],
          data_atualizacao: params[10],
        };
        return { changes: 1, lastInsertRowId: 1 };
      }),
      execSync: jest.fn(),
      getAllSync: jest.fn(),
    };

    jest.spyOn(gerenciadorBancoDados, 'obterBanco').mockReturnValue(mockDb as any);

    const padrao = await repositorio.restaurarPadrao();
    expect(padrao.antecedenciaAulaMinutos).toBe(CONFIGURACAO_NOTIFICACAO_PADRAO.antecedenciaAulaMinutos);
    expect(mockDb.runSync).toHaveBeenCalledTimes(1);
  });
});
