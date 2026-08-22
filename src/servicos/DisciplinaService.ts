import { Disciplina, CriarDisciplinaDTO, AtualizarDisciplinaDTO } from '../modelos/Disciplina';
import { IDisciplinaRepositorio, disciplinaRepositorio } from './banco/DisciplinaRepositorio';
import { IHorarioAulaRepositorio, horarioAulaRepositorio } from './banco/HorarioAulaRepositorio';
import { IFaltaRepositorio, faltaRepositorio } from './banco/FaltaRepositorio';

export class DisciplinaService {
  private repositorio: IDisciplinaRepositorio;
  private horarioRepositorio: IHorarioAulaRepositorio;
  private faltaRepositorio: IFaltaRepositorio;

  constructor(
    repositorio: IDisciplinaRepositorio = disciplinaRepositorio,
    horarioRepositorio: IHorarioAulaRepositorio = horarioAulaRepositorio,
    faltaRepositorioInstancia: IFaltaRepositorio = faltaRepositorio
  ) {
    this.repositorio = repositorio;
    this.horarioRepositorio = horarioRepositorio;
    this.faltaRepositorio = faltaRepositorioInstancia;
  }


  /**
   * Valida e cadastra uma nova disciplina localmente.
   */
  async criarDisciplina(dados: CriarDisciplinaDTO): Promise<Disciplina> {
    this.validarDadosCriacao(dados);
    return await this.repositorio.criar(dados);
  }

  /**
   * Atualiza dados de uma disciplina existente.
   */
  async atualizarDisciplina(id: string, dados: AtualizarDisciplinaDTO): Promise<Disciplina> {
    if (!id || id.trim() === '') {
      throw new Error('ID da disciplina inválido.');
    }

    const disciplinaExistente = await this.repositorio.buscarPorId(id);
    if (!disciplinaExistente) {
      throw new Error('Disciplina não encontrada.');
    }

    this.validarDadosAtualizacao(dados);
    return await this.repositorio.atualizar(id, dados);
  }

  /**
   * Busca disciplina por ID.
   */
  async buscarPorId(id: string): Promise<Disciplina> {
    if (!id || id.trim() === '') {
      throw new Error('ID da disciplina inválido.');
    }

    const disciplina = await this.repositorio.buscarPorId(id);
    if (!disciplina) {
      throw new Error('Disciplina não encontrada.');
    }

    return disciplina;
  }

  /**
   * Lista todas as disciplinas cadastradas.
   */
  async listarTodas(): Promise<Disciplina[]> {
    return await this.repositorio.listarTodas();
  }

  /**
   * Remove uma disciplina por ID e limpa seus horários vinculados (cascata).
   */
  async excluirDisciplina(id: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      throw new Error('ID da disciplina inválido.');
    }

    const existe = await this.repositorio.buscarPorId(id);
    if (!existe) {
      throw new Error('Disciplina não encontrada para exclusão.');
    }

    // Exclui horários e faltas vinculados
    await this.horarioRepositorio.excluirPorDisciplina(id);
    await this.faltaRepositorio.excluirPorDisciplina(id);

    return await this.repositorio.excluir(id);
  }

  // --- Validações de Regra de Negócio ---

  private validarDadosCriacao(dados: CriarDisciplinaDTO): void {
    if (!dados.nome || dados.nome.trim().length < 2) {
      throw new Error('O nome da disciplina é obrigatório e deve ter no mínimo 2 caracteres.');
    }

    if (dados.limiteMaximoFaltas === undefined || dados.limiteMaximoFaltas === null) {
      throw new Error('O limite máximo de faltas é obrigatório.');
    }

    // Regra RF01 / RF04: Limite deve ser número inteiro >= 0 (limite 0 é válido)
    if (typeof dados.limiteMaximoFaltas !== 'number' || isNaN(dados.limiteMaximoFaltas) || dados.limiteMaximoFaltas < 0) {
      throw new Error('O limite máximo de faltas deve ser um número maior ou igual a zero.');
    }

    if (!Number.isInteger(dados.limiteMaximoFaltas)) {
      throw new Error('O limite máximo de faltas deve ser um número inteiro.');
    }

    if (!dados.criterioAprovacao || !['ARITMETICA', 'PONDERADA', 'CUSTOMIZADA'].includes(dados.criterioAprovacao)) {
      throw new Error('Critério de aprovação inválido.');
    }
  }

  private validarDadosAtualizacao(dados: AtualizarDisciplinaDTO): void {
    if (dados.nome !== undefined && dados.nome.trim().length < 2) {
      throw new Error('O nome da disciplina deve ter no mínimo 2 caracteres.');
    }

    if (dados.limiteMaximoFaltas !== undefined) {
      if (typeof dados.limiteMaximoFaltas !== 'number' || isNaN(dados.limiteMaximoFaltas) || dados.limiteMaximoFaltas < 0) {
        throw new Error('O limite máximo de faltas deve ser um número maior ou igual a zero.');
      }
      if (!Number.isInteger(dados.limiteMaximoFaltas)) {
        throw new Error('O limite máximo de faltas deve ser um número inteiro.');
      }
    }

    if (dados.criterioAprovacao !== undefined && !['ARITMETICA', 'PONDERADA', 'CUSTOMIZADA'].includes(dados.criterioAprovacao)) {
      throw new Error('Critério de aprovação inválido.');
    }
  }
}

// Instância singleton do serviço
export const disciplinaService = new DisciplinaService();
