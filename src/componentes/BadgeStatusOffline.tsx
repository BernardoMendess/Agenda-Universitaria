import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { tema } from '../estilos/tema';
import { zeroConectividadeService } from '../servicos/ZeroConectividadeService';

interface BadgeStatusOfflineProps {
  mostrarDetalhesAoClicar?: boolean;
  tamanho?: 'pequeno' | 'medio';
}

/**
 * Componente que exibe visualmente o status de conformidade do RNF01 (Zero Conectividade).
 */
export const BadgeStatusOffline: React.FC<BadgeStatusOfflineProps> = ({
  mostrarDetalhesAoClicar = true,
  tamanho = 'medio',
}) => {
  const tratarClique = () => {
    if (!mostrarDetalhesAoClicar) return;

    const status = zeroConectividadeService.obterStatus();
    Alert.alert(
      'Modo 100% Offline (RNF01)',
      `O CampusFlow opera de forma totalmente isolada:\n\n` +
      `• Modo: ${status.modo}\n` +
      `• Chamadas externas: Bloqueadas (${status.conectividadeExternaPermitida ? 'Sim' : 'Não'})\n` +
      `• Privacidade: Garantida (0 envio de dados)\n` +
      `• Armazenamento: Estritamente local\n\n` +
      `Seus dados acadêmicos nunca saem do seu aparelho.`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const estilosTamanho = tamanho === 'pequeno' ? estilos.containerPequeno : estilos.containerMedio;
  const estilosTexto = tamanho === 'pequeno' ? estilos.textoPequeno : estilos.textoMedio;
  const estilosPonto = tamanho === 'pequeno' ? estilos.pontoPequeno : estilos.pontoMedio;

  return (
    <TouchableOpacity
      activeOpacity={mostrarDetalhesAoClicar ? 0.7 : 1}
      onPress={tratarClique}
      style={[estilos.container, estilosTamanho]}
      accessibilityRole="button"
      accessibilityLabel="Status de conexão: 100% Offline"
      accessibilityHint="Toque para ver informações sobre o isolamento e privacidade dos seus dados"
    >
      <View style={[estilos.pontoStatus, estilosPonto]} />
      <Text style={[estilos.texto, estilosTexto]}>100% Offline</Text>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoElevado,
    borderColor: '#2ea04340',
    borderWidth: 1,
    borderRadius: tema.raioBorda.redondo,
    alignSelf: 'flex-start',
  },
  containerMedio: {
    paddingHorizontal: tema.espacamento.sm + 2,
    paddingVertical: tema.espacamento.xs,
  },
  containerPequeno: {
    paddingHorizontal: tema.espacamento.sm,
    paddingVertical: 2,
  },
  pontoStatus: {
    backgroundColor: tema.cores.corStatusSeguro,
    borderRadius: tema.raioBorda.redondo,
  },
  pontoMedio: {
    width: 7,
    height: 7,
    marginRight: 6,
  },
  pontoPequeno: {
    width: 6,
    height: 6,
    marginRight: 4,
  },
  texto: {
    color: tema.cores.corTextoPrimario,
    fontWeight: '600',
  },
  textoMedio: {
    fontSize: tema.tipografia.micro,
  },
  textoPequeno: {
    fontSize: 11,
  },
});
