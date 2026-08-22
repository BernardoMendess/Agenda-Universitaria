import { Falta, CriarFaltaDTO } from '../../modelos/Falta';

/**
 * Interface que define as operações de persistência de Faltas.
 * Segue os princípios de Inversão de Dependência e Segregação de Interfaces (SOLID).
 */
export interface IFaltaRepositorio {
  adicionar(dados: CriarFaltaDTO): Promise<Falta>;
  removerUltima(disciplinaId: string): Promise<Falta | null>;
  removerPorId(id: string): Promise<boolean>;
  listarPorDisciplina(disciplinaId: string): Promise<Falta[]>;
  contarPorDisciplina(disciplinaId: string): Promise<number>;
  excluirPorDisciplina(disciplinaId: string): Promise<number>;
  limpar(): void;
}

/**
 * Implementação em memória / local para suporte Offline-First e testes unitários.
 */
export class FaltaRepositorioEmMemoria implements IFaltaRepositorio {
  private faltas: Map<string, Falta> = new Map();

  async adicionar(dados: CriarFaltaDTO): Promise<Falta> {
    const agora = new Date();
    const id = `falta_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Se data ou horário não forem informados, utiliza o momento atual
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

    this.faltas.set(id, novaFalta);
    return { ...novaFalta };
  }

  async removerUltima(disciplinaId: string): Promise<Falta | null> {
    const faltasDaDisciplina = await this.listarPorDisciplina(disciplinaId);
    if (faltasDaDisciplina.length === 0) {
      return null;
    }

    // A mais recente é a primeira após ordenação
    const ultimaFalta = faltasDaDisciplina[0];
    this.faltas.delete(ultimaFalta.id);
    return ultimaFalta;
  }

  async removerPorId(id: string): Promise<boolean> {
    return this.faltas.delete(id);
  }

  async listarPorDisciplina(disciplinaId: string): Promise<Falta[]> {
    return Array.from(this.faltas.values())
      .filter((f) => f.disciplinaId === disciplinaId)
      .map((f) => ({ ...f }))
      .sort((a, b) => {
        // Ordena por data decrescente (mais recente primeiro) e depois por horário
        const dataComparacao = b.data.localeCompare(a.data);
        if (dataComparacao !== 0) return dataComparacao;
        return b.horario.localeCompare(a.horario);
      });
  }

  async contarPorDisciplina(disciplinaId: string): Promise<number> {
    let contagem = 0;
    for (const falta of this.faltas.values()) {
      if (falta.disciplinaId === disciplinaId) {
        contagem++;
      }
    }
    return contagem;
  }

  async excluirPorDisciplina(disciplinaId: string): Promise<number> {
    let removidos = 0;
    for (const [id, falta] of this.faltas.entries()) {
      if (falta.disciplinaId === disciplinaId) {
        this.faltas.delete(id);
        removidos++;
      }
    }
    return removidos;
  }

  limpar(): void {
    this.faltas.clear();
  }
}

export const faltaRepositorio = new FaltaRepositorioEmMemoria();
