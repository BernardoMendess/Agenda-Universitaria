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
        avaliacoesHoras = JSON.parse(row.antecedencia_avaliacoes_horas);
      }
    } catch {
      avaliacoesHoras = [24, 2];
    }

    try {
      if (row.antecedencia_tarefas_horas) {
        tarefasHoras = JSON.parse(row.antecedencia_tarefas_horas);
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
      // Se ainda não existir no SQLite, grava o padrão
      await this.salvarConfiguracao(CONFIGURACAO_NOTIFICACAO_PADRAO);
      return { ...CONFIGURACAO_NOTIFICACAO_PADRAO };
    }
    return { ...this.configEmMemoria };
  }

  async salvarConfiguracao(
    dados: Partial<ConfiguracaoNotificacao>
  ): Promise<ConfiguracaoNotificacao> {
    const atual = await this.obterConfiguracao();
    const atualizada: ConfiguracaoNotificacao = {
      ...atual,
      ...dados,
      dataAtualizacao: dados.dataAtualizacao || new Date().toISOString(),
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT OR REPLACE INTO ${TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO} (
          id, aulas_ativas, antecedencia_aula_minutos, avaliacoes_ativas,
          antecedencia_avaliacoes_horas, tarefas_ativas, antecedencia_tarefas_horas,
          alerta_faltas_ativo, som_habilitado, vibracao_habilitada, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ID_CONFIG_PADRAO,
          atualizada.aulasAtivas ? 1 : 0,
          atualizada.antecedenciaAulaMinutos,
          atualizada.avaliacoesAtivas ? 1 : 0,
          JSON.stringify(atualizada.antecedenciaAvaliacoesHoras || [24, 2]),
          atualizada.tarefasAtivas ? 1 : 0,
          JSON.stringify(atualizada.antecedenciaTarefasHoras || [24, 2]),
          atualizada.alertaFaltasAtivo ? 1 : 0,
          atualizada.somHabilitado ? 1 : 0,
          atualizada.vibracaoHabilitada ? 1 : 0,
          atualizada.dataAtualizacao,
        ]
      );
    } else {
      this.configEmMemoria = { ...atualizada };
    }

    return { ...atualizada };
  }

  async restaurarPadrao(): Promise<ConfiguracaoNotificacao> {
    return this.salvarConfiguracao({
      ...CONFIGURACAO_NOTIFICACAO_PADRAO,
      dataAtualizacao: new Date().toISOString(),
    });
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.CONFIGURACOES_NOTIFICACAO}`);
    }
    this.configEmMemoria = { ...CONFIGURACAO_NOTIFICACAO_PADRAO };
  }
}
