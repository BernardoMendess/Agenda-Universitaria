import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Botao } from './Botao';
import { tema } from '../estilos/tema';

interface ModalConfirmacaoProps {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  carregando?: boolean;
}

export const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  visivel,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  aoConfirmar,
  aoCancelar,
  carregando = false,
}) => {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoCancelar}
    >
      <TouchableWithoutFeedback onPress={aoCancelar}>
        <View style={estilos.overlay}>
          <TouchableWithoutFeedback>
            <View style={estilos.containerModal}>
              <Text style={estilos.titulo}>{titulo}</Text>
              <Text style={estilos.mensagem}>{mensagem}</Text>

              <View style={estilos.linhaBotoes}>
                <Botao
                  titulo={textoCancelar}
                  aoPressionar={aoCancelar}
                  variante="contorno"
                  estilo={estilos.botao}
                  desabilitado={carregando}
                />
                <Botao
                  titulo={textoConfirmar}
                  aoPressionar={aoConfirmar}
                  variante="perigo"
                  estilo={estilos.botao}
                  carregando={carregando}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.md,
  },
  containerModal: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.lg,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
    marginBottom: tema.espacamento.sm,
  },
  mensagem: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.normal,
    lineHeight: 22,
    marginBottom: tema.espacamento.lg,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: tema.espacamento.md,
  },
  botao: {
    flex: 1,
  },
});
