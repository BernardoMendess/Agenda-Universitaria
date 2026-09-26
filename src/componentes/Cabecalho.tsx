import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../estilos/tema';

interface CabecalhoProps {
  titulo: string;
  subtitulo?: string;
  aoVoltar?: () => void;
  acaoDireita?: {
    texto?: string;
    icone?: keyof typeof Ionicons.glyphMap;
    aoPressionar: () => void;
  };
}

export const Cabecalho: React.FC<CabecalhoProps> = ({
  titulo,
  subtitulo,
  aoVoltar,
  acaoDireita,
}) => {
  return (
    <View style={estilos.container}>
      <View style={estilos.linhaSuperior}>
        {aoVoltar ? (
          <TouchableOpacity
            style={estilos.botaoVoltar}
            onPress={aoVoltar}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={tema.cores.corTextoPrimario} />
          </TouchableOpacity>
        ) : null}
        
        <View style={estilos.conteudoTexto}>
          <Text style={estilos.titulo} numberOfLines={1}>{titulo}</Text>
          {subtitulo ? <Text style={estilos.subtitulo} numberOfLines={1}>{subtitulo}</Text> : null}
        </View>

        {acaoDireita ? (
          <TouchableOpacity
            style={[
              estilos.botaoAcaoDireita,
              !acaoDireita.texto && acaoDireita.icone && estilos.botaoAcaoDireitaIcone,
            ]}
            onPress={acaoDireita.aoPressionar}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {acaoDireita.icone ? (
              <Ionicons
                name={acaoDireita.icone}
                size={18}
                color={tema.cores.corTextoPrimario}
                style={acaoDireita.texto ? estilos.iconeAcaoDireita : undefined}
              />
            ) : null}
            {acaoDireita.texto ? (
              <Text style={estilos.textoAcaoDireita}>{acaoDireita.texto}</Text>
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    paddingHorizontal: tema.espacamento.md,
    paddingTop: tema.espacamento.xxl,
    paddingBottom: tema.espacamento.md + 4,
    backgroundColor: tema.cores.corFundoPrincipal,
  },
  linhaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tema.cores.sobreposicaoSutil,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tema.espacamento.smd,
  },
  conteudoTexto: {
    flex: 1,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.titulo,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginTop: 2,
  },
  botaoAcaoDireita: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tema.espacamento.sm + 2,
    paddingHorizontal: tema.espacamento.md,
    borderRadius: tema.raioBorda.padrao,
    minHeight: 40,
  },
  botaoAcaoDireitaIcone: {
    paddingHorizontal: tema.espacamento.sm + 2,
    borderRadius: tema.raioBorda.redondo,
  },
  iconeAcaoDireita: {
    marginRight: tema.espacamento.xs,
  },
  textoAcaoDireita: {
    color: tema.cores.corTextoPrimario,
    fontWeight: '600',
    fontSize: tema.tipografia.pequeno,
  },
});

