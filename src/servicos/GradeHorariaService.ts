import {
  HorarioAula,
  CriarHorarioAulaDTO,
  AtualizarHorarioAulaDTO,
  DiaSemana,
  DIAS_DA_SEMANA,
} from '../modelos/HorarioAula';
import {
  IHorarioAulaRepositorio,
  horarioAulaRepositorio,
} from './banco/HorarioAulaRepositorio';
import {
  IDisciplinaRepositorio,
  disciplinaRepositorio,
} from './banco/DisciplinaRepositorio';

export interface AulaGradeItem {
  id: string;
  disciplinaId: string;
  nomeDisciplina: string;
  codigoDisciplina?: string;
  corIdentificacao: string;
  nomeProfessor?: string;
  localSala?: string;
  diaSemana: DiaSemana;
  horarioInicio: string;
  horarioFim: string;
}

export type GradeSemanal = Record<DiaSemana, AulaGradeItem[]>;

export class GradeHorariaService {
  private horarioRepositorio: IHorarioAulaRepositorio;
  private disciplinaRepo: IDisciplinaRepositorio;

  constructor(
    horarioRepositorio: IHorarioAulaRepositorio = horarioAulaRepositorio,
    disciplinaRepo: IDisciplinaRepositorio = disciplinaRepositorio
  ) {
    this.horarioRepositorio = horarioRepositorio;
    this.disciplinaRepo = disciplinaRepo;
  }

  /**
   * Valida e adiciona um novo bloco de horário de aula.
   */
  async adicionarHorario(dados: CriarHorarioAulaDTO): Promise<HorarioAula> {
    await this.validarDisciplinaExiste(dados.disciplinaId);
    this.validarFormatoHorario(dados.diaSemana, dados.horarioInicio, dados.horarioFim);
    
    // Verifica conflito de horário no mesmo dia
    const conflito = await this.verificarConflito(
      dados.diaSemana,
      dados.horarioInicio,
      dados.horarioFim
    );

    if (conflito) {
      const disc = await this.disciplinaRepo.buscarPorId(conflito.disciplinaId);
      const nomeDisc = disc ? disc.nome : 'outra matéria';
      throw new Error(
        `Conflito de horário: já existe aula de "${nomeDisc}" das ${conflito.horarioInicio} às ${conflito.horarioFim} neste dia.`
      );
    }

    return await this.horarioRepositorio.criar(dados);
  }

  /**
   * Atualiza um bloco de horário existente.
   */
  async atualizarHorario(id: string, dados: AtualizarHorarioAulaDTO): Promise<HorarioAula> {
    const existente = await this.horarioRepositorio.buscarPorId(id);
    if (!existente) {
      throw new Error('Horário de aula não encontrado.');
    }

    const diaSemana = dados.diaSemana || existente.diaSemana;
    const inicio = dados.horarioInicio || existente.horarioInicio;
    const fim = dados.horarioFim || existente.horarioFim;

    this.validarFormatoHorario(diaSemana, inicio, fim);

    const conflito = await this.verificarConflito(diaSemana, inicio, fim, id);
    if (conflito) {
      const disc = await this.disciplinaRepo.buscarPorId(conflito.disciplinaId);
      const nomeDisc = disc ? disc.nome : 'outra matéria';
      throw new Error(
        `Conflito de horário: já existe aula de "${nomeDisc}" das ${conflito.horarioInicio} às ${conflito.horarioFim} neste dia.`
      );
    }

    return await this.horarioRepositorio.atualizar(id, dados);
  }

  /**
   * Define/substitui todos os horários de uma disciplina.
   */
  async definirHorariosDisciplina(
    disciplinaId: string,
    novosHorarios: Omit<CriarHorarioAulaDTO, 'disciplinaId'>[]
  ): Promise<HorarioAula[]> {
    await this.validarDisciplinaExiste(disciplinaId);

    // Valida cada bloco individualmente
    for (const h of novosHorarios) {
      this.validarFormatoHorario(h.diaSemana, h.horarioInicio, h.horarioFim);
    }

    // Valida conflitos internos entre os novos blocos
    for (let i = 0; i < novosHorarios.length; i++) {
      for (let j = i + 1; j < novosHorarios.length; j++) {
        const a = novosHorarios[i];
        const b = novosHorarios[j];
        if (a.diaSemana === b.diaSemana && this.existeSobreposicao(a.horarioInicio, a.horarioFim, b.horarioInicio, b.horarioFim)) {
          throw new Error(
            `Conflito interno: existem dois horários sobrepostos na ${a.diaSemana} (${a.horarioInicio}-${a.horarioFim} e ${b.horarioInicio}-${b.horarioFim}).`
          );
        }
      }
    }

    // Valida conflitos com outras disciplinas existentes
    const todosHorarios = await this.horarioRepositorio.listarTodos();
    const outrosHorarios = todosHorarios.filter((h) => h.disciplinaId !== disciplinaId);

    for (const h of novosHorarios) {
      const conflito = outrosHorarios.find(
        (existente) =>
          existente.diaSemana === h.diaSemana &&
          this.existeSobreposicao(h.horarioInicio, h.horarioFim, existente.horarioInicio, existente.horarioFim)
      );

      if (conflito) {
        const disc = await this.disciplinaRepo.buscarPorId(conflito.disciplinaId);
        const nomeDisc = disc ? disc.nome : 'outra matéria';
        throw new Error(
          `Conflito de horário: o bloco ${h.horarioInicio}-${h.horarioFim} colide com "${nomeDisc}" (${conflito.horarioInicio}-${conflito.horarioFim}).`
        );
      }
    }

    return await this.horarioRepositorio.substituirHorariosDisciplina(disciplinaId, novosHorarios);
  }

  /**
   * Exclui um horário de aula por ID.
   */
  async excluirHorario(id: string): Promise<boolean> {
    const existe = await this.horarioRepositorio.buscarPorId(id);
    if (!existe) {
      throw new Error('Horário não encontrado para exclusão.');
    }
    return await this.horarioRepositorio.excluir(id);
  }

  /**
   * Exclui todos os horários vinculados a uma disciplina.
   */
  async excluirHorariosPorDisciplina(disciplinaId: string): Promise<number> {
    return await this.horarioRepositorio.excluirPorDisciplina(disciplinaId);
  }

  /**
   * Lista os horários de uma disciplina.
   */
  async listarPorDisciplina(disciplinaId: string): Promise<HorarioAula[]> {
    return await this.horarioRepositorio.listarPorDisciplina(disciplinaId);
  }

  /**
   * Obtém a grade semanal completa estruturada por dias.
   */
  async obterGradeSemanal(): Promise<GradeSemanal> {
    const grade: GradeSemanal = {
      SEGUNDA: [],
      TERCA: [],
      QUARTA: [],
      QUINTA: [],
      SEXTA: [],
      SABADO: [],
      DOMINGO: [],
    };

    const todasDisciplinas = await this.disciplinaRepo.listarTodas();
    const mapaDisciplinas = new Map(todasDisciplinas.map((d) => [d.id, d]));

    const todosHorarios = await this.horarioRepositorio.listarTodos();

    for (const h of todosHorarios) {
      const disc = mapaDisciplinas.get(h.disciplinaId);
      if (disc && grade[h.diaSemana]) {
        grade[h.diaSemana].push({
          id: h.id,
          disciplinaId: h.disciplinaId,
          nomeDisciplina: disc.nome,
          codigoDisciplina: disc.codigo,
          corIdentificacao: disc.corIdentificacao,
          nomeProfessor: disc.nomeProfessor,
          localSala: h.localSala || disc.localSala,
          diaSemana: h.diaSemana,
          horarioInicio: h.horarioInicio,
          horarioFim: h.horarioFim,
        });
      }
    }

    // Ordena cada dia cronologicamente
    for (const dia of DIAS_DA_SEMANA) {
      grade[dia].sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
    }

    return grade;
  }

  /**
   * Obtém as aulas de um dia específico com informações completas da disciplina.
   */
  async obterAulasDoDia(diaSemana: DiaSemana): Promise<AulaGradeItem[]> {
    const grade = await this.obterGradeSemanal();
    return grade[diaSemana] || [];
  }

  /**
   * Converte a data atual para o DiaSemana correspondente.
   */
  converterDateParaDiaSemana(data: Date = new Date()): DiaSemana {
    const diaNum = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const mapa: Record<number, DiaSemana> = {
      0: 'DOMINGO',
      1: 'SEGUNDA',
      2: 'TERCA',
      3: 'QUARTA',
      4: 'QUINTA',
      5: 'SEXTA',
      6: 'SABADO',
    };
    return mapa[diaNum];
  }

  /**
   * Obtém as aulas do dia atual.
   */
  async obterAulasDeHoje(): Promise<AulaGradeItem[]> {
    const diaHoje = this.converterDateParaDiaSemana();
    return await this.obterAulasDoDia(diaHoje);
  }

  // --- Validações e Funções Auxiliares ---

  private async validarDisciplinaExiste(disciplinaId: string): Promise<void> {
    if (!disciplinaId || disciplinaId.trim() === '') {
      throw new Error('ID da disciplina é obrigatório.');
    }
    const disc = await this.disciplinaRepo.buscarPorId(disciplinaId);
    if (!disc) {
      throw new Error(`Disciplina com ID ${disciplinaId} não encontrada.`);
    }
  }

  private validarFormatoHorario(diaSemana: DiaSemana, inicio: string, fim: string): void {
    if (!diaSemana || !DIAS_DA_SEMANA.includes(diaSemana)) {
      throw new Error('Dia da semana inválido.');
    }

    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!inicio || !regexHora.test(inicio.trim())) {
      throw new Error('Horário de início inválido. Utilize o formato HH:mm (ex: 08:00).');
    }

    if (!fim || !regexHora.test(fim.trim())) {
      throw new Error('Horário de término inválido. Utilize o formato HH:mm (ex: 09:40).');
    }

    if (inicio.trim() >= fim.trim()) {
      throw new Error('O horário de início deve ser anterior ao horário de término.');
    }
  }

  private async verificarConflito(
    diaSemana: DiaSemana,
    inicio: string,
    fim: string,
    ignorarHorarioId?: string
  ): Promise<HorarioAula | null> {
    const horariosDoDia = await this.horarioRepositorio.listarPorDia(diaSemana);
    
    for (const h of horariosDoDia) {
      if (ignorarHorarioId && h.id === ignorarHorarioId) {
        continue;
      }
      if (this.existeSobreposicao(inicio.trim(), fim.trim(), h.horarioInicio, h.horarioFim)) {
        return h;
      }
    }

    return null;
  }

  private existeSobreposicao(iniA: string, fimA: string, iniB: string, fimB: string): boolean {
    return Math.max(this.horaParaMinutos(iniA), this.horaParaMinutos(iniB)) <
           Math.min(this.horaParaMinutos(fimA), this.horaParaMinutos(fimB));
  }

  private horaParaMinutos(horaStr: string): number {
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
  }
}

export const gradeHorariaService = new GradeHorariaService();
