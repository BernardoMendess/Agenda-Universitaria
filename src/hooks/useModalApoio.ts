import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { apoioProjetoService } from '../servicos/ApoioProjetoService';
import { TEMPO_SEGUNDOS_DISPARO_POPUP } from '../constantes/apoio';

interface UseModalApoioRetorno {
  modalVisivel: boolean;
  fecharModal: () => void;
}

/**
 * Hook responsável por contabilizar o tempo ativo de uso do aplicativo e
 * disparar o pop-up de apoio exatamente uma vez após 10 minutos (600s) de uso.
 *
 * Características:
 * - Contabiliza apenas quando o app está em primeiro plano (AppState === 'active').
 * - Acumula o tempo entre diferentes sessões e reaberturas do app.
 * - Salva periodicamente no SQLite local.
 * - Uma vez exibido ou dispensado, NUNCA mais é reexibido (zero overhead futuro).
 */
export const useModalApoio = (): UseModalApoioRetorno => {
  const [modalVisivel, setModalVisivel] = useState(false);
  const segundosRef = useRef<number>(0);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);

  const fecharModal = useCallback(() => {
    setModalVisivel(false);
    apoioProjetoService.marcarComoExibido();
  }, []);

  useEffect(() => {
    // Se o modal já foi exibido alguma vez no passado, não faz nada
    if (apoioProjetoService.verificarSeJaExibiu()) {
      return;
    }

    // Carrega tempo acumulado prévio do SQLite
    const tempoInicial = apoioProjetoService.obterTempoUsoSegundos();
    segundosRef.current = tempoInicial;

    // Se já tiver atingido 10 minutos em sessões anteriores
    if (tempoInicial >= TEMPO_SEGUNDOS_DISPARO_POPUP) {
      setModalVisivel(true);
      apoioProjetoService.marcarComoExibido();
      return;
    }

    const pararContador = () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      apoioProjetoService.salvarTempoUsoSegundos(segundosRef.current);
    };

    const iniciarContador = () => {
      if (intervaloRef.current) return;

      intervaloRef.current = setInterval(() => {
        // Apenas contabiliza se estiver ativo
        if (AppState.currentState === 'active') {
          segundosRef.current += 1;

          // Salva no banco a cada 10 segundos para persistir progresso
          if (segundosRef.current % 10 === 0) {
            apoioProjetoService.salvarTempoUsoSegundos(segundosRef.current);
          }

          // Atingiu 10 minutos de uso ativo!
          if (segundosRef.current >= TEMPO_SEGUNDOS_DISPARO_POPUP) {
            setModalVisivel(true);
            apoioProjetoService.marcarComoExibido();
            pararContador();
          }
        }
      }, 1000);
    };

    // Inicia se o app estiver em primeiro plano
    if (AppState.currentState === 'active') {
      iniciarContador();
    }

    // Monitora transições de estado do app (foreground / background)
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          if (!apoioProjetoService.verificarSeJaExibiu()) {
            iniciarContador();
          }
        } else {
          pararContador();
        }
      }
    );

    return () => {
      pararContador();
      subscription.remove();
    };
  }, []);

  return {
    modalVisivel,
    fecharModal,
  };
};
