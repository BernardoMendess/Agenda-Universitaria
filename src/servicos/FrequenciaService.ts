import { Falta, CriarFaltaDTO, ResumoFrequencia, StatusFrequencia } from '../modelos/Falta';
import { Disciplina } from '../modelos/Disciplina';
import { IFaltaRepositorio, faltaRepositorio } from './banco/FaltaRepositorio';
import { IDisciplinaRepositorio, disciplinaRepositorio } from './banco/DisciplinaRepositorio';

export class FrequenciaService {
  private faltaRepo: IFaltaRepositorio;
  private disciplinaRepo: IDisciplinaRepositorio;

  constructor(
    faltaRepo: IFaltaRepositorio = faltaRepositorio,
    disciplinaRepo: IDisciplinaRepositorio = disciplinaRepositorio
  ) {
    this.faltaRepo = faltaRepo;
    this.disciplinaRepo = disciplinaRepo;
  }

  /**
   * Incremento rápido de falta (+1) para uma disciplina.
   */
  async incrementarFalta(
    disciplinaId: string,
    justificativa?: string
  ): Promise<{ falta: Falta; resumo: ResumoFrequencia }> {
    await this.validarExistenciaDisciplina(disciplinaId);

    const falta = await this.faltaRepo.adicionar({
      disciplinaId,
      justificativa,
    });

    const resumo = await this.calcularResumoFrequencia(disciplinaId);
    return { falta, resumo };
  }

  /**
   * Decremento rápido de falta (-1) para uma disciplina.
   * Remove o registro de falta mais recente da matéria.
   */
  async decrementarFalta(
    disciplinaId: string
  ): Promise<{ removida: boolean; resumo: ResumoFrequencia }> {
    await this.validarExistenciaDisciplina(disciplinaId);

    const faltaRemovida = await this.faltaRepo.removerUltima(disciplinaId);
    const resumo = await this.calcularResumoFrequencia(disciplinaId);

    return {
      removida: !!faltaRemovida,
      resumo,
    };
  }

  /**
   * Registro detalhado de falta com data, horário e justificativa opcional.
   */
  async registrarFaltaDetalhada(
    dados: CriarFaltaDTO
  ): Promise<{ falta: Falta; resumo: ResumoFrequencia }> {
    await this.validarExistenciaDisciplina(dados.disciplinaId);

    if (dados.data && !this.validarFormatoData(dados.data)) {
      throw new Error('Data no formato inválido. Utilize o formato AAAA-MM-DD.');
    }

    if (dados.horario && !this.validarFormatoHorario(dados.horario)) {
      throw new Error('Horário no formato inválido. Utilize o formato HH:mm (ex: 08:30).');
    }

    const falta = await this.faltaRepo.adicionar(dados);
    const resumo = await this.calcularResumoFrequencia(dados.disciplinaId);

    return { falta, resumo };
  }

  /**
   * Remove uma falta específica pelo ID.
   */
  async removerFaltaPorId(
    id: string,
    disciplinaId: string
  ): Promise<{ removida: boolean; resumo: ResumoFrequencia }> {
    await this.validarExistenciaDisciplina(disciplinaId);

    const removida = await this.faltaRepo.removerPorId(id);
    const resumo = await this.calcularResumoFrequencia(disciplinaId);

    return { removida, resumo };
  }

  /**
   * Lista o histórico de faltas de uma disciplina em ordem cronológica decrescente.
   */
  async obterHistorico(disciplinaId: string): Promise<Falta[]> {
    await this.validarExistenciaDisciplina(disciplinaId);
    return await this.faltaRepo.listarPorDisciplina(disciplinaId);
  }

  /**
   * Calcula o resumo de frequência de uma matéria aplicando as regras de limite (RF04/RF05).
   */
  async calcularResumoFrequencia(disciplinaId: string): Promise<ResumoFrequencia> {
    const disciplina = await this.disciplinaRepo.buscarPorId(disciplinaId);
    if (!disciplina) {
      throw new Error(`Disciplina com ID "${disciplinaId}" não encontrada.`);
    }

    const totalFaltas = await this.faltaRepo.contarPorDisciplina(disciplinaId);
    return this.computarResumo(disciplina, totalFaltas);
  }

  /**
   * Computa resumos de frequência em lote para otimizar renderizações de listas.
   */
  async calcularResumosEmLote(
    disciplinas: Disciplina[]
  ): Promise<Record<string, ResumoFrequencia>> {
    const resumos: Record<string, ResumoFrequencia> = {};

    for (const disc of disciplinas) {
      const totalFaltas = await this.faltaRepo.contarPorDisciplina(disc.id);
      resumos[disc.id] = this.computarResumo(disc, totalFaltas);
    }

    return resumos;
  }

  // --- Regras de Cálculo Puras (RF04 & RF05) ---

  private computarResumo(disciplina: Disciplina, totalFaltas: number): ResumoFrequencia {
    const limite = disciplina.limiteMaximoFaltas;
    const presencaObrigatoria = typeof limite === 'number' && limite > 0;

    // Se presença NÃO é obrigatória (sem limite definido):
    if (!presencaObrigatoria) {
      return {
        disciplinaId: disciplina.id,
        totalFaltas,
        limiteMaximoFaltas: null,
        presencaObrigatoria: false,
        faltasRestantes: null,
        percentualConsumido: 0,
        status: 'SEGURO',
        reprovadoPorFalta: false,
      };
    }

    // Se presença é obrigatória (limite > 0):
    const faltasRestantes = Math.max(0, limite - totalFaltas);
    const percentualConsumido = Math.min(100, Math.round((totalFaltas / limite) * 100));
    const reprovadoPorFalta = totalFaltas >= limite;

    let status: StatusFrequencia = 'SEGURO';
    if (reprovadoPorFalta) {
      status = 'CRITICO';
    } else if (percentualConsumido >= 75) {
      status = 'ALERTA';
    } else if (percentualConsumido >= 50) {
      status = 'MODERADO';
    }

    return {
      disciplinaId: disciplina.id,
      totalFaltas,
      limiteMaximoFaltas: limite,
      presencaObrigatoria: true,
      faltasRestantes,
      percentualConsumido,
      status,
      reprovadoPorFalta,
    };
  }

  // --- Validações ---

  private async validarExistenciaDisciplina(disciplinaId: string): Promise<Disciplina> {
    if (!disciplinaId || disciplinaId.trim() === '') {
      throw new Error('ID da disciplina inválido.');
    }

    const disc = await this.disciplinaRepo.buscarPorId(disciplinaId);
    if (!disc) {
      throw new Error(`Disciplina com ID "${disciplinaId}" não encontrada.`);
    }

    return disc;
  }

  private validarFormatoData(data: string): boolean {
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexData.test(data)) return false;

    const dataObj = new Date(data);
    return !isNaN(dataObj.getTime());
  }

  private validarFormatoHorario(horario: string): boolean {
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regexHora.test(horario);
  }
}

export const frequenciaService = new FrequenciaService();
