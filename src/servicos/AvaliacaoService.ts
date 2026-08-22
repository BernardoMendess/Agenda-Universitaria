import {
  Avaliacao,
  CriarAvaliacaoDTO,
  AtualizarAvaliacaoDTO,
  ResumoDesempenhoDisciplina,
  StatusAprovacao,
} from '../modelos/Avaliacao';
import { Disciplina } from '../modelos/Disciplina';
import {
  IAvaliacaoRepositorio,
  avaliacaoRepositorio,
} from './banco/AvaliacaoRepositorio';
import {
  IDisciplinaRepositorio,
  disciplinaRepositorio,
} from './banco/DisciplinaRepositorio';

const NOTA_MINIMA_APROVACAO_PADRAO = 6.0;

export class AvaliacaoService {
  private avaliacaoRepo: IAvaliacaoRepositorio;
  private disciplinaRepo: IDisciplinaRepositorio;

  constructor(
    avaliacaoRepo: IAvaliacaoRepositorio = avaliacaoRepositorio,
    disciplinaRepo: IDisciplinaRepositorio = disciplinaRepositorio
  ) {
    this.avaliacaoRepo = avaliacaoRepo;
    this.disciplinaRepo = disciplinaRepo;
  }

  /**
   * Cadastra uma nova avaliação vinculada a uma disciplina.
   */
  async criarAvaliacao(dados: CriarAvaliacaoDTO): Promise<Avaliacao> {
    await this.validarExistenciaDisciplina(dados.disciplinaId);
    this.validarDadosCriacao(dados);
    return await this.avaliacaoRepo.criar(dados);
  }

  /**
   * Atualiza os dados de uma avaliação existente.
   */
  async atualizarAvaliacao(
    id: string,
    dados: AtualizarAvaliacaoDTO
  ): Promise<Avaliacao> {
    if (!id || id.trim() === '') {
      throw new Error('ID da avaliação inválido.');
    }

    const existente = await this.avaliacaoRepo.buscarPorId(id);
    if (!existente) {
      throw new Error('Avaliação não encontrada.');
    }

    this.validarDadosAtualizacao(dados, existente.notaMaxima);
    return await this.avaliacaoRepo.atualizar(id, dados);
  }

  /**
   * Lança a nota obtida em uma avaliação e retorna o resumo de desempenho atualizado.
   */
  async lancarNota(
    id: string,
    nota: number | null
  ): Promise<{ avaliacao: Avaliacao; resumo: ResumoDesempenhoDisciplina }> {
    if (!id || id.trim() === '') {
      throw new Error('ID da avaliação inválido.');
    }

    const avaliacao = await this.avaliacaoRepo.buscarPorId(id);
    if (!avaliacao) {
      throw new Error('Avaliação não encontrada.');
    }

    // Valida a nota dentro do intervalo [0, notaMaxima]
    if (nota !== null) {
      if (typeof nota !== 'number' || isNaN(nota)) {
        throw new Error('A nota deve ser um número válido.');
      }
      if (nota < 0 || nota > avaliacao.notaMaxima) {
        throw new Error(
          `A nota deve estar entre 0 e ${avaliacao.notaMaxima}.`
        );
      }
    }

    const avaliacaoAtualizada = await this.avaliacaoRepo.lancarNota(id, nota);
    const resumo = await this.calcularDesempenho(avaliacao.disciplinaId);

    return { avaliacao: avaliacaoAtualizada, resumo };
  }

  /**
   * Remove a nota de uma avaliação (seta nota = null), mantendo o agendamento.
   */
  async removerNota(
    id: string
  ): Promise<{ avaliacao: Avaliacao; resumo: ResumoDesempenhoDisciplina }> {
    return await this.lancarNota(id, null);
  }

  /**
   * Exclui uma avaliação pelo ID.
   */
  async excluirAvaliacao(id: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      throw new Error('ID da avaliação inválido.');
    }

    const existente = await this.avaliacaoRepo.buscarPorId(id);
    if (!existente) {
      throw new Error('Avaliação não encontrada para exclusão.');
    }

    return await this.avaliacaoRepo.excluir(id);
  }

  /**
   * Lista todas as avaliações de todas as disciplinas cadastradas.
   */
  async listarTodas(): Promise<Avaliacao[]> {
    return await this.avaliacaoRepo.listarTodas();
  }

  /**
   * Lista todas as avaliações de uma disciplina ordenadas cronologicamente, ou todas se o ID for omitido.
   */
  async listarPorDisciplina(disciplinaId?: string): Promise<Avaliacao[]> {
    if (!disciplinaId || disciplinaId.trim() === '') {
      return await this.avaliacaoRepo.listarTodas();
    }
    await this.validarExistenciaDisciplina(disciplinaId);
    return await this.avaliacaoRepo.listarPorDisciplina(disciplinaId);
  }

  /**
   * Retorna as próximas avaliações futuras enriquecidas com dados da disciplina.
   * Limitadas às primeiras `limite` avaliações (padrão: 5).
   */
  async obterProximasAvaliacoes(
    limite: number = 5
  ): Promise<
    (Avaliacao & { disciplinaNome: string; corIdentificacao: string })[]
  > {
    const todas = await this.avaliacaoRepo.listarTodas();
    const hoje = new Date().toISOString().split('T')[0];

    const futuras = todas
      .filter((a) => a.data >= hoje && a.nota == null)
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, limite);

    const resultado: (Avaliacao & {
      disciplinaNome: string;
      corIdentificacao: string;
    })[] = [];

    for (const avaliacao of futuras) {
      const disciplina = await this.disciplinaRepo.buscarPorId(
        avaliacao.disciplinaId
      );
      resultado.push({
        ...avaliacao,
        disciplinaNome: disciplina?.nome ?? 'Desconhecida',
        corIdentificacao:
          disciplina?.corIdentificacao ?? '#6366f1',
      });
    }

    return resultado;
  }

  /**
   * Calcula o resumo de desempenho de notas de uma disciplina (RF06).
   * Aplica Média Aritmética ou Média Ponderada conforme criterioAprovacao.
   */
  async calcularDesempenho(
    disciplinaId: string
  ): Promise<ResumoDesempenhoDisciplina> {
    const disciplina = await this.disciplinaRepo.buscarPorId(disciplinaId);
    if (!disciplina) {
      throw new Error(`Disciplina com ID "${disciplinaId}" não encontrada.`);
    }

    const avaliacoes = await this.avaliacaoRepo.listarPorDisciplina(
      disciplinaId
    );

    return this.computarDesempenho(disciplina, avaliacoes);
  }

  /**
   * Calcula resumos de desempenho em lote para otimizar renderizações de listas.
   */
  async calcularDesempenhosEmLote(
    disciplinas: Disciplina[]
  ): Promise<Record<string, ResumoDesempenhoDisciplina>> {
    const resumos: Record<string, ResumoDesempenhoDisciplina> = {};

    for (const disc of disciplinas) {
      const avaliacoes = await this.avaliacaoRepo.listarPorDisciplina(disc.id);
      resumos[disc.id] = this.computarDesempenho(disc, avaliacoes);
    }

    return resumos;
  }

  // --- Algoritmos Matemáticos (RF06) ---

  private computarDesempenho(
    disciplina: Disciplina,
    avaliacoes: Avaliacao[]
  ): ResumoDesempenhoDisciplina {
    const notaMinimaAprovacao =
      disciplina.notaMinimaAprovacao ?? NOTA_MINIMA_APROVACAO_PADRAO;
    const totalAvaliacoes = avaliacoes.length;

    const lancadas = avaliacoes.filter(
      (a) => a.nota !== null && a.nota !== undefined
    );
    const pendentes = avaliacoes.filter(
      (a) => a.nota === null || a.nota === undefined
    );

    const avaliacoesLancadas = lancadas.length;
    const avaliacoesPendentes = pendentes.length;

    if (totalAvaliacoes === 0) {
      return {
        disciplinaId: disciplina.id,
        mediaAtual: null,
        totalAvaliacoes: 0,
        avaliacoesLancadas: 0,
        avaliacoesPendentes: 0,
        notaMinimaAprovacao,
        projecaoNotaNecessaria: null,
        statusAprovacao: 'EM_CURSO',
        mensagemProjecao: 'Nenhuma avaliação cadastrada.',
      };
    }

    const isPonderada = disciplina.criterioAprovacao === 'PONDERADA';

    // Calcula média atual apenas com avaliações lançadas
    const mediaAtual =
      avaliacoesLancadas === 0
        ? null
        : isPonderada
        ? this.calcularMediaPonderada(lancadas)
        : this.calcularMediaAritmetica(lancadas);

    // Calcula projeção da nota necessária nas avaliações pendentes
    const projecaoNotaNecessaria =
      avaliacoesPendentes === 0
        ? null
        : isPonderada
        ? this.projetarNotaNecessariaPonderada(
            lancadas,
            pendentes,
            notaMinimaAprovacao
          )
        : this.projetarNotaNecessariaAritmetica(
            lancadas,
            pendentes,
            totalAvaliacoes,
            notaMinimaAprovacao
          );

    const statusAprovacao = this.determinarStatusAprovacao(
      mediaAtual,
      projecaoNotaNecessaria,
      avaliacoesPendentes,
      notaMinimaAprovacao
    );

    const mensagemProjecao = this.gerarMensagemProjecao(
      statusAprovacao,
      mediaAtual,
      projecaoNotaNecessaria,
      avaliacoesPendentes,
      notaMinimaAprovacao,
      isPonderada
    );

    return {
      disciplinaId: disciplina.id,
      mediaAtual,
      totalAvaliacoes,
      avaliacoesLancadas,
      avaliacoesPendentes,
      notaMinimaAprovacao,
      projecaoNotaNecessaria,
      statusAprovacao,
      mensagemProjecao,
    };
  }

  /** Média Aritmética simples normalizada na escala 0-10 */
  private calcularMediaAritmetica(lancadas: Avaliacao[]): number {
    if (lancadas.length === 0) return 0;
    const soma = lancadas.reduce((acc, a) => {
      const nota = a.nota ?? 0;
      const notaMaxima = a.notaMaxima > 0 ? a.notaMaxima : 10;
      const notaNormalizada = (nota / notaMaxima) * 10;
      return acc + notaNormalizada;
    }, 0);
    return Math.round((soma / lancadas.length) * 100) / 100;
  }

  /** Média Ponderada: soma(notaNormalizada * peso) / soma(pesos) */
  private calcularMediaPonderada(lancadas: Avaliacao[]): number {
    if (lancadas.length === 0) return 0;
    let somaPonderada = 0;
    let somaPesos = 0;

    for (const a of lancadas) {
      const nota = a.nota ?? 0;
      const notaMaxima = a.notaMaxima > 0 ? a.notaMaxima : 10;
      const peso = a.peso > 0 ? a.peso : 1;
      const notaNormalizada = (nota / notaMaxima) * 10;

      somaPonderada += notaNormalizada * peso;
      somaPesos += peso;
    }

    if (somaPesos === 0) return 0;
    return Math.round((somaPonderada / somaPesos) * 100) / 100;
  }

  /**
   * Projeção Aritmética:
   * notaNecessaria = (meta * total - somaNotasLancadas) / avaliacoesPendentes
   */
  private projetarNotaNecessariaAritmetica(
    lancadas: Avaliacao[],
    pendentes: Avaliacao[],
    totalAvaliacoes: number,
    meta: number
  ): number {
    const somaLancadas = lancadas.reduce((acc, a) => {
      const nota = a.nota ?? 0;
      const notaMaxima = a.notaMaxima > 0 ? a.notaMaxima : 10;
      return acc + (nota / notaMaxima) * 10;
    }, 0);

    const pontosNecessarios = meta * totalAvaliacoes - somaLancadas;
    if (pontosNecessarios <= 0) return 0;

    const notaMedia = pontosNecessarios / pendentes.length;
    return Math.round(notaMedia * 100) / 100;
  }

  /**
   * Projeção Ponderada:
   * meta * somaTodosPesos - somaPonderadaLancadas = pontosPonderadosNecessarios
   * notaMedia = pontosPonderadosNecessarios / somaPesosPendentes
   */
  private projetarNotaNecessariaPonderada(
    lancadas: Avaliacao[],
    pendentes: Avaliacao[],
    meta: number
  ): number {
    let somaPonderadaLancadas = 0;
    let somaPesosLancadas = 0;

    for (const a of lancadas) {
      const nota = a.nota ?? 0;
      const notaMaxima = a.notaMaxima > 0 ? a.notaMaxima : 10;
      const peso = a.peso > 0 ? a.peso : 1;
      const notaNormalizada = (nota / notaMaxima) * 10;

      somaPonderadaLancadas += notaNormalizada * peso;
      somaPesosLancadas += peso;
    }

    let somaPesosPendentes = 0;
    for (const p of pendentes) {
      const peso = p.peso > 0 ? p.peso : 1;
      somaPesosPendentes += peso;
    }

    if (somaPesosPendentes === 0) return 0;

    const somaTodosPesos = somaPesosLancadas + somaPesosPendentes;
    const pontosPonderadosNecessarios =
      meta * somaTodosPesos - somaPonderadaLancadas;

    if (pontosPonderadosNecessarios <= 0) return 0;

    const notaMedia = pontosPonderadosNecessarios / somaPesosPendentes;
    return Math.round(notaMedia * 100) / 100;
  }

  private determinarStatusAprovacao(
    mediaAtual: number | null,
    projecaoNotaNecessaria: number | null,
    avaliacoesPendentes: number,
    notaMinimaAprovacao: number
  ): StatusAprovacao {
    // Todas as avaliações foram lançadas — resultado final
    if (avaliacoesPendentes === 0 && mediaAtual !== null) {
      return mediaAtual >= notaMinimaAprovacao ? 'APROVADO' : 'REPROVADO_POR_NOTA';
    }

    // Aprovação garantida: mesmo tirando 0 nas pendentes a média já é suficiente
    if (
      projecaoNotaNecessaria !== null &&
      projecaoNotaNecessaria <= 0
    ) {
      return 'APROVADO';
    }

    // Nota necessária excede 10.0 (impossível alcançar a meta)
    if (
      projecaoNotaNecessaria !== null &&
      projecaoNotaNecessaria > 10.0
    ) {
      return 'REPROVADO_POR_NOTA';
    }

    // Situação de risco (precisa de média >= 7.5 nas pendentes)
    if (
      projecaoNotaNecessaria !== null &&
      projecaoNotaNecessaria >= 7.5
    ) {
      return 'EM_RISCO';
    }

    return 'EM_CURSO';
  }

  private gerarMensagemProjecao(
    status: StatusAprovacao,
    mediaAtual: number | null,
    projecaoNotaNecessaria: number | null,
    avaliacoesPendentes: number,
    notaMinimaAprovacao: number,
    isPonderada: boolean = false
  ): string {
    if (status === 'APROVADO' && avaliacoesPendentes === 0) {
      return `Aprovado! Média final ${mediaAtual?.toFixed(1)} ≥ ${notaMinimaAprovacao.toFixed(1)}.`;
    }
    if (status === 'APROVADO' && avaliacoesPendentes > 0) {
      return `Aprovação já garantida! Média necessária restante: 0.0.`;
    }
    if (status === 'REPROVADO_POR_NOTA' && avaliacoesPendentes === 0) {
      return `Reprovado. Média final ${mediaAtual?.toFixed(1)} < ${notaMinimaAprovacao.toFixed(1)}.`;
    }
    if (status === 'REPROVADO_POR_NOTA' && avaliacoesPendentes > 0) {
      return `Situação crítica: média necessária (${projecaoNotaNecessaria?.toFixed(1)}) excede 10.0.`;
    }
    if (status === 'EM_RISCO') {
      return `Atenção! Você precisa de média ${projecaoNotaNecessaria?.toFixed(1)} nas próximas ${avaliacoesPendentes} avaliação(ões).`;
    }
    if (projecaoNotaNecessaria !== null && avaliacoesPendentes > 0) {
      return `Precisa de média ${projecaoNotaNecessaria.toFixed(1)}${isPonderada ? ' (ponderada)' : ''} nas ${avaliacoesPendentes} avaliação(ões) restante(s).`;
    }
    return 'Sem avaliações cadastradas.';
  }

  // --- Validações ---

  private async validarExistenciaDisciplina(
    disciplinaId: string
  ): Promise<void> {
    if (!disciplinaId || disciplinaId.trim() === '') {
      throw new Error('ID da disciplina inválido.');
    }
    const disc = await this.disciplinaRepo.buscarPorId(disciplinaId);
    if (!disc) {
      throw new Error(`Disciplina com ID "${disciplinaId}" não encontrada.`);
    }
  }

  private validarDadosCriacao(dados: CriarAvaliacaoDTO): void {
    if (!dados.titulo || dados.titulo.trim().length < 2) {
      throw new Error('O título da avaliação deve ter no mínimo 2 caracteres.');
    }

    if (!dados.data || !this.validarFormatoData(dados.data)) {
      throw new Error('Data no formato inválido. Utilize o formato AAAA-MM-DD.');
    }

    if (dados.horario && !this.validarFormatoHorario(dados.horario)) {
      throw new Error(
        'Horário no formato inválido. Utilize o formato HH:mm (ex: 08:30).'
      );
    }

    if (dados.peso !== undefined && (typeof dados.peso !== 'number' || isNaN(dados.peso) || dados.peso <= 0)) {
      throw new Error('O peso da avaliação deve ser um número maior que 0.');
    }

    if (
      dados.notaMaxima !== undefined &&
      (typeof dados.notaMaxima !== 'number' ||
        isNaN(dados.notaMaxima) ||
        dados.notaMaxima <= 0)
    ) {
      throw new Error('A nota máxima deve ser um número maior que 0.');
    }
  }

  private validarDadosAtualizacao(
    dados: AtualizarAvaliacaoDTO,
    notaMaximaAtual: number
  ): void {
    if (dados.titulo !== undefined && dados.titulo.trim().length < 2) {
      throw new Error('O título deve ter no mínimo 2 caracteres.');
    }

    if (dados.data !== undefined && !this.validarFormatoData(dados.data)) {
      throw new Error('Data no formato inválido. Utilize o formato AAAA-MM-DD.');
    }

    if (
      dados.horario !== undefined &&
      dados.horario !== '' &&
      !this.validarFormatoHorario(dados.horario)
    ) {
      throw new Error(
        'Horário no formato inválido. Utilize o formato HH:mm (ex: 08:30).'
      );
    }

    if (
      dados.peso !== undefined &&
      (typeof dados.peso !== 'number' || isNaN(dados.peso) || dados.peso <= 0)
    ) {
      throw new Error('O peso da avaliação deve ser um número maior que 0.');
    }

    const notaMaxima =
      dados.notaMaxima !== undefined ? dados.notaMaxima : notaMaximaAtual;
    if (
      dados.notaMaxima !== undefined &&
      (typeof dados.notaMaxima !== 'number' ||
        isNaN(dados.notaMaxima) ||
        dados.notaMaxima <= 0)
    ) {
      throw new Error('A nota máxima deve ser um número maior que 0.');
    }
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

// Instância singleton do serviço
export const avaliacaoService = new AvaliacaoService();
