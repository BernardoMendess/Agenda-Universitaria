import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RelatorioAuditoriaPrivacidade } from '../modelos/Privacidade';
import { BadgeStatusOffline } from './BadgeStatusOffline';
import { tema } from '../estilos/tema';

interface PropsCardPrivacidadeTotal {
  relatorio?: RelatorioAuditoriaPrivacidade | null;
  aoPressionarVerCertificado?: () => void;
}

export const CardPrivacidadeTotal: React.FC<PropsCardPrivacidadeTotal> = ({
  relatorio,
  aoPressionarVerCertificado,
}) => {
  const totalItens = relatorio?.totalItensLocais ?? 0;

  return (
    <View
      style={estilos.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel="Card de Privacidade Total RNF05. Dados confinados no aparelho com zero telemetria."
    >
      <View style={estilos.linhaTopo}>
        <View style={estilos.titulosContainer}>
          <Text style={estilos.titulo}>Privacidade Total</Text>
          <Text style={estilos.subtitulo}>Protocolo RNF05 • Zero Exfiltração</Text>
        </View>
        <BadgeStatusOffline tamanho="pequeno" />
      </View>

      <Text style={estilos.descricao}>
        Nenhum dado acadêmico, pessoal ou estatístico sai do seu aparelho. O CampusFlow não
        possui telemetria, cookies nem contas na nuvem. Todos os{' '}
        <Text style={estilos.textoDestaque}>{totalItens} registros</Text> estão na sua sandbox local.
      </Text>

      <View style={estilos.caixaGarantias}>
        <View style={estilos.linhaGarantia}>
          <Text style={estilos.rotuloGarantia}>Tráfego Externo:</Text>
          <Text style={[estilos.valorGarantia, { color: tema.cores.corStatusSeguro }]}>
            0 Bytes (Bloqueado)
          </Text>
        </View>
        <View style={estilos.linhaGarantia}>
          <Text style={estilos.rotuloGarantia}>Telemetria / Analytics:</Text>
          <Text style={estilos.valorGarantia}>0 SDKs Embutidos</Text>
        </View>
        <View style={estilos.linhaGarantia}>
          <Text style={estilos.rotuloGarantia}>Armazenamento:</Text>
          <Text style={estilos.valorGarantia}>campusflow.db (SQLite)</Text>
        </View>
      </View>

      {aoPressionarVerCertificado && (
        <TouchableOpacity
          style={estilos.botaoCertificado}
          onPress={aoPressionarVerCertificado}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Abrir Certificado de Auditoria de Privacidade Total"
        >
          <Text style={estilos.textoBotaoCertificado}>
            📜 Abrir Certificado de Privacidade (RNF05)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(99, 102, 241, 0.07)',
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: tema.espacamento.md,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: tema.espacamento.xs,
  },
  titulosContainer: {
    flex: 1,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  descricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    lineHeight: 17,
    marginVertical: tema.espacamento.sm,
  },
  textoDestaque: {
    color: tema.cores.corTextoPrimario,
    fontWeight: 'bold',
  },
  caixaGarantias: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  linhaGarantia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotuloGarantia: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
  },
  valorGarantia: {
    color: tema.cores.corTextoPrimario,
    fontSize: 11,
    fontWeight: '600',
  },
  botaoCertificado: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoBotaoCertificado: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
});
