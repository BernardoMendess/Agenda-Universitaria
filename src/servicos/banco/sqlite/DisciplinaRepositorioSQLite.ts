import { Disciplina, CriarDisciplinaDTO, AtualizarDisciplinaDTO } from '../../../modelos/Disciplina';
import { IDisciplinaRepositorio } from '../DisciplinaRepositorio';
import { gerenciadorBancoDados } from './GerenciadorBancoDados';
import { TABELAS_SQLITE } from './EsquemaBanco';

interface DisciplinaRow {
  id: string;
  nome: string;
  codigo: string | null;
  nome_professor: string | null;
  contato_professor: string | null;
  local_sala: string | null;
  anotacoes: string | null;
  cor_identificacao: string;
  limite_maximo_faltas: number | null;
  criterio_aprovacao: string;
  nota_minima_aprovacao: number;
  data_criacao: string;
  data_atualizacao: string;
}

export class DisciplinaRepositorioSQLite implements IDisciplinaRepositorio {
  private fallbackEmMemoria: Map<string, Disciplina> = new Map();

  private rowParaDisciplina(row: DisciplinaRow): Disciplina {
    return {
      id: row.id,
      nome: row.nome,
      codigo: row.codigo || undefined,
      nomeProfessor: row.nome_professor || undefined,
      contatoProfessor: row.contato_professor || undefined,
      localSala: row.local_sala || undefined,
      anotacoes: row.anotacoes || undefined,
      corIdentificacao: row.cor_identificacao,
      limiteMaximoFaltas: row.limite_maximo_faltas !== null && row.limite_maximo_faltas !== undefined
        ? Number(row.limite_maximo_faltas)
        : null,
      criterioAprovacao: row.criterio_aprovacao as Disciplina['criterioAprovacao'],
      notaMinimaAprovacao: Number(row.nota_minima_aprovacao),
      dataCriacao: row.data_criacao,
      dataAtualizacao: row.data_atualizacao,
    };
  }

  async criar(dados: CriarDisciplinaDTO): Promise<Disciplina> {
    const agora = new Date().toISOString();
    const id = `disc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const limiteNormalizado =
      dados.limiteMaximoFaltas !== undefined &&
      dados.limiteMaximoFaltas !== null &&
      Number(dados.limiteMaximoFaltas) >= 0
        ? Math.floor(Number(dados.limiteMaximoFaltas))
        : null;

    const novaDisciplina: Disciplina = {
      id,
      nome: dados.nome.trim(),
      codigo: dados.codigo?.trim() || undefined,
      nomeProfessor: dados.nomeProfessor?.trim() || undefined,
      contatoProfessor: dados.contatoProfessor?.trim() || undefined,
      localSala: dados.localSala?.trim() || undefined,
      anotacoes: dados.anotacoes?.trim() || undefined,
      corIdentificacao: dados.corIdentificacao || '#6366f1',
      limiteMaximoFaltas: limiteNormalizado,
      criterioAprovacao: dados.criterioAprovacao,
      notaMinimaAprovacao: dados.notaMinimaAprovacao ?? 6.0,
      dataCriacao: agora,
      dataAtualizacao: agora,
    };


    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `INSERT INTO ${TABELAS_SQLITE.DISCIPLINAS} (
          id, nome, codigo, nome_professor, contato_professor, local_sala,
          anotacoes, cor_identificacao, limite_maximo_faltas, criterio_aprovacao,
          nota_minima_aprovacao, data_criacao, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          novaDisciplina.id,
          novaDisciplina.nome,
          novaDisciplina.codigo ?? null,
          novaDisciplina.nomeProfessor ?? null,
          novaDisciplina.contatoProfessor ?? null,
          novaDisciplina.localSala ?? null,
          novaDisciplina.anotacoes ?? null,
          novaDisciplina.corIdentificacao,
          novaDisciplina.limiteMaximoFaltas ?? null,
          novaDisciplina.criterioAprovacao,
          novaDisciplina.notaMinimaAprovacao ?? 6.0,
          novaDisciplina.dataCriacao,
          novaDisciplina.dataAtualizacao,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, novaDisciplina);
    }

    return { ...novaDisciplina };
  }

  async buscarPorId(id: string): Promise<Disciplina | null> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const row = db.getFirstSync<DisciplinaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.DISCIPLINAS} WHERE id = ?`,
        [id]
      );
      return row ? this.rowParaDisciplina(row) : null;
    }
    const emMemoria = this.fallbackEmMemoria.get(id);
    return emMemoria ? { ...emMemoria } : null;
  }

  async listarTodas(): Promise<Disciplina[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const rows = db.getAllSync<DisciplinaRow>(
        `SELECT * FROM ${TABELAS_SQLITE.DISCIPLINAS} ORDER BY nome COLLATE NOCASE ASC`
      );
      return rows.map((r) => this.rowParaDisciplina(r));
    }
    return Array.from(this.fallbackEmMemoria.values())
      .map((d) => ({ ...d }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async atualizar(id: string, dados: AtualizarDisciplinaDTO): Promise<Disciplina> {
    const existente = await this.buscarPorId(id);
    if (!existente) {
      throw new Error(`Disciplina com ID ${id} não encontrada.`);
    }

    let novoLimite = existente.limiteMaximoFaltas;
    if (dados.limiteMaximoFaltas !== undefined) {
      if (dados.limiteMaximoFaltas === null || Number(dados.limiteMaximoFaltas) < 0) {
        novoLimite = null;
      } else {
        novoLimite = Math.floor(Number(dados.limiteMaximoFaltas));
      }
    }


    const agora = new Date().toISOString();
    const atualizada: Disciplina = {
      ...existente,
      nome: dados.nome !== undefined ? dados.nome.trim() : existente.nome,
      codigo: dados.codigo !== undefined ? (dados.codigo.trim() || undefined) : existente.codigo,
      nomeProfessor: dados.nomeProfessor !== undefined ? (dados.nomeProfessor.trim() || undefined) : existente.nomeProfessor,
      contatoProfessor: dados.contatoProfessor !== undefined ? (dados.contatoProfessor.trim() || undefined) : existente.contatoProfessor,
      localSala: dados.localSala !== undefined ? (dados.localSala.trim() || undefined) : existente.localSala,
      anotacoes: dados.anotacoes !== undefined ? (dados.anotacoes.trim() || undefined) : existente.anotacoes,
      corIdentificacao: dados.corIdentificacao !== undefined ? dados.corIdentificacao : existente.corIdentificacao,
      limiteMaximoFaltas: novoLimite,
      criterioAprovacao: dados.criterioAprovacao !== undefined ? dados.criterioAprovacao : existente.criterioAprovacao,
      notaMinimaAprovacao: dados.notaMinimaAprovacao !== undefined ? dados.notaMinimaAprovacao : existente.notaMinimaAprovacao,
      dataAtualizacao: agora,
    };

    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(
        `UPDATE ${TABELAS_SQLITE.DISCIPLINAS} SET
          nome = ?, codigo = ?, nome_professor = ?, contato_professor = ?,
          local_sala = ?, anotacoes = ?, cor_identificacao = ?,
          limite_maximo_faltas = ?, criterio_aprovacao = ?,
          nota_minima_aprovacao = ?, data_atualizacao = ?
        WHERE id = ?`,
        [
          atualizada.nome,
          atualizada.codigo ?? null,
          atualizada.nomeProfessor ?? null,
          atualizada.contatoProfessor ?? null,
          atualizada.localSala ?? null,
          atualizada.anotacoes ?? null,
          atualizada.corIdentificacao,
          atualizada.limiteMaximoFaltas ?? null,
          atualizada.criterioAprovacao,
          atualizada.notaMinimaAprovacao ?? 6.0,
          atualizada.dataAtualizacao,
          id,
        ]
      );
    } else {
      this.fallbackEmMemoria.set(id, atualizada);
    }

    return { ...atualizada };
  }

  async excluir(id: string): Promise<boolean> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      const resultado = db.runSync(
        `DELETE FROM ${TABELAS_SQLITE.DISCIPLINAS} WHERE id = ?`,
        [id]
      );
      return resultado.changes > 0;
    }
    return this.fallbackEmMemoria.delete(id);
  }

  async restaurarEmLote(disciplinas: Disciplina[]): Promise<Disciplina[]> {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      for (const d of disciplinas) {
        db.runSync(
          `INSERT OR REPLACE INTO ${TABELAS_SQLITE.DISCIPLINAS} (
            id, nome, codigo, nome_professor, contato_professor, local_sala,
            anotacoes, cor_identificacao, limite_maximo_faltas, criterio_aprovacao,
            nota_minima_aprovacao, data_criacao, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            d.id,
            d.nome,
            d.codigo ?? null,
            d.nomeProfessor ?? null,
            d.contatoProfessor ?? null,
            d.localSala ?? null,
            d.anotacoes ?? null,
            d.corIdentificacao,
            d.limiteMaximoFaltas ?? null,
            d.criterioAprovacao,
            d.notaMinimaAprovacao ?? 6.0,
            d.dataCriacao,
            d.dataAtualizacao,
          ]
        );
      }
      return this.listarTodas();
    }
    for (const d of disciplinas) {
      this.fallbackEmMemoria.set(d.id, { ...d });
    }
    return Array.from(this.fallbackEmMemoria.values()).map((d) => ({ ...d }));
  }

  limpar(): void {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      db.runSync(`DELETE FROM ${TABELAS_SQLITE.DISCIPLINAS}`);
    }
    this.fallbackEmMemoria.clear();
  }
}
