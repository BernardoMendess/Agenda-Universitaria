/**
 * Tipo que descreve as ações rápidas executadas em 1 toque no dashboard ou telas de acesso direto.
 */
export type TipoAcaoRapida =
  | 'INCREMENTAR_FALTA'
  | 'DECREMENTAR_FALTA'
  | 'CONCLUIR_TAREFA'
  | 'REABRIR_TAREFA';

export interface RegistroAcaoRapida {
  id: string;
  tipo: TipoAcaoRapida;
  timestamp: number;
  descricao: string;
  disciplinaId?: string;
  disciplinaNome?: string;
  tarefaId?: string;
  tarefaTitulo?: string;
  totalFaltasAposAcao?: number;
  limiteFaltas?: number | null;
  concluidaAposAcao?: boolean;
}

export interface FeedbackAcaoRapida {
  id: string;
  mensagem: string;
  tipo: 'SUCESSO' | 'ALERTA' | 'INFO';
  podeDesfazer: boolean;
  acaoOriginal: RegistroAcaoRapida;
}

/**
 * Serviço responsável por gerenciar a inteligência e o histórico de ações de 1 toque (RNF03).
 * Garante feedback imediato ao usuário e funcionalidade de desfazer (Undo) com integridade.
 */
export class AcoesRapidasService {
  private pilhaHistorico: RegistroAcaoRapida[] = [];
  private limiteHistorico: number = 20;

  /**
   * Gera mensagem de feedback contextual para registro ou remoção de faltas em 1 toque.
   */
  public gerarMensagemFeedbackFalta(
    nomeDisciplina: string,
    tipo: 'INCREMENTO' | 'DECREMENTO',
    totalFaltas?: number,
    limiteFaltas?: number | null
  ): string {
    const nomeTruncado =
      nomeDisciplina.length > 20
        ? `${nomeDisciplina.substring(0, 18)}...`
        : nomeDisciplina;

    const detalheLimite =
      typeof totalFaltas === 'number' && typeof limiteFaltas === 'number' && limiteFaltas > 0
        ? ` (${totalFaltas}/${limiteFaltas} faltas)`
        : typeof totalFaltas === 'number'
        ? ` (Total: ${totalFaltas})`
        : '';

    if (tipo === 'INCREMENTO') {
      return `Falta registrada em ${nomeTruncado}${detalheLimite}`;
    } else {
      return `Falta removida de ${nomeTruncado}${detalheLimite}`;
    }
  }

  /**
   * Gera mensagem de feedback contextual para conclusão ou reabertura de tarefas em 1 toque.
   */
  public gerarMensagemFeedbackTarefa(
    tituloTarefa: string,
    concluida: boolean
  ): string {
    const tituloTruncado =
      tituloTarefa.length > 22
        ? `${tituloTarefa.substring(0, 20)}...`
        : tituloTarefa;

    if (concluida) {
      return `Tarefa concluída: "${tituloTruncado}"`;
    } else {
      return `Tarefa reaberta: "${tituloTruncado}"`;
    }
  }

  /**
   * Registra uma ação executada em 1 toque na pilha do serviço.
   */
  public registrarAcao(
    dados: Omit<RegistroAcaoRapida, 'id' | 'timestamp'>
  ): RegistroAcaoRapida {
    const registro: RegistroAcaoRapida = {
      ...dados,
      id: `acao_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };

    this.pilhaHistorico.unshift(registro);

    if (this.pilhaHistorico.length > this.limiteHistorico) {
      this.pilhaHistorico.pop();
    }

    return registro;
  }

  /**
   * Cria o objeto de feedback pronto para exibição no Toast/Snackbar.
   */
  public criarFeedback(acao: RegistroAcaoRapida): FeedbackAcaoRapida {
    let mensagem = acao.descricao;
    let tipo: 'SUCESSO' | 'ALERTA' | 'INFO' = 'SUCESSO';

    if (acao.tipo === 'INCREMENTAR_FALTA') {
      mensagem = this.gerarMensagemFeedbackFalta(
        acao.disciplinaNome || 'Disciplina',
        'INCREMENTO',
        acao.totalFaltasAposAcao,
        acao.limiteFaltas
      );
      if (
        typeof acao.totalFaltasAposAcao === 'number' &&
        typeof acao.limiteFaltas === 'number' &&
        acao.limiteFaltas > 0 &&
        acao.totalFaltasAposAcao >= acao.limiteFaltas
      ) {
        tipo = 'ALERTA';
      }
    } else if (acao.tipo === 'DECREMENTAR_FALTA') {
      mensagem = this.gerarMensagemFeedbackFalta(
        acao.disciplinaNome || 'Disciplina',
        'DECREMENTO',
        acao.totalFaltasAposAcao,
        acao.limiteFaltas
      );
    } else if (acao.tipo === 'CONCLUIR_TAREFA' || acao.tipo === 'REABRIR_TAREFA') {
      mensagem = this.gerarMensagemFeedbackTarefa(
        acao.tarefaTitulo || 'Tarefa',
        acao.concluidaAposAcao ?? (acao.tipo === 'CONCLUIR_TAREFA')
      );
    }

    return {
      id: `feedback_${acao.id}`,
      mensagem,
      tipo,
      podeDesfazer: true,
      acaoOriginal: acao,
    };
  }

  /**
   * Obtém a última ação executada para permitir desfazer.
   */
  public obterUltimaAcao(): RegistroAcaoRapida | null {
    return this.pilhaHistorico.length > 0 ? this.pilhaHistorico[0] : null;
  }

  /**
   * Desfaz a última ação removendo-a do topo da pilha de histórico.
   */
  public desfazerUltimaAcao(): RegistroAcaoRapida | null {
    if (this.pilhaHistorico.length === 0) return null;
    return this.pilhaHistorico.shift() || null;
  }

  /**
   * Limpa a pilha de histórico de ações rápidas.
   */
  public limparHistorico(): void {
    this.pilhaHistorico = [];
  }

  /**
   * Retorna a quantidade de ações registradas no histórico.
   */
  public tamanhoHistorico(): number {
    return this.pilhaHistorico.length;
  }

  /**
   * Valida se uma operação foi executada em conformidade com o RNF03 (1 toque).
   */
  public validarConformidadeUsabilidade(toquesNecessarios: number): {
    conformeRNF03: boolean;
    nivelUsabilidade: 'EXCELENTE' | 'ACEITAVEL' | 'NAO_CONFORME';
    detalhes: string;
  } {
    if (toquesNecessarios <= 1) {
      return {
        conformeRNF03: true,
        nivelUsabilidade: 'EXCELENTE',
        detalhes: 'Ação executada em 1 toque diretamente na tela inicial sem navegação profunda.',
      };
    }
    if (toquesNecessarios === 2) {
      return {
        conformeRNF03: false,
        nivelUsabilidade: 'ACEITAVEL',
        detalhes: 'Ação requer 2 toques (ex: abertura de seletor ou confirmação).',
      };
    }
    return {
      conformeRNF03: false,
      nivelUsabilidade: 'NAO_CONFORME',
      detalhes: 'Navegação profunda detectada (> 2 toques), não atende ao RNF03.',
    };
  }
}

// Instância singleton do serviço
export const acoesRapidasService = new AcoesRapidasService();
