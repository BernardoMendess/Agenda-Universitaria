import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avaliacao, TIPO_AVALIACAO_LABELS, TIPO_AVALIACAO_CORES } from '../modelos/Avaliacao';
import { tema } from '../estilos/tema';

interface CardAvaliacaoProps {
  avaliacao: Avaliacao;
  aoLancarNota: (avaliacao: Avaliacao) => void;
  aoEditar: (avaliacao: Avaliacao) => void;
  aoExcluir: (avaliacao: Avaliacao) => void;
}

const formatarData = (dataISO: string): string => {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
};

const calcularDiasRestantes = (dataISO: string): number => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(`${dataISO}T00:00:00`);
  const diff = data.getTime() - hoje.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export const CardAvaliacao: React.FC<CardAvaliacaoProps> = ({
  avaliacao,
  aoLancarNota,
  aoEditar,
  aoExcluir,
}) => {
  const corTipo = TIPO_AVALIACAO_CORES[avaliacao.tipo];
  const labelTipo = TIPO_AVALIACAO_LABELS[avaliacao.tipo];
  const temNota = avaliacao.nota !== null && avaliacao.nota !== undefined;
  const diasRestantes = calcularDiasRestantes(avaliacao.data);

  const corBadgeData =
    diasRestantes < 0
      ? tema.cores.corTextoSecundario
      : diasRestantes <= 2
      ? tema.cores.corStatusCritico
      : diasRestantes <= 7
      ? tema.cores.corStatusAlerta
      : tema.cores.corTextoSecundario;

  return (
    <View style={estilos.card}>
      <View style={[estilos.barraLateral, { backgroundColor: corTipo }]} />

      <View style={estilos.conteudo}>
        {/* Cabeçalho */}
        <View style={estilos.cabecalho}>
          <View style={estilos.tituloContainer}>
            <Text style={estilos.titulo} numberOfLines={1}>{avaliacao.titulo}</Text>
            <View style={estilos.badgesLinha}>
              <View style={[estilos.badgeTipo, { backgroundColor: `${corTipo}20`, borderColor: corTipo }]}>
                <Text style={[estilos.badgeTipoTexto, { color: corTipo }]}>{labelTipo}</Text>
              </View>
              {avaliacao.peso !== 1 && (
                <View style={estilos.badgePeso}>
                  <Text style={estilos.badgePesoTexto}>Peso {avaliacao.peso}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Nota */}
          <View style={[estilos.notaContainer, temNota ? estilos.notaLancada : estilos.notaPendente]}>
            {temNota ? (
              <>
                <Text style={estilos.notaValor}>{avaliacao.nota?.toFixed(1)}</Text>
                <Text style={estilos.notaMaxima}>/{avaliacao.notaMaxima}</Text>
              </>
            ) : (
              <Text style={estilos.notaPendenteTexto}>—</Text>
            )}
          </View>
        </View>

        {/* Data e Horário */}
        <View style={estilos.infoLinha}>
          <Text style={[estilos.dataTexto, { color: corBadgeData }]}>
            {formatarData(avaliacao.data)}
            {avaliacao.horario ? ` às ${avaliacao.horario}` : ''}
          </Text>
          {!temNota && diasRestantes >= 0 && (
            <Text style={[estilos.diasRestantesTexto, { color: corBadgeData }]}>
              {diasRestantes === 0
                ? 'Hoje!'
                : diasRestantes === 1
                ? 'Amanhã'
                : `${diasRestantes} dias`}
            </Text>
          )}
          {temNota && diasRestantes < 0 && (
            <Text style={estilos.realizadaTexto}>Realizada</Text>
          )}
        </View>

        {avaliacao.descricao ? (
          <Text style={estilos.descricao} numberOfLines={2}>{avaliacao.descricao}</Text>
        ) : null}

        {/* Ações */}
        <View style={estilos.acoes}>
          {!temNota ? (
            <TouchableOpacity
              style={estilos.botaoLancarNota}
              onPress={() => aoLancarNota(avaliacao)}
              activeOpacity={0.8}
            >
              <Text style={estilos.botaoLancarNotaTexto}>+ Lançar Nota</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={estilos.botaoEditarNota}
              onPress={() => aoLancarNota(avaliacao)}
              activeOpacity={0.8}
            >
              <Text style={estilos.botaoEditarNotaTexto}>Editar Nota</Text>
            </TouchableOpacity>
          )}

          <View style={estilos.acoesSecundarias}>
            <TouchableOpacity
              style={estilos.botaoAcao}
              onPress={() => aoEditar(avaliacao)}
            >
              <Text style={estilos.botaoAcaoEditar}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={estilos.botaoAcao}
              onPress={() => aoExcluir(avaliacao)}
            >
              <Text style={estilos.botaoAcaoExcluir}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  card: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    marginBottom: tema.espacamento.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#21262d',
  },
  barraLateral: {
    width: 4,
  },
  conteudo: {
    flex: 1,
    padding: tema.espacamento.md,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tema.espacamento.xs,
  },
  tituloContainer: {
    flex: 1,
    marginRight: tema.espacamento.sm,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgesLinha: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badgeTipo: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeTipoTexto: {
    fontSize: tema.tipografia.micro,
    fontWeight: '700',
  },
  badgePeso: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  badgePesoTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  notaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tema.raioBorda.pequeno,
    minWidth: 52,
    justifyContent: 'center',
  },
  notaLancada: {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(46, 160, 67, 0.4)',
  },
  notaPendente: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  notaValor: {
    color: tema.cores.corStatusSeguro,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: '800',
  },
  notaMaxima: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
    marginBottom: 2,
  },
  notaPendenteTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: '500',
  },
  infoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dataTexto: {
    fontSize: tema.tipografia.pequeno,
    fontWeight: '500',
  },
  diasRestantesTexto: {
    fontSize: tema.tipografia.micro,
    fontWeight: '700',
  },
  realizadaTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
  descricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 4,
    lineHeight: 16,
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tema.espacamento.sm,
    paddingTop: tema.espacamento.xs,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  botaoLancarNota: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.sm + 2,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.pequeno,
  },
  botaoLancarNotaTexto: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    fontWeight: '700',
  },
  botaoEditarNota: {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(46, 160, 67, 0.4)',
    paddingHorizontal: tema.espacamento.sm + 2,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.pequeno,
  },
  botaoEditarNotaTexto: {
    color: tema.cores.corStatusSeguro,
    fontSize: tema.tipografia.micro,
    fontWeight: '700',
  },
  acoesSecundarias: {
    flexDirection: 'row',
    gap: tema.espacamento.sm,
  },
  botaoAcao: {
    paddingVertical: 4,
    paddingHorizontal: tema.espacamento.xs,
  },
  botaoAcaoEditar: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  botaoAcaoExcluir: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
});
