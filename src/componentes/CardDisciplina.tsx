import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Disciplina } from '../modelos/Disciplina';
import { tema } from '../estilos/tema';

interface CardDisciplinaProps {
  disciplina: Disciplina;
  aoPressionar: (disciplina: Disciplina) => void;
  aoEditar: (disciplina: Disciplina) => void;
  aoExcluir: (disciplina: Disciplina) => void;
}

export const CardDisciplina: React.FC<CardDisciplinaProps> = ({
  disciplina,
  aoPressionar,
  aoEditar,
  aoExcluir,
}) => {
  const obterDescricaoCriterio = (criterio: string) => {
    switch (criterio) {
      case 'ARITMETICA':
        return 'Média Aritmética';
      case 'PONDERADA':
        return 'Média Ponderada';
      case 'CUSTOMIZADA':
        return 'Fórmula Customizada';
      default:
        return criterio;
    }
  };

  return (
    <TouchableOpacity
      style={estilos.card}
      onPress={() => aoPressionar(disciplina)}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      {/* Barra de identificação visual da matéria */}
      <View
        style={[
          estilos.barraLateral,
          { backgroundColor: disciplina.corIdentificacao || tema.cores.corMarcaPrimaria },
        ]}
      />

      <View style={estilos.conteudoPrincipal}>
        <View style={estilos.cabecalhoCard}>
          <View style={estilos.tituloContainer}>
            <Text style={estilos.nome}>{disciplina.nome}</Text>
            {disciplina.codigo ? (
              <Text style={estilos.codigo}>{disciplina.codigo}</Text>
            ) : null}
          </View>
        </View>

        {/* Informações de Professor e Local */}
        {disciplina.nomeProfessor || disciplina.localSala ? (
          <View style={estilos.secaoDetalhes}>
            {disciplina.nomeProfessor ? (
              <Text style={estilos.detalheTexto}>
                👤 {disciplina.nomeProfessor}
                {disciplina.contatoProfessor ? ` (${disciplina.contatoProfessor})` : ''}
              </Text>
            ) : null}
            {disciplina.localSala ? (
              <Text style={estilos.detalheTexto}>📍 Sala: {disciplina.localSala}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Badges de Frequência e Critério */}
        <View style={estilos.linhaBadges}>
          <View
            style={[
              estilos.badge,
              disciplina.limiteMaximoFaltas === 0
                ? estilos.badgeLimiteZero
                : estilos.badgePadrao,
            ]}
          >
            <Text
              style={[
                estilos.textoBadge,
                disciplina.limiteMaximoFaltas === 0
                  ? estilos.textoBadgeAlerta
                  : null,
              ]}
            >
              {disciplina.limiteMaximoFaltas === 0
                ? '⚠️ Limite 0 (Tolerância Zero)'
                : `Máx: ${disciplina.limiteMaximoFaltas} faltas`}
            </Text>
          </View>

          <View style={[estilos.badge, estilos.badgePadrao]}>
            <Text style={estilos.textoBadge}>
              {obterDescricaoCriterio(disciplina.criterioAprovacao)}
            </Text>
          </View>
        </View>

        {/* Botões de Ações Rápidas */}
        <View style={estilos.rodapeCard}>
          <TouchableOpacity
            style={estilos.botaoAcao}
            onPress={() => aoEditar(disciplina)}
            accessibilityLabel="Editar disciplina"
          >
            <Text style={estilos.textoBotaoEditar}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botaoAcao}
            onPress={() => aoExcluir(disciplina)}
            accessibilityLabel="Excluir disciplina"
          >
            <Text style={estilos.textoBotaoExcluir}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  card: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    marginBottom: tema.espacamento.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#21262d',
  },
  barraLateral: {
    width: 6,
  },
  conteudoPrincipal: {
    flex: 1,
    padding: tema.espacamento.md,
  },
  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tema.espacamento.xs,
  },
  tituloContainer: {
    flex: 1,
  },
  nome: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: '700',
  },
  codigo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  secaoDetalhes: {
    marginVertical: tema.espacamento.xs,
    gap: 2,
  },
  detalheTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
  },
  linhaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tema.espacamento.xs,
    marginTop: tema.espacamento.sm,
  },
  badge: {
    paddingHorizontal: tema.espacamento.sm,
    paddingVertical: 4,
    borderRadius: tema.raioBorda.pequeno,
  },
  badgePadrao: {
    backgroundColor: tema.cores.corFundoElevado,
  },
  badgeLimiteZero: {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderWidth: 1,
    borderColor: tema.cores.corStatusCritico,
  },
  textoBadge: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  textoBadgeAlerta: {
    color: tema.cores.corStatusCritico,
  },
  rodapeCard: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: tema.espacamento.md,
    marginTop: tema.espacamento.md,
    paddingTop: tema.espacamento.xs,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  botaoAcao: {
    paddingVertical: 4,
    paddingHorizontal: tema.espacamento.xs,
  },
  textoBotaoEditar: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  textoBotaoExcluir: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
});
