import {
  NotificacaoAgendada,
  CriarNotificacaoAgendadaDTO,
  TipoNotificacao,
  PrioridadeNotificacao,
} from '../../../modelos/Notificacao';
import { DiaSemana } from '../../../modelos/HorarioAula';
import { INotificacaoAgendadaRepositorio } from '../NotificacaoAgendadaRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface NotificacaoRow {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  referencia_id: string;
  disciplina_id: string | null;
  disciplina_nome: string | null;
  disciplina_cor: string | null;
  data_hora_disparo: string | null;
  dia_semana: string | null;
  horario_inicio: string | null;
  antecedencia_minutos: number | null;
  antecedencia_horas: number | null;
  prioridade: string;
  ativa: number;
  data_criacao: string;
  id_nativo_expo: string | null;
  agendado_no_so: number;
}

export class NotificacaoAgendadaRepositorioSQLite
  implements INotificacaoAgendadaRepositorio
{
  private fallbackEmMemoria: Map<string, NotificacaoAgendada> = new Map();

  private rowParaNotificacao(row: NotificacaoRow): NotificacaoAgendada {
    return {
      id: row.id,
      tipo: row.tipo as TipoNotificacao,
      titulo: row.titulo,
      mensagem: row.mensagem,
      referenciaId: row.referencia_id,
      disciplinaId: row.disciplina_id || undefined,
      disciplinaNome: row.disciplina_nome || undefined,
      disciplinaCor: row.disciplina_cor || undefined,
      dataHoraDisparo: row.data_hora_disparo || undefined,
      diaSemana: (row.dia_semana as DiaSemana) || undefined,
      horarioInicio: row.horario_inicio || undefined,
      antecedenciaMinutos: row.antecedencia_minutos !== null ? Number(row.antecedencia_minutos) : undefined,
      antecedenciaHoras: row.antecedencia_horas !== null ? Number(row.antecedencia_horas) : undefined,
      prioridade: (row.prioridade as PrioridadeNotificacao) || 'MEDIA',
      ativa: row.ativa === 1,
      dataCriacao: row.data_criacao,
      idNativoExpo: row.id_nativo_expo || undefined,
      agendadoNoSO: row.agendado_no_so === 1,
    };
  }

  async salvar(dados: CriarNotificacaoAgendadaDTO): Promise<NotificacaoAgendada> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const nova: NotificacaoAgendada = {
      id,
      tipo: dados.tipo,
      titulo: dados.titulo.trim(),
      mensagem: dados.mensagem.trim(),
      referenciaId: dados.referenciaId,
      disciplinaId: dados.disciplinaId,
      disciplinaNome: dados.disciplinaNome,
      disciplinaCor: dados.disciplinaCor,
      dataHoraDisparo: dados.dataHoraDisparo,
      diaSemana: dados.diaSemana,
      horarioInicio: dados.horarioInicio,
      antecedenciaMinutos: dados.antecedenciaMinutos,
      antecedenciaHoras: dados.antecedenciaHoras,
      prioridade: dados.prioridade || 'MEDIA',
      ativa: true,
      dataCriacao: new Date().toISOString(),
      agendadoNoSO: false,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT INTO ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} (
          id, tipo, titulo, mensagem, referencia_id, disciplina_id,
          disciplina_nome, disciplina_cor, data_hora_disparo, dia_semana,
          horario_inicio, antecedencia_minutos, antecedencia_horas,
          prioridade, ativa, data_criacao, id_nativo_expo, agendado_no_so
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nova.id,
          nova.tipo,
          nova.titulo,
          nova.mensagem,
          nova.referenciaId,
          nova.disciplinaId ?? null,
          nova.disciplinaNome ?? null,
          nova.disciplinaCor ?? null,
          nova.dataHoraDisparo ?? null,
          nova.diaSemana ?? null,
          nova.horarioInicio ?? null,
          nova.antecedenciaMinutos ?? null,
          nova.antecedenciaHoras ?? null,
          nova.prioridade,
          nova.ativa ? 1 : 0,
          nova.dataCriacao,
          null,
          0,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, nova);
    }

    return { ...nova };
  }

  async salvarEmLote(
    itens: CriarNotificacaoAgendadaDTO[]
  ): Promise<NotificacaoAgendada[]> {
    const criadas: NotificacaoAgendada[] = [];
    for (const item of itens) {
      const nova = await this.salvar(item);
      criadas.push(nova);
    }
    return criadas;
  }

  async buscarPorId(id: string): Promise<NotificacaoAgendada | null> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<NotificacaoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} WHERE id = ?`,
        [id]
      );
      return row ? this.rowParaNotificacao(row) : null;
    }
    const item = this.fallbackEmMemoria.get(id);
    return item ? { ...item } : null;
  }

  async listarTodas(): Promise<NotificacaoAgendada[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<NotificacaoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS}`
      );
      return rows.map((r) => this.rowParaNotificacao(r));
    }
    return Array.from(this.fallbackEmMemoria.values()).map((n) => ({ ...n }));
  }

  async listarPorTipo(tipo: TipoNotificacao): Promise<NotificacaoAgendada[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<NotificacaoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} WHERE tipo = ?`,
        [tipo]
      );
      return rows.map((r) => this.rowParaNotificacao(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .filter((n) => n.tipo === tipo)
      .map((n) => ({ ...n }));
  }

  async listarPorReferenciaId(
    referenciaId: string
  ): Promise<NotificacaoAgendada[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<NotificacaoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} WHERE referencia_id = ?`,
        [referenciaId]
      );
      return rows.map((r) => this.rowParaNotificacao(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .filter((n) => n.referenciaId === referenciaId)
      .map((n) => ({ ...n }));
  }

  async removerPorId(id: string): Promise<boolean> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} WHERE id = ?`,
        [id]
      );
      return res.changes > 0;
    }
    return this.fallbackEmMemoria.delete(id);
  }

  async removerPorReferenciaId(referenciaId: string): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} WHERE referencia_id = ?`,
        [referenciaId]
      );
      return res.changes;
    }
    let removidos = 0;
    for (const [id, notif] of this.fallbackEmMemoria.entries()) {
      if (notif.referenciaId === referenciaId) {
        this.fallbackEmMemoria.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async removerPorTipo(tipo: TipoNotificacao): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS} WHERE tipo = ?`,
        [tipo]
      );
      return res.changes;
    }
    let removidos = 0;
    for (const [id, notif] of this.fallbackEmMemoria.entries()) {
      if (notif.tipo === tipo) {
        this.fallbackEmMemoria.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS}`);
    }
    this.fallbackEmMemoria.clear();
  }

  /**
   * Atualiza o ID nativo do Expo e flag de agendamento no SO após confirmação do agendamento nativo.
   */
  async atualizarIdNativo(
    id: string,
    idNativoExpo: string,
    agendadoNoSO: boolean
  ): Promise<void> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `UPDATE ${TABELAS_SQLITE.NOTIFICACOES_AGENDADAS}
         SET id_nativo_expo = ?, agendado_no_so = ?
         WHERE id = ?`,
        [idNativoExpo, agendadoNoSO ? 1 : 0, id]
      );
    } else {
      const item = this.fallbackEmMemoria.get(id);
      if (item) {
        item.idNativoExpo = idNativoExpo;
        item.agendadoNoSO = agendadoNoSO;
      }
    }
  }
}
