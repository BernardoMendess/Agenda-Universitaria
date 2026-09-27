import { gerenciadorBancoDados, BancoSQLiteLocal } from './banco/sqlite/GerenciadorBancoDados';
import {
  CHAVES_PREFERENCIAS_APOIO,
  TEMPO_SEGUNDOS_DISPARO_POPUP,
} from '../constantes/apoio';

export interface IApoioProjetoService {
  verificarSeJaExibiu(): boolean;
  marcarComoExibido(): void;
  obterTempoUsoSegundos(): number;
  salvarTempoUsoSegundos(segundos: number): void;
  deveDispararModal(): boolean;
  resetarStatusParaTestes(): void;
}

/**
 * Serviço responsável por controlar o tempo de uso ativo do aplicativo
 * e garantir que o pop-up de apoio (Buy me a coffee) seja exibido uma única
 * vez após 10 minutos de uso e nunca mais.
 *
 * Persistência 100% local e segura usando SQLite.
 */
export class ApoioProjetoService implements IApoioProjetoService {
  private memoriaPreferencias: Map<string, string> = new Map();
  private tabelaCriada: boolean = false;

  private garantirTabela(db: BancoSQLiteLocal): void {
    if (this.tabelaCriada) return;
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS preferencias_app (
          chave TEXT PRIMARY KEY NOT NULL,
          valor TEXT NOT NULL
        );
      `);
      this.tabelaCriada = true;
    } catch (e) {
      console.warn('ApoioProjetoService: Falha ao garantir tabela de preferências:', e);
    }
  }

  private obterValor(chave: string): string | null {
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      this.garantirTabela(db);
      try {
        const row = db.getFirstSync<{ valor: string }>(
          'SELECT valor FROM preferencias_app WHERE chave = ?',
          [chave]
        );
        return row ? row.valor : null;
      } catch (e) {
        console.warn(`ApoioProjetoService: Erro ao ler chave ${chave}:`, e);
      }
    }
    return this.memoriaPreferencias.get(chave) ?? null;
  }

  private salvarValor(chave: string, valor: string): void {
    this.memoriaPreferencias.set(chave, valor);
    const db = gerenciadorBancoDados.obterBanco();
    if (db) {
      this.garantirTabela(db);
      try {
        db.runSync(
          'INSERT OR REPLACE INTO preferencias_app (chave, valor) VALUES (?, ?)',
          [chave, valor]
        );
      } catch (e) {
        console.warn(`ApoioProjetoService: Erro ao salvar chave ${chave}:`, e);
      }
    }
  }

  /**
   * Retorna true se o modal já tiver sido exibido alguma vez.
   * Se retornar true, o aplicativo nunca mais exibirá o pop-up.
   */
  public verificarSeJaExibiu(): boolean {
    const valor = this.obterValor(CHAVES_PREFERENCIAS_APOIO.JA_EXIBIU);
    return valor === '1';
  }

  /**
   * Marca que o modal já foi exibido, bloqueando futuras exibições permanentemente.
   */
  public marcarComoExibido(): void {
    this.salvarValor(CHAVES_PREFERENCIAS_APOIO.JA_EXIBIU, '1');
  }

  /**
   * Obtém a quantidade total de segundos de uso ativo acumulados pelo usuário.
   */
  public obterTempoUsoSegundos(): number {
    const valor = this.obterValor(CHAVES_PREFERENCIAS_APOIO.TEMPO_USO_SEGUNDOS);
    if (!valor) return 0;
    const segundos = parseInt(valor, 10);
    return isNaN(segundos) ? 0 : segundos;
  }

  /**
   * Salva a quantidade de segundos de uso ativo acumulados.
   */
  public salvarTempoUsoSegundos(segundos: number): void {
    this.salvarValor(CHAVES_PREFERENCIAS_APOIO.TEMPO_USO_SEGUNDOS, segundos.toString());
  }

  /**
   * Avalia se as condições para exibir o modal estão satisfeitas:
   * 1. Ainda não foi exibido.
   * 2. O usuário atingiu ou ultrapassou 5 minutos (300 segundos) de uso ativo.
   */
  public deveDispararModal(): boolean {
    if (this.verificarSeJaExibiu()) {
      return false;
    }
    return this.obterTempoUsoSegundos() >= TEMPO_SEGUNDOS_DISPARO_POPUP;
  }

  /**
   * Reseta as flags para testes e depuração de desenvolvimento.
   */
  public resetarStatusParaTestes(): void {
    this.salvarValor(CHAVES_PREFERENCIAS_APOIO.JA_EXIBIU, '0');
    this.salvarValor(CHAVES_PREFERENCIAS_APOIO.TEMPO_USO_SEGUNDOS, '0');
  }
}

export const apoioProjetoService = new ApoioProjetoService();
