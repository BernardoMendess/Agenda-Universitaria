import { DisciplinaService } from '../src/servicos/DisciplinaService';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { CriarDisciplinaDTO } from '../src/modelos/Disciplina';

describe('DisciplinaService - RF01: Cadastro de Disciplinas', () => {
  let repositorio: DisciplinaRepositorioEmMemoria;
  let service: DisciplinaService;

  beforeEach(() => {
    repositorio = new DisciplinaRepositorioEmMemoria();
    service = new DisciplinaService(repositorio);
  });

  it('deve cadastrar uma disciplina com todos os campos válidos', async () => {
    const dados: CriarDisciplinaDTO = {
      nome: 'Cálculo Diferencial e Integral I',
      codigo: 'MAT001',
      nomeProfessor: 'Prof. Gauss',
      contatoProfessor: 'gauss@universidade.br',
      localSala: 'Prédio 4, Sala 202',
      anotacoes: 'https://pasta.drive/calculo1',
      corIdentificacao: '#6366f1',
      limiteMaximoFaltas: 15,
      criterioAprovacao: 'ARITMETICA',
    };

    const disciplina = await service.criarDisciplina(dados);

    expect(disciplina.id).toBeDefined();
    expect(disciplina.nome).toBe('Cálculo Diferencial e Integral I');
    expect(disciplina.codigo).toBe('MAT001');
    expect(disciplina.limiteMaximoFaltas).toBe(15);
    expect(disciplina.criterioAprovacao).toBe('ARITMETICA');
  });

  it('deve permitir cadastro com limite de faltas igual a 0 (zero)', async () => {
    const dados: CriarDisciplinaDTO = {
      nome: 'Estágio Obrigatório',
      corIdentificacao: '#ef4444',
      limiteMaximoFaltas: 0,
      criterioAprovacao: 'CUSTOMIZADA',
    };

    const disciplina = await service.criarDisciplina(dados);

    expect(disciplina.id).toBeDefined();
    expect(disciplina.limiteMaximoFaltas).toBe(0);
  });

  it('deve rejeitar cadastro com limite de faltas negativo', async () => {
    const dados: CriarDisciplinaDTO = {
      nome: 'Física I',
      corIdentificacao: '#3b82f6',
      limiteMaximoFaltas: -1,
      criterioAprovacao: 'ARITMETICA',
    };

    await expect(service.criarDisciplina(dados)).rejects.toThrow(
      'O limite máximo de faltas deve ser um número maior ou igual a zero.'
    );
  });

  it('deve rejeitar cadastro com limite de faltas não inteiro', async () => {
    const dados: CriarDisciplinaDTO = {
      nome: 'Física I',
      corIdentificacao: '#3b82f6',
      limiteMaximoFaltas: 4.5,
      criterioAprovacao: 'ARITMETICA',
    };

    await expect(service.criarDisciplina(dados)).rejects.toThrow(
      'O limite máximo de faltas deve ser um número inteiro.'
    );
  });

  it('deve rejeitar cadastro sem nome da disciplina', async () => {
    const dados: CriarDisciplinaDTO = {
      nome: '',
      corIdentificacao: '#3b82f6',
      limiteMaximoFaltas: 10,
      criterioAprovacao: 'ARITMETICA',
    };

    await expect(service.criarDisciplina(dados)).rejects.toThrow(
      'O nome da disciplina é obrigatório e deve ter no mínimo 2 caracteres.'
    );
  });

  it('deve atualizar dados de uma disciplina existente', async () => {
    const criada = await service.criarDisciplina({
      nome: 'Algoritmos',
      corIdentificacao: '#10b981',
      limiteMaximoFaltas: 10,
      criterioAprovacao: 'PONDERADA',
    });

    const atualizada = await service.atualizarDisciplina(criada.id, {
      nome: 'Algoritmos e Estruturas de Dados',
      localSala: 'Lab 03',
      limiteMaximoFaltas: 12,
    });

    expect(atualizada.nome).toBe('Algoritmos e Estruturas de Dados');
    expect(atualizada.localSala).toBe('Lab 03');
    expect(atualizada.limiteMaximoFaltas).toBe(12);
  });

  it('deve listar todas as disciplinas ordenadas por nome', async () => {
    await service.criarDisciplina({
      nome: 'Química Geral',
      corIdentificacao: '#8b5cf6',
      limiteMaximoFaltas: 10,
      criterioAprovacao: 'ARITMETICA',
    });
    await service.criarDisciplina({
      nome: 'Álgebra Linear',
      corIdentificacao: '#3b82f6',
      limiteMaximoFaltas: 8,
      criterioAprovacao: 'ARITMETICA',
    });

    const lista = await service.listarTodas();

    expect(lista).toHaveLength(2);
    expect(lista[0].nome).toBe('Álgebra Linear');
    expect(lista[1].nome).toBe('Química Geral');
  });

  it('deve excluir uma disciplina com sucesso', async () => {
    const criada = await service.criarDisciplina({
      nome: 'Sistemas Operacionais',
      corIdentificacao: '#f97316',
      limiteMaximoFaltas: 8,
      criterioAprovacao: 'ARITMETICA',
    });

    const excluiu = await service.excluirDisciplina(criada.id);
    expect(excluiu).toBe(true);

    const lista = await service.listarTodas();
    expect(lista).toHaveLength(0);
  });
});
