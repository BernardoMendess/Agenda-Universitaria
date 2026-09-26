import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { tema } from '../estilos/tema';
import { CHAVE_PIX_DOACAO } from '../constantes/apoio';

interface ModalApoioProjetoProps {
  visivel: boolean;
  aoFechar: () => void;
}

export const ModalApoioProjeto: React.FC<ModalApoioProjetoProps> = ({
  visivel,
  aoFechar,
}) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopiarChave = async () => {
    await Clipboard.setStringAsync(CHAVE_PIX_DOACAO);
    setCopiado(true);
    setTimeout(() => {
      setCopiado(false);
    }, 4000);
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
    >
      <TouchableWithoutFeedback onPress={aoFechar}>
        <View style={estilos.overlay}>
          <TouchableWithoutFeedback>
            <View style={estilos.containerModal}>
              {/* Botão fechar discreto no canto */}
              <TouchableOpacity
                style={estilos.botaoFecharIcone}
                onPress={aoFechar}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Fechar pop-up"
              >
                <Ionicons name="close" size={20} color={tema.cores.corTextoSecundario} />
              </TouchableOpacity>

              {/* Ícone de Café com Brilho Dourado */}
              <View style={estilos.iconeWrapper}>
                <View style={estilos.iconeFundo}>
                  <Ionicons name="cafe" size={32} color="#eab308" />
                </View>
              </View>

              {/* Selo amigável */}
              <View style={estilos.badgeContainer}>
                <Text style={estilos.badgeTexto}>100% GRATUITO & SEM ANÚNCIOS</Text>
              </View>

              {/* Título Principal */}
              <Text style={estilos.titulo}>Gostando do App? ☕</Text>

              {/* Mensagem Explicativa */}
              <Text style={estilos.descricao}>
                O Agenda Universitária foi criado com dedicação por um estudante para ajudar na rotina acadêmica.
                {'\n\n'}
                Se ele está sendo útil para você, que tal pagar um <Text style={estilos.destaqueTexto}>cafézinho</Text> para incentivar novas melhorias? Qualquer contribuição faz muita diferença!
              </Text>

              {/* Card da Chave Pix */}
              <View style={estilos.cardChavePix}>
                <View style={estilos.linhaChaveTopo}>
                  <Text style={estilos.labelChavePix}>Chave Pix (Aleatória)</Text>
                  {copiado && (
                    <View style={estilos.tagCopiado}>
                      <Ionicons name="checkmark-circle" size={14} color="#2ea043" />
                      <Text style={estilos.textoTagCopiado}>Copiado!</Text>
                    </View>
                  )}
                </View>
                <Text style={estilos.textoChavePix} selectable>
                  {CHAVE_PIX_DOACAO}
                </Text>
              </View>

              {/* Botão Principal de Copiar Pix */}
              <TouchableOpacity
                style={[estilos.botaoCopiarPix, copiado && estilos.botaoCopiarPixSucesso]}
                onPress={handleCopiarChave}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={copiado ? 'checkmark-circle' : 'copy-outline'}
                  size={18}
                  color="#0d1117"
                  style={estilos.iconeBotao}
                />
                <Text style={estilos.textoBotaoCopiarPix}>
                  {copiado ? 'Chave Copiada! Muito Obrigado 💜' : 'Copiar Chave Pix'}
                </Text>
              </TouchableOpacity>

              {/* Botão Secundário para Fechar */}
              <TouchableOpacity
                style={estilos.botaoContinuarGratis}
                onPress={aoFechar}
                activeOpacity={0.7}
              >
                <Text style={estilos.textoBotaoContinuarGratis}>
                  Continuar usando de graça
                </Text>
              </TouchableOpacity>

              {/* Rodapé Tranquilizador */}
              <View style={estilos.divisorRodape} />
              <Text style={estilos.rodapeAviso}>
                Promessa: esta mensagem só aparece uma única vez e nunca mais. Bons estudos! 🎓
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.md,
  },
  containerModal: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: 20,
    paddingHorizontal: tema.espacamento.lg,
    paddingTop: tema.espacamento.lg + 4,
    paddingBottom: tema.espacamento.md + 4,
    borderWidth: 1.5,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    alignItems: 'center',
    position: 'relative',
  },
  botaoFecharIcone: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tema.cores.corFundoElevado,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconeWrapper: {
    marginBottom: tema.espacamento.sm,
  },
  iconeFundo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeTexto: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.titulo,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: tema.espacamento.xs,
  },
  descricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: tema.espacamento.md,
  },
  destaqueTexto: {
    color: '#eab308',
    fontWeight: '700',
  },
  cardChavePix: {
    width: '100%',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.card,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
    marginBottom: tema.espacamento.md,
  },
  linhaChaveTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelChavePix: {
    color: '#eab308',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagCopiado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoTagCopiado: {
    color: '#2ea043',
    fontSize: 11,
    fontWeight: '700',
  },
  textoChavePix: {
    color: tema.cores.corTextoPrimario,
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 0.4,
  },
  botaoCopiarPix: {
    width: '100%',
    backgroundColor: '#eab308',
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 13,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tema.espacamento.sm,
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoCopiarPixSucesso: {
    backgroundColor: '#2ea043',
  },
  iconeBotao: {
    marginRight: 8,
  },
  textoBotaoCopiarPix: {
    color: '#0d1117',
    fontSize: tema.tipografia.normal - 1,
    fontWeight: '800',
  },
  botaoContinuarGratis: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoContinuarGratis: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  divisorRodape: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginVertical: tema.espacamento.sm + 2,
  },
  rodapeAviso: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
