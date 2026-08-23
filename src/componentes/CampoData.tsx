import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModalSeletorData } from './ModalSeletorData';
import { tema } from '../estilos/tema';

interface CampoDataProps {
  rotulo: string;
  valor?: string; // Formato AAAA-MM-DD
  aoSelecionarData: (dataStr: string) => void;
  placeholder?: string;
  obrigatorio?: boolean;
  erro?: string;
  dica?: string;
  permiteLimpar?: boolean;
  tituloModal?: string;
}

const MESES_ABREV = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export const CampoData: React.FC<CampoDataProps> = ({
  rotulo,
  valor,
  aoSelecionarData,
  placeholder = 'Selecione a data no calendário...',
  obrigatorio,
  erro,
  dica,
  permiteLimpar = false,
  tituloModal,
}) => {
  const [modalAberto, setModalAberto] = useState(false);

  // Formatação amigável para exibição
  const textoExibicao = useMemo(() => {
    if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return '';
    const [ano, mes, dia] = valor.split('-').map(Number);
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano} (${dia} de ${MESES_ABREV[mes - 1]})`;
  }, [valor]);

  return (
    <View style={estilos.container}>
      <View style={estilos.linhaRotulo}>
        <Text style={estilos.rotulo}>
          {rotulo}
          {obrigatorio ? <Text style={estilos.obrigatorio}> *</Text> : null}
        </Text>
      </View>

      <TouchableOpacity
        style={[estilos.campoToque, erro ? estilos.campoErro : null]}
        onPress={() => setModalAberto(true)}
        activeOpacity={0.7}
      >
        <Text style={[estilos.textoValor, !textoExibicao ? estilos.textoPlaceholder : null]}>
          {textoExibicao || placeholder}
        </Text>
      </TouchableOpacity>

      {erro ? (
        <Text style={estilos.textoErro}>{erro}</Text>
      ) : dica ? (
        <Text style={estilos.textoDica}>{dica}</Text>
      ) : null}

      <ModalSeletorData
        visivel={modalAberto}
        dataSelecionada={valor}
        titulo={tituloModal || rotulo}
        permiteLimpar={permiteLimpar}
        aoFechar={() => setModalAberto(false)}
        aoConfirmar={(novaData) => {
          aoSelecionarData(novaData);
        }}
      />
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
  campoToque: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm + 4,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  campoErro: {
    borderColor: tema.cores.corStatusCritico,
  },
  textoValor: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    flex: 1,
  },
  textoPlaceholder: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
  },
  botaoIcone: {
    marginLeft: tema.espacamento.sm,
    paddingLeft: tema.espacamento.xs,
  },
  iconeTexto: {
    fontSize: 16,
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
