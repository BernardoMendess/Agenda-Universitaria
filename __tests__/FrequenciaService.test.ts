import { FrequenciaService } from '../src/servicos/FrequenciaService';
import { DisciplinaService } from '../src/servicos/DisciplinaService';
import { FaltaRepositorioEmMemoria } from '../src/servicos/banco/FaltaRepositorio';
import { DisciplinaRepositorioEmMemoria } from '../src/servicos/banco/DisciplinaRepositorio';
import { HorarioAulaRepositorioEmMemoria } from '../src/servicos/banco/HorarioAulaRepositorio';
import { Disciplina } from '../src/modelos/Disciplina';

describe('FrequenciaService - RF03, RF04, RF05: Gestão e Cálculo de Faltas', () => {
  let faltaRepo: FaltaRepositorioEmMemoria;
  let disciplinaRepo: DisciplinaRepositorioEmMemoria;
  let horarioRepo: HorarioAulaRepositorioEmMemoria;
  let frequenciaService: FrequenciaService;
  let disciplinaService: DisciplinaService;
  let disciplinaPadrao: Disciplina;
  let disciplinaLimiteZero: Disciplina;

  beforeEach(async () => {
    faltaRepo = new FaltaRepositorioEmMemoria();
    disciplinaRepo = new DisciplinaRepositorioEmMemoria();
    horarioRepo = new HorarioAulaRepositorioEmMemoria();

    frequenciaService = new FrequenciaService(faltaRepo, disciplinaRepo);
    disciplinaService = new DisciplinaService(disciplinaRepo, horarioRepo, faltaRepo);

    // Disciplina com limite padrão (10 faltas permitidas)
    disciplinaPadrao = await disciplinaRepo.criar({
      nome: 'Estruturas de Dados',
      codigo: 'CC201',
      corIdentificacao: '#6366f1',
      limiteMaximoFaltas: 10,
      criterioAprovacao: 'ARITMETICA',
    });

    // Disciplina com limite zero (tolerância zero)
    disciplinaLimiteZero = await disciplinaRepo.criar({
      nome: 'Estágio Supervisionado',
      codigo: 'EST001',
      corIdentificacao: '#f85149',
      limiteMaximoFaltas: 0,
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
      // Adiciona 2 faltas
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);

      let resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(2);

      // Decrementa 1 falta
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
          data: '20-08-2026', // Formato não AAAA-MM-DD
          horario: '10:00',
        })
      ).rejects.toThrow('Data no formato inválido');

      await expect(
        frequenciaService.registrarFaltaDetalhada({
          disciplinaId: disciplinaPadrao.id,
          data: '2026-08-20',
          horario: '25:99', // Hora inválida
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

    it('deve listar o histórico ordenado decrescente por data e horário', async () => {
      await frequenciaService.registrarFaltaDetalhada({
        disciplinaId: disciplinaPadrao.id,
        data: '2026-08-10',
        horario: '08:00',
        justificativa: 'Falta 1',
      });

      await frequenciaService.registrarFaltaDetalhada({
        disciplinaId: disciplinaPadrao.id,
        data: '2026-08-15',
        horario: '14:00',
        justificativa: 'Falta 2',
      });

      const historico = await frequenciaService.obterHistorico(disciplinaPadrao.id);
      expect(historico).toHaveLength(2);
      expect(historico[0].data).toBe('2026-08-15');
      expect(historico[1].data).toBe('2026-08-10');
    });
  });

  describe('RF04 & RF05 - Lógica de Limites e Indicadores Visuais', () => {
    it('deve indicar status SEGURO (Verde) quando consumo for menor que 50%', async () => {
      // Limite = 10. Com 4 faltas = 40% (< 50%)
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

    it('deve indicar status ALERTA (Amarelo) quando consumo for maior ou igual a 75%', async () => {
      // Limite = 10. Com 8 faltas = 80% (>= 75% e < 100%)
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

    it('deve indicar status CRÍTICO (Vermelho) e reprovado quando atingir ou exceder o limite', async () => {
      // Limite = 10. Com 10 faltas = 100% (limite atingido)
      for (let i = 0; i < 10; i++) {
        await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      }

      let resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(10);
      expect(resumo.faltasRestantes).toBe(0);
      expect(resumo.percentualConsumido).toBe(100);
      expect(resumo.status).toBe('CRITICO');
      expect(resumo.reprovadoPorFalta).toBe(true);

      // 11 faltas (excedido)
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      resumo = await frequenciaService.calcularResumoFrequencia(disciplinaPadrao.id);
      expect(resumo.totalFaltas).toBe(11);
      expect(resumo.faltasRestantes).toBe(0);
      expect(resumo.status).toBe('CRITICO');
      expect(resumo.reprovadoPorFalta).toBe(true);
    });

    it('deve aplicar regra de Limite Zero (Tolerância Zero): 0 faltas é SEGURO, 1 falta é CRÍTICO/Reprovado', async () => {
      // Estado inicial (0 faltas)
      let resumo = await frequenciaService.calcularResumoFrequencia(disciplinaLimiteZero.id);
      expect(resumo.totalFaltas).toBe(0);
      expect(resumo.limiteMaximoFaltas).toBe(0);
      expect(resumo.faltasRestantes).toBe(0);
      expect(resumo.status).toBe('SEGURO');
      expect(resumo.reprovadoPorFalta).toBe(false);

      // Registra 1 falta
      const resultado = await frequenciaService.incrementarFalta(disciplinaLimiteZero.id);
      expect(resultado.resumo.totalFaltas).toBe(1);
      expect(resultado.resumo.status).toBe('CRITICO');
      expect(resultado.resumo.reprovadoPorFalta).toBe(true);
    });

    it('deve calcular resumos em lote para lista de disciplinas', async () => {
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      await frequenciaService.incrementarFalta(disciplinaLimiteZero.id);

      const resumos = await frequenciaService.calcularResumosEmLote([
        disciplinaPadrao,
        disciplinaLimiteZero,
      ]);

      expect(resumos[disciplinaPadrao.id].totalFaltas).toBe(1);
      expect(resumos[disciplinaPadrao.id].status).toBe('SEGURO');

      expect(resumos[disciplinaLimiteZero.id].totalFaltas).toBe(1);
      expect(resumos[disciplinaLimiteZero.id].status).toBe('CRITICO');
      expect(resumos[disciplinaLimiteZero.id].reprovadoPorFalta).toBe(true);
    });
  });

  describe('Exclusão em Cascata', () => {
    it('deve remover todas as faltas associadas quando a disciplina for excluída', async () => {
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);
      await frequenciaService.incrementarFalta(disciplinaPadrao.id);

      let total = await faltaRepo.contarPorDisciplina(disciplinaPadrao.id);
      expect(total).toBe(2);

      // Exclui a disciplina
      await disciplinaService.excluirDisciplina(disciplinaPadrao.id);

      total = await faltaRepo.contarPorDisciplina(disciplinaPadrao.id);
      expect(total).toBe(0);
    });
  });
});
