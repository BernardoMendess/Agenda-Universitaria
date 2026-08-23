import {
  Avaliacao,
  CriarAvaliacaoDTO,
  AtualizarAvaliacaoDTO,
  TipoAvaliacao,
} from '../../../modelos/Avaliacao';
import { IAvaliacaoRepositorio } from '../AvaliacaoRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface AvaliacaoRow {
  id: string;
  disciplina_id: string;
  titulo: string;
  tipo: string;
  data: string;
  horario: string | null;
  peso: number;
  nota_maxima: number;
  nota: number | null;
  descricao: string | null;
  data_criacao: string;
  data_atualizacao: string;
}

export class AvaliacaoRepositorioSQLite implements IAvaliacaoRepositorio {
  private fallbackEmMemoria: Map<string, Avaliacao> = new Map();

  private rowParaAvaliacao(row: AvaliacaoRow): Avaliacao {
    return {
      id: row.id,
      disciplinaId: row.disciplina_id,
      titulo: row.titulo,
      tipo: row.tipo as TipoAvaliacao,
      data: row.data,
      horario: row.horario || undefined,
      peso: Number(row.peso),
      notaMaxima: Number(row.nota_maxima),
      nota: row.nota !== null && row.nota !== undefined ? Number(row.nota) : null,
      descricao: row.descricao || undefined,
      dataCriacao: row.data_criacao,
      dataAtualizacao: row.data_atualizacao,
    };
  }

  async criar(dados: CriarAvaliacaoDTO): Promise<Avaliacao> {
    const agora = new Date().toISOString();
    const id = `aval_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const peso = dados.peso !== undefined && Number(dados.peso) > 0 ? Number(dados.peso) : 1;
    const notaMaxima = dados.notaMaxima !== undefined && Number(dados.notaMaxima) > 0 ? Number(dados.notaMaxima) : 10;

    const novaAvaliacao: Avaliacao = {
      id,
      disciplinaId: dados.disciplinaId,
      titulo: dados.titulo.trim(),
      tipo: dados.tipo,
      data: dados.data,
      horario: dados.horario?.trim() || undefined,
      peso,
      notaMaxima,
      nota: null,
      descricao: dados.descricao?.trim() || undefined,
      dataCriacao: agora,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT INTO ${TABELAS_SQLITE.AVALIACOES} (
          id, disciplina_id, titulo, tipo, data, horario,
          peso, nota_maxima, nota, descricao, data_criacao, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          novaAvaliacao.id,
          novaAvaliacao.disciplinaId,
          novaAvaliacao.titulo,
          novaAvaliacao.tipo,
          novaAvaliacao.data,
          novaAvaliacao.horario ?? null,
          novaAvaliacao.peso,
          novaAvaliacao.notaMaxima,
          novaAvaliacao.nota ?? null,
          novaAvaliacao.descricao ?? null,
          novaAvaliacao.dataCriacao,
          novaAvaliacao.dataAtualizacao,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, novaAvaliacao);
    }

    return { ...novaAvaliacao };
  }

  async buscarPorId(id: string): Promise<Avaliacao | null> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<AvaliacaoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.AVALIACOES} WHERE id = ?`,
        [id]
      );
      return row ? this.rowParaAvaliacao(row) : null;
    }
    const avaliacao = this.fallbackEmMemoria.get(id);
    return avaliacao ? { ...avaliacao } : null;
  }

  async atualizar(id: string, dados: AtualizarAvaliacaoDTO): Promise<Avaliacao> {
    const existente = await this.buscarPorId(id);
    if (!existente) {
      throw new Error(`Avaliação com ID ${id} não encontrada.`);
    }

    const agora = new Date().toISOString();
    const atualizada: Avaliacao = {
      ...existente,
      titulo: dados.titulo !== undefined ? dados.titulo.trim() : existente.titulo,
      tipo: dados.tipo !== undefined ? dados.tipo : existente.tipo,
      data: dados.data !== undefined ? dados.data : existente.data,
      horario: dados.horario !== undefined ? (dados.horario.trim() || undefined) : existente.horario,
      peso: dados.peso !== undefined ? dados.peso : existente.peso,
      notaMaxima: dados.notaMaxima !== undefined ? dados.notaMaxima : existente.notaMaxima,
      descricao: dados.descricao !== undefined ? (dados.descricao.trim() || undefined) : existente.descricao,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `UPDATE ${TABELAS_SQLITE.AVALIACOES} SET
          titulo = ?, tipo = ?, data = ?, horario = ?,
          peso = ?, nota_maxima = ?, descricao = ?, data_atualizacao = ?
        WHERE id = ?`,
        [
          atualizada.titulo,
          atualizada.tipo,
          atualizada.data,
          atualizada.horario ?? null,
          atualizada.peso,
          atualizada.notaMaxima,
          atualizada.descricao ?? null,
          atualizada.dataAtualizacao,
          id,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, atualizada);
    }

    return { ...atualizada };
  }

  async lancarNota(id: string, nota: number | null): Promise<Avaliacao> {
    const existente = await this.buscarPorId(id);
    if (!existente) {
      throw new Error(`Avaliação com ID ${id} não encontrada.`);
    }

    const agora = new Date().toISOString();
    const atualizada: Avaliacao = {
      ...existente,
      nota,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `UPDATE ${TABELAS_SQLITE.AVALIACOES} SET nota = ?, data_atualizacao = ? WHERE id = ?`,
        [nota, agora, id]
      );
    } else {
      this.fallbackEmMemoria.set(id, atualizada);
    }

    return { ...atualizada };
  }

  async excluir(id: string): Promise<boolean> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(`DELETE FROM ${TABELAS_SQLITE.AVALIACOES} WHERE id = ?`, [id]);
      return res.changes > 0;
    }
    return this.fallbackEmMemoria.delete(id);
  }

  async listarPorDisciplina(disciplinaId: string): Promise<Avaliacao[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<AvaliacaoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.AVALIACOES} 
         WHERE disciplina_id = ? 
         ORDER BY data ASC, horario ASC`,
        [disciplinaId]
      );
      return rows.map((r) => this.rowParaAvaliacao(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .filter((a) => a.disciplinaId === disciplinaId)
      .map((a) => ({ ...a }))
      .sort((a, b) => {
        const dataComparacao = a.data.localeCompare(b.data);
        if (dataComparacao !== 0) return dataComparacao;
        return (a.horario || '').localeCompare(b.horario || '');
      });
  }

  async listarTodas(): Promise<Avaliacao[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<AvaliacaoRow>(
        `SELECT * FROM ${TABELAS_SQLITE.AVALIACOES} ORDER BY data ASC, horario ASC`
      );
      return rows.map((r) => this.rowParaAvaliacao(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .map((a) => ({ ...a }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const res = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.AVALIACOES} WHERE disciplina_id = ?`,
        [disciplinaId]
      );
      return res.changes;
    }
    let removidos = 0;
    for (const [id, avaliacao] of this.fallbackEmMemoria.entries()) {
      if (avaliacao.disciplinaId === disciplinaId) {
        this.fallbackEmMemoria.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  async restaurarEmLote(avaliacoes: Avaliacao[]): Promise<Avaliacao[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      for (const a of avaliacoes) {
        db.runSync(
          `INSERT OR REPLACE INTO ${TABELAS_SQLITE.AVALIACOES} (
            id, disciplina_id, titulo, tipo, data, horario,
            peso, nota_maxima, nota, descricao, data_criacao, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            a.id,
            a.disciplinaId,
            a.titulo,
            a.tipo,
            a.data,
            a.horario ?? null,
            a.peso,
            a.notaMaxima,
            a.nota ?? null,
            a.descricao ?? null,
            a.dataCriacao,
            a.dataAtualizacao,
          ]
        );
      }
      return this.listarTodas();
    }
    for (const a of avaliacoes) {
      this.fallbackEmMemoria.set(a.id, { ...a });
    }
    return Array.from(this.fallbackEmMemoria.values()).map((a) => ({ ...a }));
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.AVALIACOES}`);
    }
    this.fallbackEmMemoria.clear();
  }
}
