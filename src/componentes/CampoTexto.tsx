import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { tema } from '../estilos/tema';

interface CampoTextoProps extends TextInputProps {
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  dica?: string;
  valor?: string;
  aoMudarTexto?: (texto: string) => void;
  type?: string;
  quantidadeLinhas?: number;
}

export const CampoTexto: React.FC<CampoTextoProps> = ({
  rotulo,
  obrigatorio,
  erro,
  dica,
  style,
  valor,
  value,
  aoMudarTexto,
  onChangeText,
  type,
  quantidadeLinhas,
  ...outrasProps
}) => {
  return (
    <View style={estilos.container}>
      <View style={estilos.linhaRotulo}>
        <Text style={estilos.rotulo}>
          {rotulo}
          {obrigatorio ? <Text style={estilos.obrigatorio}> *</Text> : null}
        </Text>
      </View>

      <TextInput
        style={[
          estilos.input,
          erro ? estilos.inputErro : null,
          style,
        ]}
        placeholderTextColor={tema.cores.corTextoSecundario}
        selectionColor={tema.cores.corMarcaPrimaria}
        value={valor !== undefined ? valor : value}
        onChangeText={aoMudarTexto || onChangeText}
        numberOfLines={quantidadeLinhas || outrasProps.numberOfLines}
        {...(type ? ({ type } as any) : {})}
        {...outrasProps}
      />

      {erro ? (
        <Text style={estilos.textoErro}>{erro}</Text>
      ) : dica ? (
        <Text style={estilos.textoDica}>{dica}</Text>
      ) : null}
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    marginBottom: tema.espacamento.md,
  },
  linhaRotulo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tema.espacamento.xs,
  },
  rotulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '500',
  },
  obrigatorio: {
    color: tema.cores.corStatusCritico,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: tema.cores.corFundoElevado,
    color: tema.cores.corTextoPrimario,
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm + 4,
    fontSize: tema.tipografia.normal,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputErro: {
    borderColor: tema.cores.corStatusCritico,
  },
  textoErro: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    marginTop: tema.espacamento.xs,
  },
  textoDica: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: tema.espacamento.xs,
  },
});
