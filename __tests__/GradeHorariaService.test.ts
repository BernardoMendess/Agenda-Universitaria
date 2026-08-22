import { GradeHorariaService } from '../src/servicos/GradeHorariaService';
import { DisciplinaService } from '../src/servicos/DisciplinaService';
import { HorarioAulaRepositorioEmMemoria } from '../src/servicos/banco/HorarioAulaRepositorio';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { Disciplina } from '../src/modelos/Disciplina';

describe('GradeHorariaService - RF02: Grade Horária Semanal', () => {
  let horarioRepo: HorarioAulaRepositorioEmMemoria;
  let disciplinaRepo: DisciplinaRepositorioEmMemoria;
  let gradeService: GradeHorariaService;
  let disciplinaService: DisciplinaService;
  let disciplinaA: Disciplina;
  let disciplinaB: Disciplina;

  beforeEach(async () => {
    horarioRepo = new HorarioAulaRepositorioEmMemoria();
    disciplinaRepo = new DisciplinaRepositorioEmMemoria();
    gradeService = new GradeHorariaService(horarioRepo, disciplinaRepo);
    disciplinaService = new DisciplinaService(disciplinaRepo, horarioRepo);

    disciplinaA = await disciplinaRepo.criar({
      nome: 'Estruturas de Dados',
      codigo: 'CC201',
      corIdentificacao: '#6366f1',
      limiteMaximoFaltas: 10,
      criterioAprovacao: 'ARITMETICA',
      localSala: 'Lab 1',
    });

    disciplinaB = await disciplinaRepo.criar({
      nome: 'Banco de Dados',
      codigo: 'CC202',
      corIdentificacao: '#2ea043',
      limiteMaximoFaltas: 8,
      criterioAprovacao: 'PONDERADA',
      localSala: 'Sala 302',
    });
  });

  describe('Adição e Configuração de Horários', () => {
    it('deve adicionar múltiplos blocos de horários para a mesma disciplina em dias distintos', async () => {
      const h1 = await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'SEGUNDA',
        horarioInicio: '08:00',
        horarioFim: '09:40',
      });

      const h2 = await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'QUARTA',
        horarioInicio: '10:00',
        horarioFim: '11:40',
      });

      expect(h1.id).toBeDefined();
      expect(h2.id).toBeDefined();

      const horariosDisc = await gradeService.listarPorDisciplina(disciplinaA.id);
      expect(horariosDisc).toHaveLength(2);
      expect(horariosDisc[0].diaSemana).toBe('SEGUNDA');
      expect(horariosDisc[1].diaSemana).toBe('QUARTA');
    });

    it('deve permitir múltiplos blocos de horários no mesmo dia sem sobreposição', async () => {
      await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'TERCA',
        horarioInicio: '08:00',
        horarioFim: '09:40',
      });

      const h2 = await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'TERCA',
        horarioInicio: '14:00',
        horarioFim: '15:40',
      });

      expect(h2.id).toBeDefined();
      const horariosDoDia = await horarioRepo.listarPorDia('TERCA');
      expect(horariosDoDia).toHaveLength(2);
    });

    it('deve rejeitar horário com disciplina inexistente', async () => {
      await expect(
        gradeService.adicionarHorario({
          disciplinaId: 'inexistente',
          diaSemana: 'SEGUNDA',
          horarioInicio: '08:00',
          horarioFim: '09:40',
        })
      ).rejects.toThrow('não encontrada');
    });

    it('deve rejeitar formato de hora inválido', async () => {
      await expect(
        gradeService.adicionarHorario({
          disciplinaId: disciplinaA.id,
          diaSemana: 'SEGUNDA',
          horarioInicio: '25:00',
          horarioFim: '09:40',
        })
      ).rejects.toThrow('Horário de início inválido');

      await expect(
        gradeService.adicionarHorario({
          disciplinaId: disciplinaA.id,
          diaSemana: 'SEGUNDA',
          horarioInicio: '08:00',
          horarioFim: '08:75',
        })
      ).rejects.toThrow('Horário de término inválido');
    });

    it('deve rejeitar quando horário de início for maior ou igual ao de término', async () => {
      await expect(
        gradeService.adicionarHorario({
          disciplinaId: disciplinaA.id,
          diaSemana: 'SEGUNDA',
          horarioInicio: '10:00',
          horarioFim: '09:00',
        })
      ).rejects.toThrow('anterior ao horário de término');

      await expect(
        gradeService.adicionarHorario({
          disciplinaId: disciplinaA.id,
          diaSemana: 'SEGUNDA',
          horarioInicio: '10:00',
          horarioFim: '10:00',
        })
      ).rejects.toThrow('anterior ao horário de término');
    });
  });

  describe('Detecção de Conflitos e Substituição em Lote', () => {
    it('deve rejeitar conflito de horários no mesmo dia para disciplinas diferentes', async () => {
      await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'SEGUNDA',
        horarioInicio: '08:00',
        horarioFim: '10:00',
      });

      // Tentativa de aula sobreposta (09:00 - 11:00)
      await expect(
        gradeService.adicionarHorario({
          disciplinaId: disciplinaB.id,
          diaSemana: 'SEGUNDA',
          horarioInicio: '09:00',
          horarioFim: '11:00',
        })
      ).rejects.toThrow('Conflito de horário');
    });

    it('deve definir horários de uma disciplina em lote substituindo os anteriores', async () => {
      await gradeService.definirHorariosDisciplina(disciplinaA.id, [
        { diaSemana: 'TERCA', horarioInicio: '08:00', horarioFim: '10:00' },
        { diaSemana: 'QUINTA', horarioInicio: '08:00', horarioFim: '10:00' },
      ]);

      let horarios = await gradeService.listarPorDisciplina(disciplinaA.id);
      expect(horarios).toHaveLength(2);

      // Substitui por apenas 1 novo horário
      await gradeService.definirHorariosDisciplina(disciplinaA.id, [
        { diaSemana: 'SEXTA', horarioInicio: '14:00', horarioFim: '16:00' },
      ]);

      horarios = await gradeService.listarPorDisciplina(disciplinaA.id);
      expect(horarios).toHaveLength(1);
      expect(horarios[0].diaSemana).toBe('SEXTA');
    });

    it('deve rejeitar conflito interno entre múltiplos horários passados no mesmo lote', async () => {
      await expect(
        gradeService.definirHorariosDisciplina(disciplinaA.id, [
          { diaSemana: 'SEGUNDA', horarioInicio: '08:00', horarioFim: '10:00' },
          { diaSemana: 'SEGUNDA', horarioInicio: '09:00', horarioFim: '11:00' },
        ])
      ).rejects.toThrow('Conflito interno');
    });
  });

  describe('Consultas de Grade Semanal e Aulas do Dia', () => {
    it('deve obter grade semanal estruturada e ordenada cronologicamente', async () => {
      await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'SEGUNDA',
        horarioInicio: '10:00',
        horarioFim: '12:00',
      });

      await gradeService.adicionarHorario({
        disciplinaId: disciplinaB.id,
        diaSemana: 'SEGUNDA',
        horarioInicio: '08:00',
        horarioFim: '09:40',
      });

      const grade = await gradeService.obterGradeSemanal();
      expect(grade.SEGUNDA).toHaveLength(2);
      // Ordenação: 08:00 antes de 10:00
      expect(grade.SEGUNDA[0].nomeDisciplina).toBe('Banco de Dados');
      expect(grade.SEGUNDA[0].horarioInicio).toBe('08:00');
      expect(grade.SEGUNDA[1].nomeDisciplina).toBe('Estruturas de Dados');
      expect(grade.SEGUNDA[1].horarioInicio).toBe('10:00');
    });

    it('deve obter aulas de um dia específico com informações completas', async () => {
      await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'SEXTA',
        horarioInicio: '14:00',
        horarioFim: '16:00',
        localSala: 'Lab 3',
      });

      const aulasSexta = await gradeService.obterAulasDoDia('SEXTA');
      expect(aulasSexta).toHaveLength(1);
      expect(aulasSexta[0].nomeDisciplina).toBe('Estruturas de Dados');
      expect(aulasSexta[0].localSala).toBe('Lab 3');
      expect(aulasSexta[0].corIdentificacao).toBe('#6366f1');
    });
  });

  describe('Exclusão e Cascata', () => {
    it('deve remover horários vinculados em cascata quando a disciplina for excluída', async () => {
      await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'SEGUNDA',
        horarioInicio: '08:00',
        horarioFim: '10:00',
      });

      await gradeService.adicionarHorario({
        disciplinaId: disciplinaA.id,
        diaSemana: 'QUARTA',
        horarioInicio: '08:00',
        horarioFim: '10:00',
      });

      let horarios = await gradeService.listarPorDisciplina(disciplinaA.id);
      expect(horarios).toHaveLength(2);

      // Exclui a disciplina via DisciplinaService
      await disciplinaService.excluirDisciplina(disciplinaA.id);

      horarios = await gradeService.listarPorDisciplina(disciplinaA.id);
      expect(horarios).toHaveLength(0);
    });
  });
});
