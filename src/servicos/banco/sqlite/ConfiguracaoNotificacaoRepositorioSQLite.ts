import {
  ConfiguracaoNotificacao,
  CONFIGURACAO_NOTIFICACAO_PADRAO,
} from '../../../modelos/Notificacao';
import { IConfiguracaoNotificacaoRepositorio } from '../ConfiguracaoNotificacaoRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface ConfigRow {
  id: string;
  aulas_ativas: number;
  antecedencia_aula_minutos: number;
  avaliacoes_ativas: number;
  antecedencia_avaliacoes_horas: string;
  tarefas_ativas: number;
  antecedencia_tarefas_horas: string;
  alerta_faltas_ativo: number;
  som_habilitado: number;
  vibracao_habilitada: number;
  data_atualizacao: string;
}

const ID_CONFIG_PADRAO = 'config_sistema_principal';

export class ConfiguracaoNotificacaoRepositorioSQLite
  implements IConfiguracaoNotificacaoRepositorio
{
  private configEmMemoria: ConfiguracaoNotificacao = {
    ...CONFIGURACAO_NOTIFICACAO_PADRAO,
  };

  private rowParaConfig(row: ConfigRow): ConfiguracaoNotificacao {
    let avaliacoesHoras: number[] = [24, 2];
    let tarefasHoras: number[] = [24, 2];

    try {
      if (row.antecedencia_avaliacoes_horas) {
        const parsed = JSON.parse(row.antecedencia_avaliacoes_horas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          avaliacoesHoras = parsed.map(Number);
        }
      }
    } catch {
      avaliacoesHoras = [24, 2];
    }

    try {
      if (row.antecedencia_tarefas_horas) {
        const parsed = JSON.parse(row.antecedencia_tarefas_horas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          tarefasHoras = parsed.map(Number);
        }
      }
    } catch {
      tarefasHoras = [24, 2];
    }

    return {
      aulasAtivas: row.aulas_ativas === 1,
      antecedenciaAulaMinutos: Number(row.antecedencia_aula_minutos),
      avaliacoesAtivas: row.avaliacoes_ativas === 1,
      antecedenciaAvaliacoesHoras: avaliacoesHoras,
      tarefasAtivas: row.tarefas_ativas === 1,
      antecedenciaTarefasHoras: tarefasHoras,
      alertaFaltasAtivo: row.alerta_faltas_ativo === 1,
      somHabilitado: row.som_habilitado === 1,
      vibracaoHabilitada: row.vibracao_habilitada === 1,
      dataAtualizacao: row.data_atualizacao,
    };
  }

  private persistirNoBanco(db: any, config: ConfiguracaoNotificacao): void {
    db.runSync(
      `INSERT OR REPLACE INTO ${TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO} (
        id, aulas_ativas, antecedencia_aula_minutos, avaliacoes_ativas,
        antecedencia_avaliacoes_horas, tarefas_ativas, antecedencia_tarefas_horas,
        alerta_faltas_ativo, som_habilitado, vibracao_habilitada, data_atualizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ID_CONFIG_PADRAO,
        config.aulasAtivas ? 1 : 0,
        config.antecedenciaAulaMinutos,
        config.avaliacoesAtivas ? 1 : 0,
        JSON.stringify(config.antecedenciaAvaliacoesHoras || [24, 2]),
        config.tarefasAtivas ? 1 : 0,
        JSON.stringify(config.antecedenciaTarefasHoras || [24, 2]),
        config.alertaFaltasAtivo ? 1 : 0,
        config.somHabilitado ? 1 : 0,
        config.vibracaoHabilitada ? 1 : 0,
        config.dataAtualizacao,
      ]
    );
  }

  async obterConfiguracao(): Promise<ConfiguracaoNotificacao> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<ConfigRow>(
        `SELECT * FROM ${TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO} WHERE id = ?`,
        [ID_CONFIG_PADRAO]
      );
      if (row) {
        return this.rowParaConfig(row);
      }
      // Se ainda não existir no SQLite, grava o padrão direto sem chamar salvarConfiguracao recursivamente
      const configPadrao: ConfiguracaoNotificacao = {
        ...CONFIGURACAO_NOTIFICACAO_PADRAO,
        dataAtualizacao: new Date().toISOString(),
      };
      this.persistirNoBanco(db, configPadrao);
      return configPadrao;
    }
    return { ...this.configEmMemoria };
  }

  async salvarConfiguracao(
    dados: Partial<ConfiguracaoNotificacao>
  ): Promise<ConfiguracaoNotificacao> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<ConfigRow>(
        `SELECT * FROM ${TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO} WHERE id = ?`,
        [ID_CONFIG_PADRAO]
      );
      const atual = row ? this.rowParaConfig(row) : { ...CONFIGURACAO_NOTIFICACAO_PADRAO };
      const atualizada: ConfiguracaoNotificacao = {
        ...atual,
        ...dados,
        dataAtualizacao: dados.dataAtualizacao || new Date().toISOString(),
      };

      this.persistirNoBanco(db, atualizada);
      return { ...atualizada };
    }

    this.configEmMemoria = {
      ...this.configEmMemoria,
      ...dados,
      dataAtualizacao: dados.dataAtualizacao || new Date().toISOString(),
    };
    return { ...this.configEmMemoria };
  }

  async restaurarPadrao(): Promise<ConfiguracaoNotificacao> {
    const padrao: ConfiguracaoNotificacao = {
      ...CONFIGURACAO_NOTIFICACAO_PADRAO,
      dataAtualizacao: new Date().toISOString(),
    };
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      this.persistirNoBanco(db, padrao);
    } else {
      this.configEmMemoria = { ...padrao };
    }
    return { ...padrao };
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO}`);
    }
    this.configEmMemoria = { ...CONFIGURACAO_NOTIFICACAO_PADRAO };
  }
}
