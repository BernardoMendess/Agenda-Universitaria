import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { tema } from '../estilos/tema';

interface CabecalhoProps {
  titulo: string;
  subtitulo?: string;
  aoVoltar?: () => void;
  acaoDireita?: {
    texto: string;
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
          >
            <Text style={estilos.textoVoltar}>←</Text>
          </TouchableOpacity>
        ) : null}
        
        <View style={estilos.conteudoTexto}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
        </View>

        {acaoDireita ? (
          <TouchableOpacity
            style={estilos.botaoAcaoDireita}
            onPress={acaoDireita.aoPressionar}
            accessibilityRole="button"
          >
            <Text style={estilos.textoAcaoDireita}>{acaoDireita.texto}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    paddingHorizontal: tema.espacamento.md,
    paddingTop: tema.espacamento.lg,
    paddingBottom: tema.espacamento.md,
    backgroundColor: tema.cores.corFundoPrincipal,
  },
  linhaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoVoltar: {
    paddingRight: tema.espacamento.md,
    paddingVertical: tema.espacamento.xs,
  },
  textoVoltar: {
    color: tema.cores.corTextoPrimario,
    fontSize: 24,
    fontWeight: 'bold',
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
    marginTop: tema.espacamento.xs,
  },
  botaoAcaoDireita: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingVertical: tema.espacamento.xs,
    paddingHorizontal: tema.espacamento.md,
    borderRadius: tema.raioBorda.padrao,
  },
  textoAcaoDireita: {
    color: tema.cores.corTextoPrimario,
    fontWeight: '600',
    fontSize: tema.tipografia.pequeno,
  },
});
