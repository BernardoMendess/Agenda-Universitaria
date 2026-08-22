import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { tema } from '../estilos/tema';

type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'contorno';

interface BotaoProps {
  titulo: string;
  aoPressionar: () => void;
  variante?: VarianteBotao;
  carregando?: boolean;
  desabilitado?: boolean;
  estilo?: ViewStyle;
  estiloTexto?: TextStyle;
}

export const Botao: React.FC<BotaoProps> = ({
  titulo,
  aoPressionar,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  estilo,
  estiloTexto,
}) => {
  const obterEstiloVariante = () => {
    switch (variante) {
      case 'secundario':
        return estilos.botaoSecundario;
      case 'perigo':
        return estilos.botaoPerigo;
      case 'contorno':
        return estilos.botaoContorno;
      case 'primario':
      default:
        return estilos.botaoPrimario;
    }
  };

  const obterEstiloTextoVariante = () => {
    switch (variante) {
      case 'contorno':
        return estilos.textoContorno;
      case 'secundario':
        return estilos.textoSecundario;
      default:
        return estilos.textoPrimario;
    }
  };

  return (
    <TouchableOpacity
      style={[
        estilos.base,
        obterEstiloVariante(),
        desabilitado ? estilos.desabilitado : null,
        estilo,
      ]}
      onPress={aoPressionar}
      disabled={desabilitado || carregando}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      {carregando ? (
        <ActivityIndicator color={tema.cores.corTextoPrimario} size="small" />
      ) : (
        <Text style={[estilos.textoBase, obterEstiloTextoVariante(), estiloTexto]}>
          {titulo}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: tema.raioBorda.padrao,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tema.espacamento.md,
    flexDirection: 'row',
  },
  botaoPrimario: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  botaoSecundario: {
    backgroundColor: tema.cores.corFundoElevado,
  },
  botaoPerigo: {
    backgroundColor: tema.cores.corStatusCritico,
  },
  botaoContorno: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
  },
  desabilitado: {
    opacity: 0.5,
  },
  textoBase: {
    fontSize: tema.tipografia.normal,
    fontWeight: '600',
  },
  textoPrimario: {
    color: tema.cores.corTextoPrimario,
  },
  textoSecundario: {
    color: tema.cores.corTextoSecundario,
  },
  textoContorno: {
    color: tema.cores.corTextoPrimario,
  },
});
