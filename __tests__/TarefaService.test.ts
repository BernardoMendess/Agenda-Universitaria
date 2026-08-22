import { TarefaService } from '../src/servicos/TarefaService';
import { TarefaRepositorioEmMemoria } from '../src/servicos/banco/TarefaRepositorio';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { DisciplinaService } from '../src/servicos/DisciplinaService';
import { HorarioAulaRepositorioEmMemoria } from '../src/servicos/banco/HorarioAulaRepositorio';
import { FaltaRepositorioEmMemoria } from '../src/servicos/banco/FaltaRepositorio';
import { AvaliacaoRepositorioEmMemoria } from '../src/servicos/banco/AvaliacaoRepositorio';

describe('TarefaService', () => {
  let repoTarefa: TarefaRepositorioEmMemoria;
  let repoDisciplina: DisciplinaRepositorioEmMemoria;
  let tarefaService: TarefaService;

  beforeEach(() => {
    repoTarefa = new TarefaRepositorioEmMemoria();
    repoDisciplina = new DisciplinaRepositorioEmMemoria();
    tarefaService = new TarefaService(repoTarefa, repoDisciplina);
  });

  describe('Criação de Tarefas', () => {
    it('deve criar uma tarefa avulsa com sucesso (sem disciplina)', async () => {
      const tarefa = await tarefaService.criarTarefa({
        titulo: 'Comprar caderno universitário',
        descricao: 'Caderno de 10 matérias',
        prioridade: 'ALTA',
        dataLimite: '2026-09-15',
        horarioLimite: '14:30',
      });

      expect(tarefa.id).toBeDefined();
      expect(tarefa.titulo).toBe('Comprar caderno universitário');
      expect(tarefa.descricao).toBe('Caderno de 10 matérias');
      expect(tarefa.disciplinaId).toBeUndefined();
      expect(tarefa.prioridade).toBe('ALTA');
      expect(tarefa.concluida).toBe(false);
      expect(tarefa.dataLimite).toBe('2026-09-15');
      expect(tarefa.horarioLimite).toBe('14:30');
      expect(tarefa.dataCriacao).toBeDefined();
      expect(tarefa.dataAtualizacao).toBeDefined();
    });

    it('deve criar uma tarefa vinculada a uma disciplina com sucesso', async () => {
      const disc = await repoDisciplina.criar({
        nome: 'Cálculo I',
        limiteMaximoFaltas: 10,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#3b82f6',
      });

      const tarefa = await tarefaService.criarTarefa({
        disciplinaId: disc.id,
        titulo: 'Lista de Exercícios de Limites',
        prioridade: 'MEDIA',
      });

      expect(tarefa.id).toBeDefined();
      expect(tarefa.disciplinaId).toBe(disc.id);
      expect(tarefa.titulo).toBe('Lista de Exercícios de Limites');
      expect(tarefa.prioridade).toBe('MEDIA');
      expect(tarefa.concluida).toBe(false);
    });

    it('deve definir prioridade MEDIA por padrão quando não informada', async () => {
      const tarefa = await tarefaService.criarTarefa({
        titulo: 'Ler capítulo 2',
      });

      expect(tarefa.prioridade).toBe('MEDIA');
    });

    it('deve rejeitar título vazio ou com menos de 2 caracteres', async () => {
      await expect(
        tarefaService.criarTarefa({ titulo: '' })
      ).rejects.toThrow('O título da tarefa é obrigatório.');

      await expect(
        tarefaService.criarTarefa({ titulo: 'a' })
      ).rejects.toThrow('O título da tarefa deve ter pelo menos 2 caracteres.');
    });

    it('deve rejeitar título que excede 150 caracteres', async () => {
      const tituloLongo = 'A'.repeat(151);
      await expect(
        tarefaService.criarTarefa({ titulo: tituloLongo })
      ).rejects.toThrow('O título da tarefa não pode exceder 150 caracteres.');
    });

    it('deve rejeitar vínculo a uma disciplina inexistente', async () => {
      await expect(
        tarefaService.criarTarefa({
          disciplinaId: 'disc_inexistente_123',
          titulo: 'Tarefa inválida',
        })
      ).rejects.toThrow('Disciplina vinculada não encontrada (ID: disc_inexistente_123).');
    });

    it('deve rejeitar formato de dataLimite inválido', async () => {
      await expect(
        tarefaService.criarTarefa({
          titulo: 'Estudar para prova',
          dataLimite: '15/09/2026',
        })
      ).rejects.toThrow('A data limite deve estar no formato AAAA-MM-DD.');
    });

    it('deve rejeitar formato de horarioLimite inválido', async () => {
      await expect(
        tarefaService.criarTarefa({
          titulo: 'Enviar trabalho',
          dataLimite: '2026-09-15',
          horarioLimite: '25:00',
        })
      ).rejects.toThrow('O horário limite deve estar no formato HH:mm (24 horas).');

      await expect(
        tarefaService.criarTarefa({
          titulo: 'Enviar trabalho',
          dataLimite: '2026-09-15',
          horarioLimite: '12:65',
        })
      ).rejects.toThrow('O horário limite deve estar no formato HH:mm (24 horas).');
    });
  });

  describe('Atualização de Tarefas', () => {
    it('deve atualizar os dados de uma tarefa com sucesso', async () => {
      const tarefa = await tarefaService.criarTarefa({
        titulo: 'Revisar slides',
        prioridade: 'BAIXA',
      });

      const atualizada = await tarefaService.atualizarTarefa(tarefa.id, {
        titulo: 'Revisar todos os slides de Álgebra',
        descricao: 'Focar na aula 4',
        prioridade: 'ALTA',
        dataLimite: '2026-08-30',
        horarioLimite: '18:00',
      });

      expect(atualizada.titulo).toBe('Revisar todos os slides de Álgebra');
      expect(atualizada.descricao).toBe('Focar na aula 4');
      expect(atualizada.prioridade).toBe('ALTA');
      expect(atualizada.dataLimite).toBe('2026-08-30');
      expect(atualizada.horarioLimite).toBe('18:00');
    });

    it('deve permitir alterar a disciplina vinculada ou desvincular', async () => {
      const disc1 = await repoDisciplina.criar({
        nome: 'Física I',
        limiteMaximoFaltas: 8,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#3b82f6',
      });
      const disc2 = await repoDisciplina.criar({
        nome: 'Química',
        limiteMaximoFaltas: 8,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#10b981',
      });

      const tarefa = await tarefaService.criarTarefa({
        disciplinaId: disc1.id,
        titulo: 'Laboratório',
      });
      expect(tarefa.disciplinaId).toBe(disc1.id);

      // Altera para disciplina 2
      const atualizadaDisc2 = await tarefaService.atualizarTarefa(tarefa.id, {
        disciplinaId: disc2.id,
      });
      expect(atualizadaDisc2.disciplinaId).toBe(disc2.id);

      // Desvincula (torna avulsa)
      const avulsa = await tarefaService.atualizarTarefa(tarefa.id, {
        disciplinaId: null,
      });
      expect(avulsa.disciplinaId).toBeUndefined();
    });

    it('deve falhar ao tentar atualizar tarefa inexistente', async () => {
      await expect(
        tarefaService.atualizarTarefa('id_fantasma', { titulo: 'Novo título' })
      ).rejects.toThrow('Tarefa com ID id_fantasma não encontrada.');
    });
  });

  describe('Conclusão de Tarefas (Checkbox e Alternância)', () => {
    it('deve alternar status de conclusão com alternarStatusConclusao', async () => {
      const tarefa = await tarefaService.criarTarefa({
        titulo: 'Fazer resumo',
      });
      expect(tarefa.concluida).toBe(false);
      expect(tarefa.dataConclusao).toBeUndefined();

      // 1ª Alternância -> Concluída
      const concluida = await tarefaService.alternarStatusConclusao(tarefa.id);
      expect(concluida.concluida).toBe(true);
      expect(concluida.dataConclusao).toBeDefined();

      // 2ª Alternância -> Pendente novamente
      const pendente = await tarefaService.alternarStatusConclusao(tarefa.id);
      expect(pendente.concluida).toBe(false);
      expect(pendente.dataConclusao).toBeUndefined();
    });

    it('deve marcar explicitamente como concluída e como pendente', async () => {
      const tarefa = await tarefaService.criarTarefa({
        titulo: 'Instalar bibliotecas',
      });

      const c = await tarefaService.marcarComoConcluida(tarefa.id);
      expect(c.concluida).toBe(true);

      const p = await tarefaService.marcarComoPendente(tarefa.id);
      expect(p.concluida).toBe(false);
    });
  });

  describe('Status de Prazo e Cálculo de Dias', () => {
    it('deve retornar SEM_PRAZO para tarefa sem data limite', () => {
      const status = tarefaService.calcularStatusPrazo();
      expect(status).toBe('SEM_PRAZO');
    });

    it('deve retornar EM_DIA para tarefa já concluída mesmo se atrasada', () => {
      const status = tarefaService.calcularStatusPrazo('2020-01-01', '10:00', true);
      expect(status).toBe('EM_DIA');
    });

    it('deve identificar tarefa atrasada', () => {
      const status = tarefaService.calcularStatusPrazo('2020-01-01', '10:00', false);
      expect(status).toBe('ATRASADA');
    });

    it('deve calcular status HOJE, AMANHA e EM_DIA para datas futuras', () => {
      const hoje = new Date();
      const anoHoje = hoje.getFullYear();
      const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
      const diaHoje = String(hoje.getDate()).padStart(2, '0');
      const strHoje = `${anoHoje}-${mesHoje}-${diaHoje}`;

      const statusHoje = tarefaService.calcularStatusPrazo(strHoje, '23:59', false);
      expect(statusHoje).toBe('HOJE');

      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      const strAmanha = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

      const statusAmanha = tarefaService.calcularStatusPrazo(strAmanha, '23:59', false);
      expect(statusAmanha).toBe('AMANHA');

      const futuro = new Date(hoje);
      futuro.setDate(hoje.getDate() + 10);
      const strFuturo = `${futuro.getFullYear()}-${String(futuro.getMonth() + 1).padStart(2, '0')}-${String(futuro.getDate()).padStart(2, '0')}`;

      const statusFuturo = tarefaService.calcularStatusPrazo(strFuturo, '23:59', false);
      expect(statusFuturo).toBe('EM_DIA');
    });

    it('deve calcular a quantidade de dias restantes corretamente', () => {
      expect(tarefaService.calcularDiasRestantes(undefined)).toBeUndefined();

      const hoje = new Date();
      const strHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
      expect(tarefaService.calcularDiasRestantes(strHoje)).toBe(0);
    });
  });

  describe('Listagem e Filtros', () => {
    let disc: any;

    beforeEach(async () => {
      disc = await repoDisciplina.criar({
        nome: 'Algoritmos',
        limiteMaximoFaltas: 5,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#10b981',
      });

      await tarefaService.criarTarefa({
        disciplinaId: disc.id,
        titulo: 'Trabalho de Grafos',
        dataLimite: '2020-01-01', // Atrasada
      });

      await tarefaService.criarTarefa({
        disciplinaId: disc.id,
        titulo: 'Exemplo Concluído',
        dataLimite: '2026-12-01',
      });
      const t = (await repoTarefa.listarTodas())[1];
      await tarefaService.marcarComoConcluida(t.id);

      await tarefaService.criarTarefa({
        titulo: 'Tarefa Avulsa Geral',
        dataLimite: '2026-12-31',
      });
    });

    it('deve enriquecer tarefas com o nome e cor da disciplina', async () => {
      const lista = await tarefaService.listarComFiltros();
      expect(lista.length).toBe(3);

      const tarefaDisc = lista.find((t) => t.titulo === 'Trabalho de Grafos');
      expect(tarefaDisc?.disciplinaNome).toBe('Algoritmos');
      expect(tarefaDisc?.disciplinaCor).toBe('#10b981');
      expect(tarefaDisc?.statusPrazo).toBe('ATRASADA');

      const tarefaAvulsa = lista.find((t) => t.titulo === 'Tarefa Avulsa Geral');
      expect(tarefaAvulsa?.disciplinaNome).toBeUndefined();
      expect(tarefaAvulsa?.disciplinaCor).toBeUndefined();
    });

    it('deve filtrar apenas por disciplina', async () => {
      const lista = await tarefaService.listarComFiltros({ disciplinaId: disc.id });
      expect(lista.length).toBe(2);
      expect(lista.every((t) => t.disciplinaId === disc.id)).toBe(true);
    });

    it('deve filtrar apenas tarefas PENDENTES', async () => {
      const lista = await tarefaService.listarComFiltros({ status: 'PENDENTES' });
      expect(lista.length).toBe(2);
      expect(lista.every((t) => !t.concluida)).toBe(true);
    });

    it('deve filtrar apenas tarefas CONCLUIDAS', async () => {
      const lista = await tarefaService.listarComFiltros({ status: 'CONCLUIDAS' });
      expect(lista.length).toBe(1);
      expect(lista[0].titulo).toBe('Exemplo Concluído');
    });

    it('deve filtrar apenas tarefas ATRASADAS', async () => {
      const lista = await tarefaService.listarComFiltros({ atrasadas: true });
      expect(lista.length).toBe(1);
      expect(lista[0].titulo).toBe('Trabalho de Grafos');
    });
  });

  describe('Tarefas Pendentes Próximas e Estatísticas', () => {
    it('deve retornar tarefas pendentes ordenadas por urgência respeitando limite', async () => {
      await tarefaService.criarTarefa({ titulo: 'Sem data' });
      await tarefaService.criarTarefa({ titulo: 'Atrasada', dataLimite: '2020-01-01' });
      await tarefaService.criarTarefa({ titulo: 'Futura', dataLimite: '2026-11-20' });

      const proximas = await tarefaService.obterTarefasPendentesProximas(2);
      expect(proximas.length).toBe(2);
      expect(proximas[0].titulo).toBe('Atrasada');
      expect(proximas[1].titulo).toBe('Futura');
    });

    it('deve calcular estatísticas de tarefas com precisão', async () => {
      const disc = await repoDisciplina.criar({
        nome: 'Banco de Dados',
        limiteMaximoFaltas: 8,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#6366f1',
      });

      // 1 atrasada
      await tarefaService.criarTarefa({
        disciplinaId: disc.id,
        titulo: 'T1',
        dataLimite: '2020-01-01',
      });
      // 1 concluída
      const t2 = await tarefaService.criarTarefa({
        disciplinaId: disc.id,
        titulo: 'T2',
      });
      await tarefaService.marcarComoConcluida(t2.id);
      // 1 avulsa pendente
      await tarefaService.criarTarefa({
        titulo: 'T3 Avulsa',
      });

      const statsGerais = await tarefaService.obterEstatisticas();
      expect(statsGerais.total).toBe(3);
      expect(statsGerais.concluidas).toBe(1);
      expect(statsGerais.pendentes).toBe(2);
      expect(statsGerais.atrasadas).toBe(1);
      expect(statsGerais.percentualConclusao).toBe(33); // 1/3 = 33%

      const statsDisc = await tarefaService.obterEstatisticas(disc.id);
      expect(statsDisc.total).toBe(2);
      expect(statsDisc.concluidas).toBe(1);
      expect(statsDisc.pendentes).toBe(1);
      expect(statsDisc.percentualConclusao).toBe(50); // 1/2 = 50%
    });
  });

  describe('Exclusão de Tarefas e Limpeza em Cascata', () => {
    it('deve excluir uma tarefa individual com sucesso', async () => {
      const t = await tarefaService.criarTarefa({ titulo: 'Para deletar' });
      const excluido = await tarefaService.excluirTarefa(t.id);
      expect(excluido).toBe(true);

      const busca = await tarefaService.buscarPorId(t.id);
      expect(busca).toBeNull();
    });

    it('deve excluir apenas as tarefas da disciplina informada', async () => {
      const d1 = await repoDisciplina.criar({ nome: 'D1', limiteMaximoFaltas: 4, criterioAprovacao: 'ARITMETICA', corIdentificacao: '#6366f1' });
      const d2 = await repoDisciplina.criar({ nome: 'D2', limiteMaximoFaltas: 4, criterioAprovacao: 'ARITMETICA', corIdentificacao: '#3b82f6' });

      await tarefaService.criarTarefa({ disciplinaId: d1.id, titulo: 'T D1' });
      await tarefaService.criarTarefa({ disciplinaId: d2.id, titulo: 'T D2' });
      await tarefaService.criarTarefa({ titulo: 'T Avulsa' });

      const removidas = await tarefaService.excluirTarefasPorDisciplina(d1.id);
      expect(removidas).toBe(1);

      const restantes = await repoTarefa.listarTodas();
      expect(restantes.length).toBe(2);
      expect(restantes.find((r) => r.titulo === 'T D1')).toBeUndefined();
      expect(restantes.find((r) => r.titulo === 'T D2')).toBeDefined();
      expect(restantes.find((r) => r.titulo === 'T Avulsa')).toBeDefined();
    });

    it('deve excluir tarefas em cascata quando DisciplinaService exclui a disciplina', async () => {
      const repoHorario = new HorarioAulaRepositorioEmMemoria();
      const repoFalta = new FaltaRepositorioEmMemoria();
      const repoAvaliacao = new AvaliacaoRepositorioEmMemoria();

      const discService = new DisciplinaService(
        repoDisciplina,
        repoHorario,
        repoFalta,
        repoAvaliacao,
        repoTarefa
      );

      const d = await discService.criarDisciplina({
        nome: 'Sistemas Operacionais',
        limiteMaximoFaltas: 10,
        criterioAprovacao: 'ARITMETICA',
        corIdentificacao: '#6366f1',
      });

      await tarefaService.criarTarefa({
        disciplinaId: d.id,
        titulo: 'Estudo de Threads e Processos',
      });
      await tarefaService.criarTarefa({
        disciplinaId: d.id,
        titulo: 'Trabalho de Semaforos',
      });
      await tarefaService.criarTarefa({
        titulo: 'Tarefa Avulsa não afetada',
      });

      // Exclui a matéria
      await discService.excluirDisciplina(d.id);

      const tarefasApos = await repoTarefa.listarTodas();
      expect(tarefasApos.length).toBe(1);
      expect(tarefasApos[0].titulo).toBe('Tarefa Avulsa não afetada');
    });
  });
});
