import { Falta, CriarFaltaDTO } from '../../../modelos/Falta';
import { IFaltaRepositorio } from '../FaltaRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface FaltaRow {
  id: string;
  disciplina_id: string;
  data: string;
  horario: string;
  justificativa: string | null;
  data_criacao: string;
}

export class FaltaRepositorioSQLite implements IFaltaRepositorio {
  private fallbackEmMemoria: Map<string, Falta> = new Map();

  private rowParaFalta(row: FaltaRow): Falta {
    return {
      id: row.id,
      disciplinaId: row.disciplina_id,
      data: row.data,
      horario: row.horario,
      justificativa: row.justificativa || undefined,
      dataCriacao: row.data_criacao,
    };
  }

  async adicionar(dados: CriarFaltaDTO): Promise<Falta> {
    const agora = new Date();
    const id = `falta_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const dataFormatada =
      dados.data && dados.data.trim() !== ''
        ? dados.data.trim()
        : agora.toISOString().split('T')[0];

    const horarioFormatado =
      dados.horario && dados.horario.trim() !== ''
        ? dados.horario.trim()
        : `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    const novaFalta: Falta = {
      id,
      disciplinaId: dados.disciplinaId,
      data: dataFormatada,
      horario: horarioFormatado,
      justificativa: dados.justificativa?.trim() || undefined,
      dataCriacao: agora.toISOString(),
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT INTO ${TABELAS_SQLITE.FALTAS} (
          id, disciplina_id, data, horario, justificativa, data_criacao
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          novaFalta.id,
          novaFalta.disciplinaId,
          novaFalta.data,
          novaFalta.horario,
          novaFalta.justificativa ?? null,
          novaFalta.dataCriacao,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, novaFalta);
    }

    return { ...novaFalta };
  }

  async removerUltima(disciplinaId: string): Promise<Falta | null> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<FaltaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.FALTAS} 
         WHERE disciplina_id = ? 
         ORDER BY data DESC, horario DESC, data_criacao DESC 
         LIMIT 1`,
        [disciplinaId]
      );
      if (row) {
        db.runSync(`DELETE FROM ${TABELAS_SQLITE.FALTAS} WHERE id = ?`, [row.id]);
        return this.rowParaFalta(row);
      }
      return null;
    }

    const faltasDaDisciplina = await this.listarPorDisciplina(disciplinaId);
    if (faltasDaDisciplina.length === 0) {
      return null;
    }
    const ultimaFalta = faltasDaDisciplina[0];
    this.fallbackEmMemoria.delete(ultimaFalta.id);
    return ultimaFalta;
  }

  async removerPorId(id: string): Promise<boolean> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(`DELETE FROM ${TABELAS_SQLITE.FALTAS} WHERE id = ?`, [id]);
      return res.changes > 0;
    }
    return this.fallbackEmMemoria.delete(id);
  }

  async listarPorDisciplina(disciplinaId: string): Promise<Falta[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<FaltaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.FALTAS} 
         WHERE disciplina_id = ? 
         ORDER BY data DESC, horario DESC, data_criacao DESC`,
        [disciplinaId]
      );
      return rows.map((r) => this.rowParaFalta(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .filter((f) => f.disciplinaId === disciplinaId)
      .map((f) => ({ ...f }))
      .sort((a, b) => {
        const dataComparacao = b.data.localeCompare(a.data);
        if (dataComparacao !== 0) return dataComparacao;
        return b.horario.localeCompare(a.horario);
      });
  }

  async contarPorDisciplina(disciplinaId: string): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<{ total: number }>(
        `SELECT COUNT(*) as total FROM ${TABELAS_SQLITE.FALTAS} WHERE disciplina_id = ?`,
        [disciplinaId]
      );
      return row ? row.total : 0;
    }
    let contagem = 0;
    for (const falta of this.fallbackEmMemoria.values()) {
      if (falta.disciplinaId === disciplinaId) {
        contagem++;
      }
    }
    return contagem;
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.FALTAS} WHERE disciplina_id = ?`,
        [disciplinaId]
      );
      return res.changes;
    }
    let removidos = 0;
    for (const [id, falta] of this.fallbackEmMemoria.entries()) {
      if (falta.disciplinaId === disciplinaId) {
        this.fallbackEmMemoria.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async listarTodas(): Promise<Falta[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<FaltaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.FALTAS} 
         ORDER BY data DESC, horario DESC, data_criacao DESC`
      );
      return rows.map((r) => this.rowParaFalta(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .map((f) => ({ ...f }))
      .sort((a, b) => {
        const dataComparacao = b.data.localeCompare(a.data);
        if (dataComparacao !== 0) return dataComparacao;
        return b.horario.localeCompare(a.horario);
      });
  }

  async restaurarEmLote(faltas: Falta[]): Promise<Falta[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      for (const f of faltas) {
        db.runSync(
          `INSERT OR REPLACE INTO ${TABELAS_SQLITE.FALTAS} (
            id, disciplina_id, data, horario, justificativa, data_criacao
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            f.id,
            f.disciplinaId,
            f.data,
            f.horario,
            f.justificativa ?? null,
            f.dataCriacao,
          ]
        );
      }
      return this.listarTodas();
    }
    for (const f of faltas) {
      this.fallbackEmMemoria.set(f.id, { ...f });
    }
    return Array.from(this.fallbackEmMemoria.values()).map((f) => ({ ...f }));
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.FALTAS}`);
    }
    this.fallbackEmMemoria.clear();
  }
}
