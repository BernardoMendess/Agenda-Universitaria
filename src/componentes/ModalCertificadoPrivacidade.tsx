import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { CertificadoPrivacidade } from '../modelos/Privacidade';
import { tema } from '../estilos/tema';

interface PropsModalCertificadoPrivacidade {
  visivel: boolean;
  certificado?: CertificadoPrivacidade | null;
  aoFechar: () => void;
}

export const ModalCertificadoPrivacidade: React.FC<PropsModalCertificadoPrivacidade> = ({
  visivel,
  certificado,
  aoFechar,
}) => {
  if (!certificado) return null;

  return (
    <Modal
      visible={visivel}
      transparent={true}
      animationType="slide"
      onRequestClose={aoFechar}
    >
      <SafeAreaView style={estilos.overlay}>
        <View style={estilos.container}>
          {/* Cabeçalho do Modal */}
          <View style={estilos.cabecalho}>
            <View style={estilos.cabecalhoTextos}>
              <Text style={estilos.titulo}>Certificado de Privacidade</Text>
              <Text style={estilos.subtitulo}>RNF05 • Soberania & Isolamento Total</Text>
            </View>
            <TouchableOpacity
              style={estilos.botaoFecharIcone}
              onPress={aoFechar}
              accessibilityRole="button"
              accessibilityLabel="Fechar certificado de privacidade"
            >
              <Text style={estilos.textoFecharIcone}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={estilos.conteudo}
            showsVerticalScrollIndicator={false}
          >
            {/* Selo e ID */}
            <View style={estilos.cardSelo}>
              <View style={estilos.badgeStatus}>
                <Text style={estilos.textoBadgeStatus}>✓ AUDITADO & CERTIFICADO</Text>
              </View>
              <Text style={estilos.idCertificado}>{certificado.idCertificado}</Text>
              <Text style={estilos.dataEmissao}>
                Emitido em: {new Date(certificado.emissao).toLocaleString('pt-BR')}
              </Text>
            </View>

            {/* Garantias de Segurança */}
            <Text style={estilos.secaoTitulo}>Garantias do Protocolo RNF05</Text>
            <View style={estilos.cardGarantias}>
              {certificado.garantias.map((garantia, index) => (
                <View key={index} style={estilos.itemGarantia}>
                  <Text style={estilos.iconeGarantia}>🔒</Text>
                  <Text style={estilos.textoGarantia}>{garantia}</Text>
                </View>
              ))}
            </View>

            {/* Inventário de Dados na Sandbox */}
            <Text style={estilos.secaoTitulo}>Inventário de Dados na Sandbox Local</Text>
            <View style={estilos.cardInventario}>
              {certificado.inventario.map((item, index) => (
                <View
                  key={index}
                  style={[
                    estilos.linhaInventario,
                    index > 0 && estilos.bordaLinhaInventario,
                  ]}
                >
                  <View style={estilos.colunaInventarioPrincipal}>
                    <Text style={estilos.nomeCategoria}>{item.categoria}</Text>
                    <Text style={estilos.descricaoCategoria}>{item.descricao}</Text>
                    <Text style={estilos.tabelaLocal}>
                      Tabela: <Text style={estilos.mono}>{item.tabelaLocal}</Text> •{' '}
                      {item.armazenamento}
                    </Text>
                  </View>
                  <View style={estilos.colunaInventarioBadge}>
                    <Text style={estilos.totalRegistrosBadge}>
                      {item.totalRegistros}
                    </Text>
                    <Text style={estilos.statusIsoladoTexto}>Local</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Hash Criptográfico de Auditoria */}
            <View style={estilos.cardHash}>
              <Text style={estilos.rotuloHash}>Hash de Verificação Offline:</Text>
              <Text style={estilos.textoHash}>{certificado.hashAuditoria}</Text>
            </View>
          </ScrollView>

          {/* Botão de Fechamento */}
          <View style={estilos.rodape}>
            <TouchableOpacity
              style={estilos.botaoConcluir}
              onPress={aoFechar}
              activeOpacity={0.8}
            >
              <Text style={estilos.textoBotaoConcluir}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    padding: tema.espacamento.sm,
  },
  container: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tema.espacamento.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  cabecalhoTextos: {
    flex: 1,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  botaoFecharIcone: {
    padding: 6,
  },
  textoFecharIcone: {
    color: tema.cores.corTextoSecundario,
    fontSize: 18,
  },
  conteudo: {
    padding: tema.espacamento.md,
  },
  cardSelo: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: tema.espacamento.md,
  },
  badgeStatus: {
    backgroundColor: tema.cores.corStatusSeguro,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tema.raioBorda.redondo,
    marginBottom: tema.espacamento.xs,
  },
  textoBadgeStatus: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  idCertificado: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  dataEmissao: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    marginTop: 2,
  },
  secaoTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
    marginTop: tema.espacamento.sm,
    marginBottom: tema.espacamento.xs + 2,
  },
  cardGarantias: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: tema.espacamento.md,
  },
  itemGarantia: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  iconeGarantia: {
    fontSize: 13,
    marginTop: 1,
  },
  textoGarantia: {
    flex: 1,
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    lineHeight: 16,
  },
  cardInventario: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: tema.espacamento.md,
  },
  linhaInventario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tema.espacamento.sm,
  },
  bordaLinhaInventario: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  colunaInventarioPrincipal: {
    flex: 1,
    paddingRight: 8,
  },
  nomeCategoria: {
    color: tema.cores.corTextoPrimario,
    fontSize: 11,
    fontWeight: 'bold',
  },
  descricaoCategoria: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 1,
  },
  tabelaLocal: {
    color: '#6e7681',
    fontSize: 9,
    marginTop: 2,
  },
  mono: {
    fontFamily: 'monospace',
    color: tema.cores.corMarcaPrimaria,
  },
  colunaInventarioBadge: {
    alignItems: 'center',
    minWidth: 40,
  },
  totalRegistrosBadge: {
    color: tema.cores.corTextoPrimario,
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusIsoladoTexto: {
    color: tema.cores.corStatusSeguro,
    fontSize: 9,
    fontWeight: '600',
  },
  cardHash: {
    backgroundColor: '#0d1117',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: '#21262d',
    marginBottom: tema.espacamento.sm,
  },
  rotuloHash: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
  },
  textoHash: {
    color: '#58a6ff',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  rodape: {
    padding: tema.espacamento.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  botaoConcluir: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textoBotaoConcluir: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
});
