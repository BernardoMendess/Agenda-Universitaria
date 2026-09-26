import { BackupService, VERSAO_SCHEMA_ATUAL } from '../src/servicos/BackupService';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { HorarioAulaRepositorioEmMemoria } from '../src/servicos/banco/HorarioAulaRepositorio';
import { FaltaRepositorioEmMemoria } from '../src/servicos/banco/FaltaRepositorio';
import { AvaliacaoRepositorioEmMemoria } from '../src/servicos/banco/AvaliacaoRepositorio';
import { TarefaRepositorioEmMemoria } from '../src/servicos/banco/TarefaRepositorio';
import { EventoAcademicoRepositorioEmMemoria } from '../src/servicos/banco/EventoAcademicoRepositorio';
import { ConfiguracaoNotificacaoRepositorioEmMemoria } from '../src/servicos/banco/ConfiguracaoNotificacaoRepositorio';
import { NotificacaoService } from '../src/servicos/NotificacaoService';
import { NotificacaoAgendadaRepositorioEmMemoria } from '../src/servicos/banco/NotificacaoAgendadaRepositorio';
import { INotificadorLocal } from '../src/servicos/notificacoes/NotificadorLocalDriver';
import { Disciplina } from '../src/modelos/Disciplina';
import { HorarioAula } from '../src/modelos/HorarioAula';
import { Falta } from '../src/modelos/Falta';
import { Avaliacao } from '../src/modelos/Avaliacao';
import { Tarefa } from '../src/modelos/Tarefa';
import { EventoAcademico } from '../src/modelos/EventoAcademico';

describe('BackupService (RF11 — Exportação/Importação Manual de Dados & Portabilidade Offline)', () => {
  let service: BackupService;
  let discRepo: DisciplinaRepositorioEmMemoria;
  let horarioRepo: HorarioAulaRepositorioEmMemoria;
  let faltaRepo: FaltaRepositorioEmMemoria;
  let avaliacaoRepo: AvaliacaoRepositorioEmMemoria;
  let tarefaRepo: TarefaRepositorioEmMemoria;
  let eventoRepo: EventoAcademicoRepositorioEmMemoria;
  let configRepo: ConfiguracaoNotificacaoRepositorioEmMemoria;
  let notifRepo: NotificacaoAgendadaRepositorioEmMemoria;
  let notifService: NotificacaoService;
  let notificadorMock: jest.Mocked<INotificadorLocal>;

  const popularMassaDeDados = async () => {
    const disc1 = await discRepo.criar({
      nome: 'Estruturas de Dados',
      codigo: 'CC002',
      nomeProfessor: 'Dra. Ada Lovelace',
      corIdentificacao: '#6366f1',
      limiteMaximoFaltas: 8,
      criterioAprovacao: 'ARITMETICA',
      notaMinimaAprovacao: 6.0,
      localSala: 'Lab 01',
    });

    const disc2 = await discRepo.criar({
      nome: 'Cálculo Numérico',
      codigo: 'MAT003',
      corIdentificacao: '#10b981',
      limiteMaximoFaltas: 0, // Disciplina com limite 0
      criterioAprovacao: 'PONDERADA',
    });

    const hor1 = await horarioRepo.criar({
      disciplinaId: disc1.id,
      diaSemana: 'SEGUNDA',
      horarioInicio: '08:00',
      horarioFim: '10:00',
      localSala: 'Lab 01',
    });

    const hor2 = await horarioRepo.criar({
      disciplinaId: disc2.id,
      diaSemana: 'TERCA',
      horarioInicio: '10:00',
      horarioFim: '12:00',
    });

    const falta1 = await faltaRepo.adicionar({
      disciplinaId: disc1.id,
      data: '2026-08-20',
      horario: '08:15',
      justificativa: 'Consulta médica',
    });

    const aval1 = await avaliacaoRepo.criar({
      disciplinaId: disc1.id,
      titulo: 'Prova 1 - Árvores Binárias',
      tipo: 'PROVA',
      data: '2026-09-15',
      horario: '08:00',
      peso: 2,
      notaMaxima: 10,
    });

    const tar1 = await tarefaRepo.criar({
      disciplinaId: disc1.id,
      titulo: 'Lista de Exercícios 1',
      dataLimite: '2026-09-10',
      horarioLimite: '23:59',
      prioridade: 'ALTA',
    });

    const tar2 = await tarefaRepo.criar({
      titulo: 'Comprar caderno universitário',
      prioridade: 'BAIXA',
    });

    const eve1 = await eventoRepo.criar({
      titulo: 'Semana da Computação',
      data: '2026-10-05',
      horarioInicio: '09:00',
      horarioFim: '18:00',
      local: 'Auditório Central',
    });

    return { disc1, disc2, hor1, hor2, falta1, aval1, tar1, tar2, eve1 };
  };

  beforeEach(() => {
    discRepo = new DisciplinaRepositorioEmMemoria();
    horarioRepo = new HorarioAulaRepositorioEmMemoria();
    faltaRepo = new FaltaRepositorioEmMemoria();
    avaliacaoRepo = new AvaliacaoRepositorioEmMemoria();
    tarefaRepo = new TarefaRepositorioEmMemoria();
    eventoRepo = new EventoAcademicoRepositorioEmMemoria();
    configRepo = new ConfiguracaoNotificacaoRepositorioEmMemoria();
    notifRepo = new NotificacaoAgendadaRepositorioEmMemoria();

    notificadorMock = {
      agendar: jest.fn().mockImplementation(async (n) => n.id),
      cancelar: jest.fn().mockResolvedValue(true),
      cancelarTodos: jest.fn().mockResolvedValue(undefined),
      dispararImediato: jest.fn().mockResolvedValue(undefined),
      emitirAlertaCritico: jest.fn().mockResolvedValue(undefined),
      emitirFeedbackTátil: jest.fn(),
      verificarPermissao: jest.fn().mockResolvedValue(true),
      solicitarPermissao: jest.fn().mockResolvedValue(true),
      inicializar: jest.fn().mockResolvedValue(undefined),
      listarAgendamentosNativos: jest.fn().mockResolvedValue({ total: 0, ids: [] }),
    };

    notifService = new NotificacaoService(configRepo, notifRepo, notificadorMock);

    service = new BackupService(
      discRepo,
      horarioRepo,
      faltaRepo,
      avaliacaoRepo,
      tarefaRepo,
      eventoRepo,
      configRepo,
      notifService
    );
  });

  describe('Resumo Quantitativo de Dados', () => {
    it('deve retornar resumo zerado quando a base estiver vazia', async () => {
      const resumo = await service.obterResumoDadosAtuais();

      expect(resumo).toEqual({
        totalDisciplinas: 0,
        totalHorarios: 0,
        totalFaltas: 0,
        totalAvaliacoes: 0,
        totalTarefas: 0,
        totalEventos: 0,
      });
    });

    it('deve contabilizar corretamente todos os registros populados', async () => {
      await popularMassaDeDados();
      const resumo = await service.obterResumoDadosAtuais();

      expect(resumo.totalDisciplinas).toBe(2);
      expect(resumo.totalHorarios).toBe(2);
      expect(resumo.totalFaltas).toBe(1);
      expect(resumo.totalAvaliacoes).toBe(1);
      expect(resumo.totalTarefas).toBe(2);
      expect(resumo.totalEventos).toBe(1);
    });
  });

  describe('Exportação de Backup (Geração de JSON)', () => {
    it('deve gerar uma string JSON com estrutura e metadados válidos', async () => {
      await popularMassaDeDados();
      const jsonStr = await service.gerarBackupJson();

      expect(typeof jsonStr).toBe('string');
      const backup = JSON.parse(jsonStr);

      // Metadados
      expect(backup.metadados).toBeDefined();
      expect(backup.metadados.app).toBe('CampusFlow');
      expect(backup.metadados.versaoSchema).toBe(VERSAO_SCHEMA_ATUAL);
      expect(backup.metadados.dataExportacao).toBeDefined();
      expect(backup.metadados.estatisticas).toEqual({
        totalDisciplinas: 2,
        totalHorarios: 2,
        totalFaltas: 1,
        totalAvaliacoes: 1,
        totalTarefas: 2,
        totalEventos: 1,
      });

      // Dados
      expect(backup.dados).toBeDefined();
      expect(backup.dados.disciplinas).toHaveLength(2);
      expect(backup.dados.horariosAula).toHaveLength(2);
      expect(backup.dados.faltas).toHaveLength(1);
      expect(backup.dados.avaliacoes).toHaveLength(1);
      expect(backup.dados.tarefas).toHaveLength(2);
      expect(backup.dados.eventosAcademicos).toHaveLength(1);
      expect(backup.dados.configuracaoNotificacoes).toBeDefined();
    });

    it('deve preservar dados de regras específicas como limite 0 de faltas e justificativas', async () => {
      await popularMassaDeDados();
      const jsonStr = await service.gerarBackupJson();
      const backup = JSON.parse(jsonStr);

      const discLimiteZero = backup.dados.disciplinas.find(
        (d: Disciplina) => d.nome === 'Cálculo Numérico'
      );
      expect(discLimiteZero).toBeDefined();
      expect(discLimiteZero.limiteMaximoFaltas).toBe(0); // Disciplina com limite 0 preservado

      const faltaJustificada = backup.dados.faltas[0];
      expect(faltaJustificada.justificativa).toBe('Consulta médica');
    });
  });


  describe('Validação de Backup JSON', () => {
    it('deve validar com sucesso um backup oficial do CampusFlow', async () => {
      await popularMassaDeDados();
      const jsonStr = await service.gerarBackupJson();

      const resultado = service.validarBackupJson(jsonStr);

      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toHaveLength(0);
      expect(resultado.metadados?.app).toBe('CampusFlow');
      expect(resultado.dados?.disciplinas).toHaveLength(2);
    });

    it('deve rejeitar string vazia ou em branco', () => {
      const resultado = service.validarBackupJson('   ');

      expect(resultado.valido).toBe(false);
      expect(resultado.erros).toContain('O conteúdo do arquivo de backup está vazio.');
    });

    it('deve rejeitar JSON com erro de sintaxe', () => {
      const resultado = service.validarBackupJson('{ "metadados": {');

      expect(resultado.valido).toBe(false);
      expect(resultado.erros[0]).toContain('Formato JSON inválido');
    });

    it('deve rejeitar backup sem assinatura do CampusFlow', () => {
      const jsonInvalido = JSON.stringify({
        metadados: { app: 'OutroApp', versaoSchema: '1.0.0' },
        dados: {
          disciplinas: [],
          horariosAula: [],
          faltas: [],
          avaliacoes: [],
          tarefas: [],
          eventosAcademicos: [],
        },
      });

      const resultado = service.validarBackupJson(jsonInvalido);

      expect(resultado.valido).toBe(false);
      expect(resultado.erros).toContain(
        'O arquivo informado não é um backup oficial do CampusFlow.'
      );
    });

    it('deve rejeitar backup sem arrays obrigatórios na seção de dados', () => {
      const jsonSemArrays = JSON.stringify({
        metadados: { app: 'CampusFlow', versaoSchema: '1.0.0' },
        dados: {
          disciplinas: 'invalido',
        },
      });

      const resultado = service.validarBackupJson(jsonSemArrays);

      expect(resultado.valido).toBe(false);
      expect(resultado.erros).toContain(
        'A lista de disciplinas é obrigatória e deve ser um array.'
      );
    });

    it('deve emitir avisos para chaves estrangeiras de disciplinas inexistentes', () => {
      const jsonComOrfaos = JSON.stringify({
        metadados: { app: 'CampusFlow', versaoSchema: '1.0.0' },
        dados: {
          disciplinas: [
            {
              id: 'disc_1',
              nome: 'Física',
              corIdentificacao: '#6366f1',
              criterioAprovacao: 'ARITMETICA',
              notaMinimaAprovacao: 6,
              dataCriacao: '2026-08-22',
              dataAtualizacao: '2026-08-22',
            },
          ],
          horariosAula: [
            {
              id: 'hor_1',
              disciplinaId: 'disc_INEXISTENTE',
              diaSemana: 'SEGUNDA',
              horarioInicio: '08:00',
              horarioFim: '10:00',
            },
          ],
          faltas: [],
          avaliacoes: [],
          tarefas: [],
          eventosAcademicos: [],
        },
      });

      const resultado = service.validarBackupJson(jsonComOrfaos);

      expect(resultado.valido).toBe(true);
      expect(resultado.avisos.length).toBeGreaterThan(0);
      expect(resultado.avisos[0]).toContain('referencia disciplina inexistente no backup');
    });
  });

  describe('Restauração de Backup (Importação Manual)', () => {
    it('deve restaurar completamente os dados no modo SUBSTITUIR e reprogramar notificações', async () => {
      // 1. Popula e gera o backup
      await popularMassaDeDados();
      const backupJson = await service.gerarBackupJson();

      // 2. Limpa o banco local simulando novo aparelho ou reinício
      discRepo.limpar();
      horarioRepo.limpar();
      faltaRepo.limpar();
      avaliacaoRepo.limpar();
      tarefaRepo.limpar();
      eventoRepo.limpar();

      const resumoVazio = await service.obterResumoDadosAtuais();
      expect(resumoVazio.totalDisciplinas).toBe(0);

      // 3. Restaura o backup
      const resultado = await service.restaurarBackup(backupJson, 'SUBSTITUIR');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.modo).toBe('SUBSTITUIR');
      expect(resultado.estatisticasRestauradas.totalDisciplinas).toBe(2);
      expect(resultado.estatisticasRestauradas.totalHorarios).toBe(2);
      expect(resultado.estatisticasRestauradas.totalFaltas).toBe(1);
      expect(resultado.estatisticasRestauradas.totalAvaliacoes).toBe(1);
      expect(resultado.estatisticasRestauradas.totalTarefas).toBe(2);
      expect(resultado.estatisticasRestauradas.totalEventos).toBe(1);

      // 4. Verifica se dados estão disponíveis nos repositórios
      const disciplinas = await discRepo.listarTodas();
      expect(disciplinas).toHaveLength(2);
      expect(disciplinas.map((d) => d.nome)).toContain('Estruturas de Dados');
      expect(disciplinas.map((d) => d.nome)).toContain('Cálculo Numérico');

      // 5. Verifica se notificações locais foram agendadas
      expect(notificadorMock.agendar).toHaveBeenCalled();
    });

    it('deve suportar o modo MESCLAR mantendo registros pré-existentes', async () => {
      // Cria disciplina existente local
      await discRepo.criar({
        nome: 'Banco de Dados',
        corIdentificacao: '#f97316',
        criterioAprovacao: 'ARITMETICA',
      });

      // Cria backup com outra disciplina
      const jsonBackupOutro = JSON.stringify({
        metadados: {
          app: 'CampusFlow',
          versaoSchema: '1.0.0',
          dataExportacao: new Date().toISOString(),
          estatisticas: {
            totalDisciplinas: 1,
            totalHorarios: 0,
            totalFaltas: 0,
            totalAvaliacoes: 0,
            totalTarefas: 0,
            totalEventos: 0,
          },
        },
        dados: {
          disciplinas: [
            {
              id: 'disc_importada_1',
              nome: 'Inteligência Artificial',
              corIdentificacao: '#8b5cf6',
              criterioAprovacao: 'ARITMETICA',
              notaMinimaAprovacao: 6,
              dataCriacao: '2026-08-22',
              dataAtualizacao: '2026-08-22',
            },
          ],
          horariosAula: [],
          faltas: [],
          avaliacoes: [],
          tarefas: [],
          eventosAcademicos: [],
        },
      });

      const resultado = await service.restaurarBackup(jsonBackupOutro, 'MESCLAR');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.modo).toBe('MESCLAR');

      const todas = await discRepo.listarTodas();
      expect(todas).toHaveLength(2);
      const nomes = todas.map((d) => d.nome);
      expect(nomes).toContain('Banco de Dados');
      expect(nomes).toContain('Inteligência Artificial');
    });

    it('deve rejeitar restauração se o backup for inválido sem corromper o estado local', async () => {
      await discRepo.criar({
        nome: 'Segurança da Informação',
        corIdentificacao: '#ef4444',
        criterioAprovacao: 'ARITMETICA',
      });

      const jsonCorrompido = 'INVALID_JSON_DATA';

      await expect(service.restaurarBackup(jsonCorrompido)).rejects.toThrow(
        'Falha na validação do backup'
      );

      // Garante que os dados locais permaneceram intocados
      const disciplinasAposErro = await discRepo.listarTodas();
      expect(disciplinasAposErro).toHaveLength(1);
      expect(disciplinasAposErro[0].nome).toBe('Segurança da Informação');
    });
  });

  describe('Idempotência de Portabilidade (Exportar -> Restaurar -> Exportar)', () => {
    it('deve produzir dados idênticos após ciclo completo de exportação e restauração', async () => {
      await popularMassaDeDados();

      // Exportação 1
      const json1 = await service.gerarBackupJson();
      const obj1 = JSON.parse(json1);

      // Restauração
      await service.restaurarBackup(json1, 'SUBSTITUIR');

      // Exportação 2
      const json2 = await service.gerarBackupJson();
      const obj2 = JSON.parse(json2);

      // Compara dados internos (ignorando apenas timestamp de dataExportacao nos metadados)
      expect(obj2.dados).toEqual(obj1.dados);
      expect(obj2.metadados.estatisticas).toEqual(obj1.metadados.estatisticas);
      expect(obj2.metadados.versaoSchema).toEqual(obj1.metadados.versaoSchema);
    });
  });
});
