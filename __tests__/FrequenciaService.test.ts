import { FrequenciaService } from '../src/servicos/FrequenciaService';
import { DisciplinaService } from '../src/servicos/DisciplinaService';
import { FaltaRepositorioEmMemoria } from '../src/servicos/banco/FaltaRepositorio';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { HorarioAulaRepositorioEmMemoria } from '../src/servicos/banco/HorarioAulaRepositorio';
import { Disciplina } from '../src/modelos/Disciplina';

describe('FrequenciaService - Gestão e Cálculo de Faltas (Presença Obrigatória e Facultativa)', () => {
  let faltaRepo: FaltaRepositorioEmMemoria;
  let disciplinaRepo: DisciplinaRepositorioEmMemoria;
  let horarioRepo: HorarioAulaRepositorioEmMemoria;
  let frequenciaService: FrequenciaService;
  let disciplinaService: DisciplinaService;
  let disciplinaPadrao: Disciplina;
  let disciplinaPresencaFacultativa: Disciplina;

  beforeEach(async () => {
    faltaRepo = new FaltaRepositorioEmMemoria();
    disciplinaRepo = new DisciplinaRepositorioEmMemoria();
    horarioRepo = new HorarioAulaRepositorioEmMemoria();

    frequenciaService = new FrequenciaService(faltaRepo, disciplinaRepo);
    disciplinaService = new DisciplinaService(disciplinaRepo, horarioRepo, faltaRepo);

    // Disciplina com presença obrigatória (10 faltas permitidas)
    disciplinaPadrao = await disciplinaRepo.criar({
      nome: 'Estruturas de Dados',
      codigo: 'CC201',
      corIdentificacao: '#6366f1',
      limiteMaximoFaltas: 10,
      criterioAprovacao: 'ARITMETICA',
    });

    // Disciplina com presença facultativa (sem limite informado)
    disciplinaPresencaFacultativa = await disciplinaRepo.criar({
      nome: 'Seminários Avançados',
      codigo: 'SEM001',
      corIdentificacao: '#10b981',
      criterioAprovacao: 'CUSTOMIZADA',
    });
  });

  describe('RF03 - Registro Rápido de Faltas (+1 / -1)', () => {
    it('deve incrementar falta (+1) e atualizar o resumo de frequência', async () => {
      const resultado = await frequenciaService.incrementarFalta(disciplinaPadrao.id);

      expect(resultado.falta).toBeDefined();
      expect(resultado.falta.disciplinaId).toBe(disciplinaPadrao.id);
      expect(resultado.falta.data).toBeDefined();
      expect(resultado.falta.horario).toBeDefined();

      expect(resultado.resumo.totalFaltas).toBe(1);
      expect(resultado.resumo.faltasRestantes).toBe(9);
      expect(resultado.resumo.percentualConsumido).toBe(10);
      expect(resultado.resumo.status).toBe('SEGURO');
      expect(resultado.resumo.reprovadoPorFalta).toBe(false);
    });

    it('deve decrementar falta (-1) removendo o registro mais recente', async () => {
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);

      let resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(2);

      const resultado = await frequenciaService.decrementarFalta(disciplinaPadrao.id);
      expect(resultado.removida).toBe(true);
      expect(resultado.resumo.totalFaltas).toBe(1);
      expect(resultado.resumo.faltasRestantes).toBe(9);

      const historico = await frequenciaService.obterHistorico(disciplinaPadrao.id);
      expect(historico).toHaveLength(1);
    });

    it('não deve permitir faltas negativas ao decrementar quando o total for 0', async () => {
      const resultado = await frequenciaService.decrementarFalta(disciplinaPadrao.id);

      expect(resultado.removida).toBe(false);
      expect(resultado.resumo.totalFaltas).toBe(0);
      expect(resultado.resumo.faltasRestantes).toBe(10);
      expect(resultado.resumo.status).toBe('SEGURO');
    });

    it('deve registrar falta detalhada com data, horário e justificativa opcional', async () => {
      const resultado = await frequenciaService.registrarFaltaDetalhada({
        disciplinaId: disciplinaPadrao.id,
        data: '2026-08-20',
        horario: '10:00',
        justificativa: 'Consulta médica com atestado',
      });

      expect(resultado.falta.data).toBe('2026-08-20');
      expect(resultado.falta.horario).toBe('10:00');
      expect(resultado.falta.justificativa).toBe('Consulta médica com atestado');
      expect(resultado.resumo.totalFaltas).toBe(1);
    });

    it('deve rejeitar falta com data ou horário em formato inválido', async () => {
      await expect(
        frequenciaService.registrarFaltaDetalhada({
          disciplinaId: disciplinaPadrao.id,
          data: '20-08-2026',
          horario: '10:00',
        })
      ).rejects.toThrow('Data no formato inválido');

      await expect(
        frequenciaService.registrarFaltaDetalhada({
          disciplinaId: disciplinaPadrao.id,
          data: '2026-08-20',
          horario: '25:99',
        })
      ).rejects.toThrow('Horário no formato inválido');
    });

    it('deve remover uma falta individual pelo ID do histórico', async () => {
      const { falta: f1 } = await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      const { falta: f2 } = await frequenciaService.incrementarFalta(disciplinaPadrao.id);

      const resultado = await frequenciaService.removerFaltaPorId(f1.id, disciplinaPadrao.id);
      expect(resultado.removida).toBe(true);
      expect(resultado.resumo.totalFaltas).toBe(1);

      const historico = await frequenciaService.obterHistorico(disciplinaPadrao.id);
      expect(historico).toHaveLength(1);
      expect(historico[0].id).toBe(f2.id);
    });
  });

  describe('RF04 & RF05 - Lógica de Limites e Presença Facultativa', () => {
    it('deve indicar status SEGURO quando consumo for menor que 50%', async () => {
      for (let i = 0; i < 4; i++) {
        await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      }

      const resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(4);
      expect(resumo.faltasRestantes).toBe(6);
      expect(resumo.percentualConsumido).toBe(40);
      expect(resumo.status).toBe('SEGURO');
      expect(resumo.reprovadoPorFalta).toBe(false);
    });

    it('deve indicar status ALERTA quando consumo for maior ou igual a 75%', async () => {
      for (let i = 0; i < 8; i++) {
        await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      }

      const resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(8);
      expect(resumo.faltasRestantes).toBe(2);
      expect(resumo.percentualConsumido).toBe(80);
      expect(resumo.status).toBe('ALERTA');
      expect(resumo.reprovadoPorFalta).toBe(false);
    });

    it('deve indicar status CRÍTICO e reprovado quando atingir ou exceder o limite', async () => {
      for (let i = 0; i < 10; i++) {
        await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      }

      let resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(10);
      expect(resumo.faltasRestantes).toBe(0);
      expect(resumo.percentualConsumido).toBe(100);
      expect(resumo.status).toBe('CRITICO');
      expect(resumo.reprovadoPorFalta).toBe(true);

      // 11 faltas
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(11);
      expect(resumo.status).toBe('CRITICO');
      expect(resumo.reprovadoPorFalta).toBe(true);
    });

    it('deve tratar matéria sem limite como Presença Facultativa (nunca reprova por falta)', async () => {
      // Estado inicial (0 faltas)
      let resumo = await frequenciaService.calcularResumoFrequencia(
        disciplinaPresencaFacultativa.id
      );
      expect(resumo.totalFaltas).toBe(0);
      expect(resumo.presencaObrigatoria).toBe(false);
      expect(resumo.limiteMaximoFaltas).toBeNull();
      expect(resumo.faltasRestantes).toBeNull();
      expect(resumo.status).toBe('SEGURO');
      expect(resumo.reprovadoPorFalta).toBe(false);

      // Registra 5 faltas
      for (let i = 0; i < 5; i++) {
        await frequenciaService.incrementarFalta(disciplinaPresencaFacultativa.id);
      }
      resumo = await frequenciaService.calcularResumoFrequencia(
        disciplinaPresencaFacultativa.id
      );
      expect(resumo.totalFaltas).toBe(5);
      expect(resumo.presencaObrigatoria).toBe(false);
      expect(resumo.status).toBe('SEGURO');
      expect(resumo.reprovadoPorFalta).toBe(false);
    });

    it('deve calcular resumos em lote para lista mista de disciplinas', async () => {
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      await frequenciaService.incrementarFalta(disciplinaPresencaFacultativa.id);

      const resumos = await frequenciaService.calcularResumosEmLote([
        disciplinaPadrao,
        disciplinaPresencaFacultativa,
      ]);

      expect(resumos[disciplinaPadrao.id].totalFaltas).toBe(1);
      expect(resumos[disciplinaPadrao.id].presencaObrigatoria).toBe(true);

      expect(resumos[disciplinaPresencaFacultativa.id].totalFaltas).toBe(1);
      expect(resumos[disciplinaPresencaFacultativa.id].presencaObrigatoria).toBe(false);
      expect(resumos[disciplinaPresencaFacultativa.id].status).toBe('SEGURO');
    });
  });

  describe('Exclusão em Cascata', () => {
    it('deve remover todas as faltas associadas quando a disciplina for excluída', async () => {
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);

      let total = await faltaRepo.contarPorDisciplina(disciplinaPadrao.id);
      expect(total).toBe(2);

      await disciplinaService.excluirDisciplina(disciplinaPadrao.id);

      total = await faltaRepo.contarPorDisciplina(disciplinaPadrao.id);
      expect(total).toBe(0);
    });
  });
});
