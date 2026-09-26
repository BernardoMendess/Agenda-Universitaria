/**
 * Nomes das tabelas do banco de dados SQLite local (RNF02).
 */
export const TABELAS_SQLITE = {
  DISCIPLINAS: 'disciplinas',
  HORARIOS_AULA: 'horarios_aula',
  FALTAS: 'faltas',
  AVALIACOES: 'avaliacoes',
  TAREFAS: 'tarefas',
  EVENTOS_ACADEMICOS: 'eventos_academicos',
  CONFIGURACOES_NOTIFICACAO: 'configuracoes_notificacao',
  NOTIFICACOES_AGENDADAS: 'notificacoes_agendadas',
} as const;

export type NomeTabelaSQLite = typeof TABELAS_SQLITE[keyof typeof TABELAS_SQLITE];

/**
 * Definições DDL para criação das tabelas do SQLite local.
 * Segue estrita integridade referencial com chaves estrangeiras e índices otimizados.
 */
export const SCRIPTS_DDL_TABELAS: Record<NomeTabelaSQLite, string> = {
  [TABELAS_SQLITE.DISCIPLINAS]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.DISCIPLINAS} (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      codigo TEXT,
      nome_professor TEXT,
      contato_professor TEXT,
      local_sala TEXT,
      anotacoes TEXT,
      cor_identificacao TEXT NOT NULL,
      limite_maximo_faltas INTEGER,
      criterio_aprovacao TEXT NOT NULL,
      nota_minima_aprovacao REAL NOT NULL DEFAULT 6.0,
      data_criacao TEXT NOT NULL,
      data_atualizacao TEXT NOT NULL
    );
  `,

  [TABELAS_SQLITE.HORARIOS_AULA]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.HORARIOS_AULA} (
      id TEXT PRIMARY KEY NOT NULL,
      disciplina_id TEXT NOT NULL,
      dia_semana TEXT NOT NULL,
      horario_inicio TEXT NOT NULL,
      horario_fim TEXT NOT NULL,
      local_sala TEXT,
      FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE CASCADE
    );
  `,

  [TABELAS_SQLITE.FALTAS]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.FALTAS} (
      id TEXT PRIMARY KEY NOT NULL,
      disciplina_id TEXT NOT NULL,
      data TEXT NOT NULL,
      horario TEXT NOT NULL,
      justificativa TEXT,
      data_criacao TEXT NOT NULL,
      FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE CASCADE
    );
  `,

  [TABELAS_SQLITE.AVALIACOES]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.AVALIACOES} (
      id TEXT PRIMARY KEY NOT NULL,
      disciplina_id TEXT NOT NULL,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL,
      data TEXT NOT NULL,
      horario TEXT,
      peso REAL NOT NULL DEFAULT 1.0,
      nota_maxima REAL NOT NULL DEFAULT 10.0,
      nota REAL,
      descricao TEXT,
      data_criacao TEXT NOT NULL,
      data_atualizacao TEXT NOT NULL,
      FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE CASCADE
    );
  `,

  [TABELAS_SQLITE.TAREFAS]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.TAREFAS} (
      id TEXT PRIMARY KEY NOT NULL,
      disciplina_id TEXT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      concluida INTEGER NOT NULL DEFAULT 0,
      data_limite TEXT,
      horario_limite TEXT,
      prioridade TEXT NOT NULL DEFAULT 'MEDIA',
      data_conclusao TEXT,
      data_criacao TEXT NOT NULL,
      data_atualizacao TEXT NOT NULL,
      FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE SET NULL
    );
  `,

  [TABELAS_SQLITE.EVENTOS_ACADEMICOS]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.EVENTOS_ACADEMICOS} (
      id TEXT PRIMARY KEY NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data TEXT NOT NULL,
      horario_inicio TEXT,
      horario_fim TEXT,
      disciplina_id TEXT,
      local TEXT,
      cor TEXT,
      data_criacao TEXT NOT NULL,
      data_atualizacao TEXT NOT NULL,
      FOREIGN KEY (disciplina_id) REFERENCES ${TABELAS_SQLITE.DISCIPLINAS}(id) ON DELETE SET NULL
    );
  `,

  [TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO} (
      id TEXT PRIMARY KEY NOT NULL,
      aulas_ativas INTEGER NOT NULL DEFAULT 1,
      antecedencia_aula_minutos INTEGER NOT NULL DEFAULT 15,
      avaliacoes_ativas INTEGER NOT NULL DEFAULT 1,
      antecedencia_avaliacoes_horas TEXT NOT NULL,
      tarefas_ativas INTEGER NOT NULL DEFAULT 1,
      antecedencia_tarefas_horas TEXT NOT NULL,
      alerta_faltas_ativo INTEGER NOT NULL DEFAULT 1,
      som_habilitado INTEGER NOT NULL DEFAULT 1,
      vibracao_habilitada INTEGER NOT NULL DEFAULT 1,
      data_atualizacao TEXT NOT NULL
    );
  `,

  [TABELAS_SQLITE.NOTIFICACOES_AGENDADAS]: `
    CREATE TABLE IF NOT EXISTS ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} (
      id TEXT PRIMARY KEY NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      referencia_id TEXT NOT NULL,
      disciplina_id TEXT,
      disciplina_nome TEXT,
      disciplina_cor TEXT,
      data_hora_disparo TEXT,
      dia_semana TEXT,
      horario_inicio TEXT,
      antecedencia_minutos INTEGER,
      antecedencia_horas INTEGER,
      prioridade TEXT NOT NULL DEFAULT 'MEDIA',
      ativa INTEGER NOT NULL DEFAULT 1,
      data_criacao TEXT NOT NULL,
      id_nativo_expo TEXT,
      agendado_no_so INTEGER NOT NULL DEFAULT 0
    );
  `,
};

/**
 * Scripts de criação de índices para aceleração de buscas relacionais locais.
 */
export const SCRIPTS_INDICES_SQLITE: string[] = [
  `CREATE INDEX IF NOT EXISTS idx_horarios_disciplina ON ${TABELAS_SQLITE.HORARIOS_AULA}(disciplina_id);`,
  `CREATE INDEX IF NOT EXISTS idx_horarios_dia ON ${TABELAS_SQLITE.HORARIOS_AULA}(dia_semana);`,
  `CREATE INDEX IF NOT EXISTS idx_faltas_disciplina ON ${TABELAS_SQLITE.FALTAS}(disciplina_id);`,
  `CREATE INDEX IF NOT EXISTS idx_faltas_data ON ${TABELAS_SQLITE.FALTAS}(data);`,
  `CREATE INDEX IF NOT EXISTS idx_avaliacoes_disciplina ON ${TABELAS_SQLITE.AVALIACOES}(disciplina_id);`,
  `CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON ${TABELAS_SQLITE.AVALIACOES}(data);`,
  `CREATE INDEX IF NOT EXISTS idx_tarefas_disciplina ON ${TABELAS_SQLITE.TAREFAS}(disciplina_id);`,
  `CREATE INDEX IF NOT EXISTS idx_tarefas_data_limite ON ${TABELAS_SQLITE.TAREFAS}(data_limite);`,
  `CREATE INDEX IF NOT EXISTS idx_eventos_data ON ${TABELAS_SQLITE.EVENTOS_ACADEMICOS}(data);`,
  `CREATE INDEX IF NOT EXISTS idx_eventos_disciplina ON ${TABELAS_SQLITE.EVENTOS_ACADEMICOS}(disciplina_id);`,
  `CREATE INDEX IF NOT EXISTS idx_notificacoes_ref ON ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS}(referencia_id);`,
  `CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS}(tipo);`,
];

/**
 * Nome do arquivo de banco de dados SQLite local no aparelho.
 */
export const NOME_BANCO_SQLITE = 'campusflow.db';
export const VERSAO_SCHEMA_SQLITE = 2;

/**
 * Scripts de migração para atualizações de schema entre versões.
 * Cada entrada é um par [versãoAlvo, script SQL].
 */
export const SCRIPTS_MIGRACAO: Array<{ versao: number; sql: string }> = [
  {
    versao: 2,
    sql: `ALTER TABLE ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} ADD COLUMN id_nativo_expo TEXT;`,
  },
  {
    versao: 2,
    sql: `ALTER TABLE ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} ADD COLUMN agendado_no_so INTEGER NOT NULL DEFAULT 0;`,
  },
];

