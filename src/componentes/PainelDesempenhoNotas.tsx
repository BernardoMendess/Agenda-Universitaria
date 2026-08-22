import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ResumoDesempenhoDisciplina } from '../modelos/Avaliacao';
import { tema } from '../estilos/tema';

interface PainelDesempenhoNotasProps {
  resumo: ResumoDesempenhoDisciplina | undefined;
  carregando?: boolean;
}

const corStatus = (status: ResumoDesempenhoDisciplina['statusAprovacao']) => {
  switch (status) {
    case 'APROVADO':
      return tema.cores.corStatusSeguro;
    case 'EM_RISCO':
      return tema.cores.corStatusAlerta;
    case 'REPROVADO_POR_NOTA':
      return tema.cores.corStatusCritico;
    default:
      return tema.cores.corMarcaPrimaria;
  }
};

const labelStatus = (status: ResumoDesempenhoDisciplina['statusAprovacao']) => {
  switch (status) {
    case 'APROVADO':
      return 'Aprovado';
    case 'EM_RISCO':
      return 'Em Risco';
    case 'REPROVADO_POR_NOTA':
      return 'Reprovado';
    default:
      return 'Em Curso';
  }
};

export const PainelDesempenhoNotas: React.FC<PainelDesempenhoNotasProps> = ({
  resumo,
  carregando,
}) => {
  if (!resumo || carregando) {
    return (
      <View style={estilos.painel}>
        <Text style={estilos.rotuloSecao}>Desempenho de Notas</Text>
        <Text style={estilos.textoVazio}>
          {carregando ? 'Carregando...' : 'Nenhuma avaliação cadastrada ainda.'}
        </Text>
      </View>
    );
  }

  const cor = corStatus(resumo.statusAprovacao);
  const label = labelStatus(resumo.statusAprovacao);

  return (
    <View style={estilos.painel}>
      <Text style={estilos.rotuloSecao}>Desempenho de Notas</Text>

      {/* Faixa de status */}
      <View style={[estilos.faixaStatus, { backgroundColor: `${cor}15`, borderColor: `${cor}40` }]}>
        <View style={estilos.mediaContainer}>
          <Text style={[estilos.mediaValor, { color: cor }]}>
            {resumo.mediaAtual !== null ? resumo.mediaAtual.toFixed(1) : '—'}
          </Text>
          <Text style={estilos.mediaRotulo}>Média atual</Text>
        </View>

        <View style={estilos.separadorVertical} />

        <View style={estilos.statusContainer}>
          <View style={[estilos.badgeStatus, { backgroundColor: `${cor}25`, borderColor: cor }]}>
            <Text style={[estilos.badgeStatusTexto, { color: cor }]}>{label}</Text>
          </View>
          <Text style={estilos.metaTexto}>Meta: {resumo.notaMinimaAprovacao.toFixed(1)}</Text>
        </View>
      </View>

      {/* Contadores */}
      <View style={estilos.contadores}>
        <View style={estilos.itemContador}>
          <Text style={estilos.contadorNumero}>{resumo.totalAvaliacoes}</Text>
          <Text style={estilos.contadorRotulo}>Total</Text>
        </View>
        <View style={[estilos.itemContador, estilos.contadorDestaque]}>
          <Text style={[estilos.contadorNumero, { color: tema.cores.corStatusSeguro }]}>
            {resumo.avaliacoesLancadas}
          </Text>
          <Text style={estilos.contadorRotulo}>Lançadas</Text>
        </View>
        <View style={estilos.itemContador}>
          <Text style={[
            estilos.contadorNumero,
            { color: resumo.avaliacoesPendentes > 0 ? tema.cores.corStatusAlerta : tema.cores.corTextoSecundario }
          ]}>
            {resumo.avaliacoesPendentes}
          </Text>
          <Text style={estilos.contadorRotulo}>Pendentes</Text>
        </View>
      </View>

      {/* Projeção */}
      {resumo.mensagemProjecao && (
        <View style={[estilos.projecaoBanner, { borderLeftColor: cor }]}>
          <Text style={estilos.projecaoTexto}>{resumo.mensagemProjecao}</Text>
        </View>
      )}
    </View>
  );
};

const estilos = StyleSheet.create({
  painel: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    marginBottom: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  rotuloSecao: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: tema.espacamento.sm,
  },
  textoVazio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    textAlign: 'center',
    paddingVertical: tema.espacamento.sm,
  },
  faixaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    marginBottom: tema.espacamento.sm,
    borderWidth: 1,
  },
  mediaContainer: {
    alignItems: 'center',
    flex: 1,
  },
  mediaValor: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  mediaRotulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  separadorVertical: {
    width: 1,
    height: 40,
    backgroundColor: '#30363d',
    marginHorizontal: tema.espacamento.sm,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  badgeStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
  },
  badgeStatusTexto: {
    fontSize: tema.tipografia.micro,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
  contadores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: tema.espacamento.sm,
  },
  itemContador: {
    alignItems: 'center',
    flex: 1,
  },
  contadorDestaque: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#21262d',
  },
  contadorNumero: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: '700',
  },
  contadorRotulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  projecaoBanner: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.pequeno,
    padding: tema.espacamento.sm,
    borderLeftWidth: 3,
  },
  projecaoTexto: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    lineHeight: 20,
  },
});
