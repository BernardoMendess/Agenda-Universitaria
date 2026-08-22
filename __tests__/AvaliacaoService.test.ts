import { AvaliacaoService } from '../src/servicos/AvaliacaoService';
import { AvaliacaoRepositorioEmMemoria } from '../src/servicos/banco/AvaliacaoRepositorio';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { CriarAvaliacaoDTO } from '../src/modelos/Avaliacao';

const criarServico = () => {
  const avaliacaoRepo = new AvaliacaoRepositorioEmMemoria();
  const disciplinaRepo = new DisciplinaRepositorioEmMemoria();
  const servico = new AvaliacaoService(avaliacaoRepo, disciplinaRepo);
  return { servico, avaliacaoRepo, disciplinaRepo };
};

const criarDisciplinaBase = async (
  disciplinaRepo: DisciplinaRepositorioEmMemoria,
  override: Partial<any> = {}
) => {
  return disciplinaRepo.criar({
    nome: 'Engenharia de Software',
    corIdentificacao: '#6366f1',
    limiteMaximoFaltas: 10,
    criterioAprovacao: 'ARITMETICA',
    notaMinimaAprovacao: 6.0,
    ...override,
  });
};

const criarAvaliacaoBase = (disciplinaId: string, override: Partial<CriarAvaliacaoDTO> = {}): CriarAvaliacaoDTO => ({
  disciplinaId,
  titulo: 'Prova 1',
  tipo: 'PROVA',
  data: '2026-10-15',
  peso: 1,
  notaMaxima: 10,
  ...override,
});

describe('AvaliacaoService — Validações de Cadastro', () => {
  it('deve lançar erro se disciplina não existir', async () => {
    const { servico } = criarServico();
    await expect(
      servico.criarAvaliacao(criarAvaliacaoBase('id-inexistente'))
    ).rejects.toThrow('não encontrada');
  });

  it('deve lançar erro se título tiver menos de 2 caracteres', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    await expect(
      servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P' }))
    ).rejects.toThrow('mínimo 2 caracteres');
  });

  it('deve lançar erro com data em formato inválido', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    await expect(
      servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { data: '15/10/2026' }))
    ).rejects.toThrow('formato inválido');
  });

  it('deve lançar erro com horário em formato inválido', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    await expect(
      servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { horario: '8h30' }))
    ).rejects.toThrow('formato inválido');
  });

  it('deve lançar erro com peso menor ou igual a zero se informado', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    await expect(
      servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { peso: -1 }))
    ).rejects.toThrow('peso');

    await expect(
      servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { peso: 0 }))
    ).rejects.toThrow('peso');
  });

  it('deve lançar erro com nota máxima zero ou negativa', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    await expect(
      servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { notaMaxima: 0 }))
    ).rejects.toThrow('nota máxima');
  });

  it('deve criar avaliação com dados válidos e peso opcional (padrão 1)', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);
    const avaliacao = await servico.criarAvaliacao({
      disciplinaId: disciplina.id,
      titulo: 'Prova 1',
      tipo: 'PROVA',
      data: '2026-10-15',
    });

    expect(avaliacao.id).toBeDefined();
    expect(avaliacao.titulo).toBe('Prova 1');
    expect(avaliacao.peso).toBe(1);
    expect(avaliacao.notaMaxima).toBe(10);
    expect(avaliacao.nota).toBeNull();
  });
});

describe('AvaliacaoService — Lançamento de Nota', () => {
  it('deve lançar erro se nota for superior à nota máxima', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);
    const avaliacao = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { notaMaxima: 10 }));

    await expect(servico.lancarNota(avaliacao.id, 11)).rejects.toThrow('entre 0 e 10');
  });

  it('deve lançar erro se nota for negativa', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);
    const avaliacao = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id));

    await expect(servico.lancarNota(avaliacao.id, -1)).rejects.toThrow('entre 0 e');
  });

  it('deve lançar nota com sucesso e retornar resumo atualizado', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);
    const avaliacao = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id));
    const { avaliacao: atualizada, resumo } = await servico.lancarNota(avaliacao.id, 8.5);

    expect(atualizada.nota).toBe(8.5);
    expect(resumo.mediaAtual).toBe(8.5);
    expect(resumo.avaliacoesLancadas).toBe(1);
  });

  it('deve remover nota ao passar null', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);
    const avaliacao = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id));
    await servico.lancarNota(avaliacao.id, 7.0);
    const { avaliacao: semNota } = await servico.removerNota(avaliacao.id);

    expect(semNota.nota).toBeNull();
  });
});

describe('AvaliacaoService — Cálculo de Média Aritmética', () => {
  it('deve retornar mediaAtual null quando nenhuma nota foi lançada', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id));
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'Prova 2' }));

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.mediaAtual).toBeNull();
    expect(resumo.totalAvaliacoes).toBe(2);
    expect(resumo.avaliacoesLancadas).toBe(0);
    expect(resumo.avaliacoesPendentes).toBe(2);
  });

  it('deve calcular média aritmética corretamente com 2 notas de 3', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P3' }));

    await servico.lancarNota(a1.id, 8.0);
    await servico.lancarNota(a2.id, 6.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.mediaAtual).toBe(7.0);
    expect(resumo.avaliacoesLancadas).toBe(2);
    expect(resumo.avaliacoesPendentes).toBe(1);
  });

  it('deve calcular corretamente a média aritmética quando todas as avaliações têm nota', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));
    const a3 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P3' }));

    await servico.lancarNota(a1.id, 9.0);
    await servico.lancarNota(a2.id, 7.0);
    await servico.lancarNota(a3.id, 5.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.mediaAtual).toBe(7.0);
    expect(resumo.statusAprovacao).toBe('APROVADO');
  });
});

describe('AvaliacaoService — Cálculo de Média Ponderada', () => {
  it('deve calcular média ponderada corretamente com pesos inteiros', async () => {
    const { servico, disciplinaRepo } = criarServico();
    // Prova1 (peso 2, nota 8.0) e Trabalho1 (peso 1, nota 5.0) → (16 + 5) / 3 = 7.0
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { criterioAprovacao: 'PONDERADA' });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'Prova 1', peso: 2 }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'Trabalho 1', peso: 1 }));

    await servico.lancarNota(a1.id, 8.0);
    await servico.lancarNota(a2.id, 5.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.mediaAtual).toBe(7.0);
  });

  it('deve calcular média ponderada com pesos decimais (ex: 0.4 e 0.6)', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { criterioAprovacao: 'PONDERADA' });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1', peso: 0.4 }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2', peso: 0.6 }));

    await servico.lancarNota(a1.id, 7.0);
    await servico.lancarNota(a2.id, 8.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    // (7 * 0.4 + 8 * 0.6) / 1.0 = (2.8 + 4.8) / 1.0 = 7.6
    expect(resumo.mediaAtual).toBe(7.6);
  });

  it('deve normalizar notas com notaMaxima diferente de 10', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { criterioAprovacao: 'PONDERADA' });

    // Trabalho vale 2 pontos (tirou 2.0 = 100% = 10.0 escala 10) peso 2
    // Prova vale 8 pontos (tirou 6.0 = 75% = 7.5 escala 10) peso 8
    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'Trab', notaMaxima: 2, peso: 2 }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'Prova', notaMaxima: 8, peso: 8 }));

    await servico.lancarNota(a1.id, 2.0);
    await servico.lancarNota(a2.id, 6.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    // (10.0 * 2 + 7.5 * 8) / 10 = (20 + 60) / 10 = 8.0
    expect(resumo.mediaAtual).toBe(8.0);
  });
});

describe('AvaliacaoService — Projeção de Nota Necessária (Aritmética)', () => {
  it('deve calcular projeção corretamente: 3 provas, meta 6.0, 2 lançadas com 5.0 e 6.0', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { notaMinimaAprovacao: 6.0 });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P3' }));

    await servico.lancarNota(a1.id, 5.0);
    await servico.lancarNota(a2.id, 6.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.projecaoNotaNecessaria).toBe(7.0);
    expect(resumo.statusAprovacao).toBe('EM_CURSO');
  });

  it('deve indicar aprovação garantida quando nota necessária ≤ 0', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { notaMinimaAprovacao: 6.0 });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P3' }));

    await servico.lancarNota(a1.id, 10.0);
    await servico.lancarNota(a2.id, 9.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.statusAprovacao).toBe('APROVADO');
    expect(resumo.projecaoNotaNecessaria).toBe(0);
  });

  it('deve indicar situação crítica quando nota necessária excede 10.0', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { notaMinimaAprovacao: 6.0 });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P3' }));

    await servico.lancarNota(a1.id, 0.0);
    await servico.lancarNota(a2.id, 0.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    // Projeção = (3 * 6.0 - 0.0 - 0.0) / 1 = 18.0 > 10.0
    expect(resumo.statusAprovacao).toBe('REPROVADO_POR_NOTA');
  });
});

describe('AvaliacaoService — Projeção de Nota Necessária (Ponderada)', () => {
  it('deve calcular projeção ponderada corretamente', async () => {
    // Prova1 (peso 4, nota 4.0), Prova2 (peso 6, pendente), meta 6.0
    // Total de pesos: 4 + 6 = 10
    // Pontos necessários = 6.0 * 10 = 60
    // Pontos obtidos = 4 * 4.0 = 16
    // Pontos pendentes = 44, peso pendente = 6
    // Nota necessária = 44 / 6 ≈ 7.33
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, {
      criterioAprovacao: 'PONDERADA',
      notaMinimaAprovacao: 6.0,
    });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1', peso: 4 }));
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2', peso: 6 }));

    await servico.lancarNota(a1.id, 4.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.projecaoNotaNecessaria).toBeCloseTo(7.33, 2);
  });
});

describe('AvaliacaoService — Exclusão em Cascata via DisciplinaService', () => {
  it('todas as avaliações são excluídas ao remover a disciplina', async () => {
    const { servico, avaliacaoRepo, disciplinaRepo } = criarServico();

    const { DisciplinaService } = require('../src/servicos/DisciplinaService');
    const { HorarioAulaRepositorioEmMemoria } = require('../src/servicos/banco/HorarioAulaRepositorio');
    const { FaltaRepositorioEmMemoria } = require('../src/servicos/banco/FaltaRepositorio');

    const horarioRepo = new HorarioAulaRepositorioEmMemoria();
    const faltaRepo = new FaltaRepositorioEmMemoria();
    const disciplinaService = new DisciplinaService(disciplinaRepo, horarioRepo, faltaRepo, avaliacaoRepo);

    const disciplina = await criarDisciplinaBase(disciplinaRepo);
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));

    const antes = await avaliacaoRepo.listarPorDisciplina(disciplina.id);
    expect(antes).toHaveLength(2);

    await disciplinaService.excluirDisciplina(disciplina.id);

    const depois = await avaliacaoRepo.listarPorDisciplina(disciplina.id);
    expect(depois).toHaveLength(0);
  });

  it('deve listar todas as avaliações de todas as disciplinas via listarTodas() e listarPorDisciplina() sem id', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const d1 = await criarDisciplinaBase(disciplinaRepo, { nome: 'D1' });
    const d2 = await criarDisciplinaBase(disciplinaRepo, { nome: 'D2' });

    await servico.criarAvaliacao(criarAvaliacaoBase(d1.id, { titulo: 'P1 - D1' }));
    await servico.criarAvaliacao(criarAvaliacaoBase(d2.id, { titulo: 'P1 - D2' }));

    const todas = await servico.listarTodas();
    expect(todas).toHaveLength(2);

    const todasSemParam = await servico.listarPorDisciplina();
    expect(todasSemParam).toHaveLength(2);

    const apenasD1 = await servico.listarPorDisciplina(d1.id);
    expect(apenasD1).toHaveLength(1);
    expect(apenasD1[0].titulo).toBe('P1 - D1');
  });
});

describe('AvaliacaoService — Status de Aprovação Final', () => {
  it('deve retornar REPROVADO_POR_NOTA quando todas as notas estão abaixo da meta', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { notaMinimaAprovacao: 7.0 });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));

    await servico.lancarNota(a1.id, 4.0);
    await servico.lancarNota(a2.id, 5.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.statusAprovacao).toBe('REPROVADO_POR_NOTA');
    expect(resumo.avaliacoesPendentes).toBe(0);
  });

  it('deve retornar APROVADO quando todas as notas são suficientes', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo, { notaMinimaAprovacao: 6.0 });

    const a1 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P1' }));
    const a2 = await servico.criarAvaliacao(criarAvaliacaoBase(disciplina.id, { titulo: 'P2' }));

    await servico.lancarNota(a1.id, 7.0);
    await servico.lancarNota(a2.id, 8.0);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.statusAprovacao).toBe('APROVADO');
    expect(resumo.mediaAtual).toBe(7.5);
  });

  it('deve retornar EM_CURSO quando não há avaliações cadastradas', async () => {
    const { servico, disciplinaRepo } = criarServico();
    const disciplina = await criarDisciplinaBase(disciplinaRepo);

    const resumo = await servico.calcularDesempenho(disciplina.id);
    expect(resumo.statusAprovacao).toBe('EM_CURSO');
    expect(resumo.mediaAtual).toBeNull();
    expect(resumo.totalAvaliacoes).toBe(0);
  });
});
