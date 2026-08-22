import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { tema } from '../estilos/tema';

interface SeletorCorProps {
  corSelecionada: string;
  aoSelecionarCor: (cor: string) => void;
}

export const SeletorCor: React.FC<SeletorCorProps> = ({
  corSelecionada,
  aoSelecionarCor,
}: SeletorCorProps) => {
  return (
    <View style={estilos.container}>
      <Text style={estilos.rotulo}>Cor de Identificação Visual</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.listaCores}
      >
        {tema.cores.paletaDisciplinas.map((cor) => {
          const selecionada = cor.toLowerCase() === corSelecionada.toLowerCase();
          return (
            <TouchableOpacity
              key={cor}
              style={[
                estilos.opcaoCor,
                { backgroundColor: cor },
                selecionada ? estilos.opcaoSelecionada : null,
              ]}
              onPress={() => aoSelecionarCor(cor)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar cor ${cor}`}
            >
              {selecionada ? <View style={estilos.indicadorInterno} /> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    marginBottom: tema.espacamento.md,
  },
  rotulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '500',
    marginBottom: tema.espacamento.sm,
  },
  listaCores: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tema.espacamento.sm,
    paddingVertical: tema.espacamento.xs,
  },
  opcaoCor: {
    width: 36,
    height: 36,
    borderRadius: tema.raioBorda.redondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoSelecionada: {
    borderWidth: 3,
    borderColor: tema.cores.corTextoPrimario,
    transform: [{ scale: 1.1 }],
  },
  indicadorInterno: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
});
