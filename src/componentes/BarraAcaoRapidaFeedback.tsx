import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { FeedbackAcaoRapida } from '../servicos/AcoesRapidasService';
import { tema } from '../estilos/tema';

interface BarraAcaoRapidaFeedbackProps {
  feedback: FeedbackAcaoRapida | null;
  aoDesfazer: () => void;
  aoFechar: () => void;
  duracaoMs?: number;
}

export const BarraAcaoRapidaFeedback: React.FC<BarraAcaoRapidaFeedbackProps> = ({
  feedback,
  aoDesfazer,
  aoFechar,
  duracaoMs = 4000,
}) => {
  const animacaoOpacidade = useRef(new Animated.Value(0)).current;
  const animacaoTranslacao = useRef(new Animated.Value(20)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (feedback) {
      // Inicia animação de entrada
      Animated.parallel([
        Animated.timing(animacaoOpacidade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(animacaoTranslacao, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      // Configura fechamento automático
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        esconderEFechar();
      }, duracaoMs);
    } else {
      animacaoOpacidade.setValue(0);
      animacaoTranslacao.setValue(20);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [feedback]);

  const esconderEFechar = () => {
    Animated.parallel([
      Animated.timing(animacaoOpacidade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(animacaoTranslacao, {
        toValue: 20,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      aoFechar();
    });
  };

  if (!feedback) return null;

  const ehAlerta = feedback.tipo === 'ALERTA';
  const corBorda = ehAlerta
    ? tema.cores.corStatusCritico
    : tema.cores.corMarcaPrimaria;

  return (
    <Animated.View
      style={[
        estilos.containerFlutuante,
        {
          opacity: animacaoOpacidade,
          transform: [{ translateY: animacaoTranslacao }],
          borderColor: corBorda,
        },
      ]}
    >
      <View style={estilos.conteudo}>
        {/* Ícone ou Marcador */}
        <View
          style={[
            estilos.iconeIndicador,
            {
              backgroundColor: ehAlerta
                ? `${tema.cores.corStatusCritico}30`
                : `${tema.cores.corStatusSeguro}30`,
            },
          ]}
        >
          <Text
            style={[
              estilos.textoIcone,
              {
                color: ehAlerta
                  ? tema.cores.corStatusCritico
                  : tema.cores.corStatusSeguro,
              },
            ]}
          >
            {ehAlerta ? '!' : '✓'}
          </Text>
        </View>

        {/* Mensagem descritiva */}
        <Text style={estilos.mensagem} numberOfLines={2}>
          {feedback.mensagem}
        </Text>

        {/* Botão de Ação Desfazer em 1 Toque */}
        {feedback.podeDesfazer && (
          <TouchableOpacity
            style={estilos.botaoDesfazer}
            onPress={() => {
              aoDesfazer();
              esconderEFechar();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Desfazer ação"
          >
            <Text style={estilos.textoDesfazer}>Desfazer</Text>
          </TouchableOpacity>
        )}

        {/* Botão Fechar */}
        <TouchableOpacity
          style={estilos.botaoFechar}
          onPress={esconderEFechar}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
        >
          <Text style={estilos.textoFechar}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const estilos = StyleSheet.create({
  containerFlutuante: {
    position: 'absolute',
    bottom: 24,
    left: tema.espacamento.md,
    right: tema.espacamento.md,
    backgroundColor: '#1c2128',
    borderRadius: tema.raioBorda.card,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: 12,
    gap: 10,
  },
  iconeIndicador: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoIcone: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  mensagem: {
    flex: 1,
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro + 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  botaoDesfazer: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}25`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoDesfazer: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
  },
  botaoFechar: {
    padding: 4,
    marginLeft: 2,
  },
  textoFechar: {
    color: tema.cores.corTextoSecundario,
    fontSize: 12,
    fontWeight: '600',
  },
});
