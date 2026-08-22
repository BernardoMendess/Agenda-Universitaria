import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { tema } from '../estilos/tema';

interface ModalAlertaFaltasCriticoProps {
  visivel: boolean;
  disciplinaNome: string;
  limiteMaximoFaltas: number;
  totalFaltas: number;
  reprovadoPorFalta: boolean;
  aoFechar: () => void;
  aoAbrirHistorico?: () => void;
}

export const ModalAlertaFaltasCritico: React.FC<ModalAlertaFaltasCriticoProps> = ({
  visivel,
  disciplinaNome,
  limiteMaximoFaltas,
  totalFaltas,
  reprovadoPorFalta,
  aoFechar,
  aoAbrirHistorico,
}) => {
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
              {/* Ícone de Alerta Crítico no Topo */}
              <View style={estilos.iconeContainer}>
                <Text style={estilos.iconeTexto}>!</Text>
              </View>

              {/* Título de Emergência */}
              <Text style={estilos.titulo}>
                {reprovadoPorFalta
                  ? 'Reprovado por Faltas!'
                  : 'Limite de Faltas Atingido!'}
              </Text>

              {/* Nome da Disciplina */}
              <Text style={estilos.subtitulo}>{disciplinaNome}</Text>

              {/* Painel com Indicador Numérico de Faltas */}
              <View style={estilos.painelFaltas}>
                <View style={estilos.itemFalta}>
                  <Text style={estilos.rotuloPainel}>Faltas Registradas</Text>
                  <Text
                    style={[
                      estilos.valorPainel,
                      { color: tema.cores.corStatusCritico },
                    ]}
                  >
                    {totalFaltas}
                  </Text>
                </View>

                <View style={estilos.divisorVertical} />

                <View style={estilos.itemFalta}>
                  <Text style={estilos.rotuloPainel}>Limite Permitido</Text>
                  <Text style={estilos.valorPainel}>{limiteMaximoFaltas}</Text>
                </View>
              </View>

              {/* Mensagem de Orientações */}
              <View style={estilos.cardMensagem}>
                <Text style={estilos.textoMensagem}>
                  {reprovadoPorFalta
                    ? 'Você ultrapassou a tolerância máxima permitida para esta disciplina. Caso tenha atestados médicos ou justificativas legais, apresente-os à secretaria o quanto antes.'
                    : 'Atenção máxima: seu saldo de faltas restantes chegou a ZERO. Qualquer nova falta causará a sua reprovação imediata por frequência (RF04/RF10).'}
                </Text>
              </View>

              {/* Ações do Modal */}
              <View style={estilos.botoesContainer}>
                {aoAbrirHistorico && (
                  <TouchableOpacity
                    style={estilos.botaoSecundario}
                    onPress={() => {
                      aoFechar();
                      aoAbrirHistorico();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={estilos.textoBotaoSecundario}>
                      Ver Histórico
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={estilos.botaoPrincipal}
                  onPress={aoFechar}
                  activeOpacity={0.8}
                >
                  <Text style={estilos.textoBotaoPrincipal}>Entendi</Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.md,
  },
  containerModal: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    borderWidth: 1.5,
    borderColor: 'rgba(248, 81, 73, 0.6)',
    padding: tema.espacamento.lg,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderWidth: 1.5,
    borderColor: tema.cores.corStatusCritico,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tema.espacamento.sm,
  },
  iconeTexto: {
    fontSize: 28,
  },
  titulo: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: tema.espacamento.md,
    textAlign: 'center',
  },
  painelFaltas: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: tema.espacamento.sm,
    paddingHorizontal: tema.espacamento.md,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  itemFalta: {
    alignItems: 'center',
    flex: 1,
  },
  rotuloPainel: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  valorPainel: {
    color: tema.cores.corTextoPrimario,
    fontSize: 22,
    fontWeight: 'bold',
  },
  divisorVertical: {
    width: 1,
    height: 30,
    backgroundColor: '#30363d',
  },
  cardMensagem: {
    backgroundColor: 'rgba(248, 81, 73, 0.08)',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.25)',
    marginBottom: tema.espacamento.lg,
    width: '100%',
  },
  textoMensagem: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro + 1,
    lineHeight: 18,
    textAlign: 'center',
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: tema.espacamento.sm,
    width: '100%',
  },
  botaoSecundario: {
    flex: 1,
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  textoBotaoSecundario: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoPrincipal: {
    flex: 1,
    backgroundColor: tema.cores.corStatusCritico,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoPrincipal: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
});
