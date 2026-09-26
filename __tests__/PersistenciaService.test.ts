import {
  PersistenciaService,
  persistenciaService,
} from '../src/servicos/PersistenciaService';
import {
  TABELAS_SQLITE,
  SCRIPTS_DDL_TABELAS,
  SCRIPTS_INDICES_SQLITE,
  NOME_BANCO_SQLITE,
  VERSAO_SCHEMA_SQLITE,
} from '../src/servicos/banco/sqlite/EsquemaBanco';
import {
  GerenciadorBancoDados,
  gerenciadorBancoDados,
} from '../src/servicos/banco/sqlite/GerenciadorBancoDados';
import { disciplinaRepositorio } from '../src/servicos/banco/DisciplinaRepositorio';

describe('Persistência Estritamente Local (RNF02 — SQLite Local)', () => {
  beforeEach(() => {
    disciplinaRepositorio.limpar();
  });

  describe('EsquemaBanco DDL', () => {
    it('deve definir todas as 8 tabelas principais do sistema', () => {
      const tabelasEsperadas = [
        'disciplinas',
        'horarios_aula',
        'faltas',
        'avaliacoes',
        'tarefas',
        'eventos_academicos',
        'configuracoes_notificacao',
        'notificacoes_agendadas',
      ];

      expect(Object.values(TABELAS_SQLITE)).toEqual(
        expect.arrayContaining(tabelasEsperadas)
      );
      expect(Object.keys(SCRIPTS_DDL_TABELAS).length).toBe(8);
    });

    it('deve conter comandos CREATE TABLE IF NOT EXISTS válidos para todas as tabelas', () => {
      for (const [tabela, script] of Object.entries(SCRIPTS_DDL_TABELAS)) {
        expect(script).toContain(`CREATE TABLE IF NOT EXISTS ${tabela}`);
        expect(script).toContain('id TEXT PRIMARY KEY');
      }
    });

    it('deve configurar integridade referencial com chaves estrangeiras', () => {
      expect(SCRIPTS_DDL_TABELAS[TABELAS_SQLITE.HORARIOS_AULA]).toContain(
        `FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE CASCADE`
      );
      expect(SCRIPTS_DDL_TABELAS[TABELAS_SQLITE.FALTAS]).toContain(
        `FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE CASCADE`
      );
      expect(SCRIPTS_DDL_TABELAS[TABELAS_SQLITE.AVALIACOES]).toContain(
        `FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE CASCADE`
      );
      expect(SCRIPTS_DDL_TABELAS[TABELAS_SQLITE.TAREFAS]).toContain(
        `FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE SET NULL`
      );
    });

    it('deve conter scripts de índices para otimização de consultas locais', () => {
      expect(SCRIPTS_INDICES_SQLITE.length).toBeGreaterThanOrEqual(8);
      for (const script of SCRIPTS_INDICES_SQLITE) {
        expect(script).toContain('CREATE INDEX IF NOT EXISTS');
      }
    });

    it('deve definir metadados do arquivo de banco de dados SQLite', () => {
      expect(NOME_BANCO_SQLITE).toBe('campusflow.db');
      expect(VERSAO_SCHEMA_SQLITE).toBe(2);
    });
  });

  describe('GerenciadorBancoDados', () => {
    it('deve inicializar com sucesso', async () => {
      const gerenciador = GerenciadorBancoDados.obterInstancia();
      const resultado = await gerenciador.inicializar();
      expect(resultado).toBe(true);
    });

    it('deve gerar relatório completo de status do SQLite', () => {
      const relatorio = gerenciadorBancoDados.obterRelatorioStatus();

      expect(relatorio.nomeBanco).toBe('campusflow.db');
      expect(relatorio.versaoSchema).toBe(2);
      expect(relatorio.totalTabelas).toBe(8);
      expect(relatorio.chavesEstrangeirasAtivas).toBe(true);
      expect(relatorio.modoJournal).toBe('WAL');
      expect(relatorio.integridade).toBe('OK');
    });
  });

  describe('PersistenciaService', () => {
    let servico: PersistenciaService;

    beforeEach(() => {
      servico = new PersistenciaService();
    });

    it('deve contabilizar os registros locais por tabela', async () => {
      await disciplinaRepositorio.criar({
        nome: 'Cálculo I',
        corIdentificacao: '#6366f1',
        criterioAprovacao: 'ARITMETICA',
      });

      const registros = await servico.contarRegistrosLocais();
      expect(registros.disciplinas).toBe(1);
      expect(registros.totalRegistros).toBeGreaterThanOrEqual(1);
    });

    it('deve retornar status de persistência confirmando armazenamento estritamente local', async () => {
      const status = await servico.obterStatusPersistencia();

      expect(status.motor).toBe('SQLite (Local)');
      expect(status.armazenamentoEstritamenteLocal).toBe(true);
      expect(status.isolamentoGarantido).toBe(true);
      expect(status.statusBanco.totalTabelas).toBe(8);
    });

    it('deve verificar a integridade local como verdadeira', async () => {
      const integro = await servico.verificarIntegridadeLocal();
      expect(integro).toBe(true);
    });

    it('deve fornecer singleton pronto para uso', () => {
      expect(persistenciaService).toBeInstanceOf(PersistenciaService);
    });
  });
});
