import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ItemCalendario } from '../modelos/Calendario';
import { PRIORIDADE_LABELS } from '../modelos/Tarefa';
import { TIPO_AVALIACAO_LABELS } from '../modelos/Avaliacao';
import { tema } from '../estilos/tema';

interface CardItemCalendarioProps {
  item: ItemCalendario;
  aoAlternarConclusaoTarefa?: (tarefaId: string) => void;
  aoPressionarItem?: (item: ItemCalendario) => void;
  aoExcluirEvento?: (eventoId: string) => void;
}

export const CardItemCalendario: React.FC<CardItemCalendarioProps> = ({
  item,
  aoAlternarConclusaoTarefa,
  aoPressionarItem,
  aoExcluirEvento,
}) => {
  const corDestaque = item.destaqueCor || item.disciplinaCor || tema.cores.corMarcaPrimaria;

  const obterBadgeCategoria = () => {
    switch (item.categoria) {
      case 'PROVAS':
        return {
          label: item.tipoAvaliacao
            ? TIPO_AVALIACAO_LABELS[item.tipoAvaliacao]
            : 'Avaliação',
          corFundo: `${corDestaque}25`,
          corTexto: corDestaque,
        };
      case 'ENTREGAS':
        return {
          label: item.prioridadeTarefa
            ? `Tarefa • ${PRIORIDADE_LABELS[item.prioridadeTarefa]}`
            : 'Tarefa',
          corFundo: `${corDestaque}25`,
          corTexto: corDestaque,
        };
      case 'AULAS':
        return {
          label: 'Aula Regular',
          corFundo: `${corDestaque}20`,
          corTexto: corDestaque,
        };
      case 'EVENTOS':
        return {
          label: 'Evento Acadêmico',
          corFundo: `${corDestaque}25`,
          corTexto: corDestaque,
        };
      default:
        return {
          label: 'Compromisso',
          corFundo: tema.cores.corFundoElevado,
          corTexto: tema.cores.corTextoSecundario,
        };
    }
  };

  const badge = obterBadgeCategoria();

  return (
    <TouchableOpacity
      style={[
        estilos.container,
        item.concluida ? estilos.containerConcluido : null,
      ]}
      onPress={() => aoPressionarItem && aoPressionarItem(item)}
      activeOpacity={aoPressionarItem ? 0.7 : 1}
    >
      {/* Barra colorida indicativa à esquerda */}
      <View
        style={[
          estilos.barraLateral,
          { backgroundColor: corDestaque },
        ]}
      />

      {/* Conteúdo Principal */}
      <View style={estilos.conteudo}>
        {/* Linha Superior: Badges e Horário */}
        <View style={estilos.linhaSuperior}>
          <View style={estilos.linhaBadges}>
            <View
              style={[
                estilos.badgeCategoria,
                { backgroundColor: badge.corFundo, borderColor: corDestaque },
              ]}
            >
              <Text style={[estilos.textoBadge, { color: badge.corTexto }]}>
                {badge.label}
              </Text>
            </View>

            {item.disciplinaNome && item.categoria !== 'AULAS' && (
              <View style={estilos.badgeDisciplina}>
                <View
                  style={[
                    estilos.pontoDisciplina,
                    { backgroundColor: item.disciplinaCor || corDestaque },
                  ]}
                />
                <Text
                  style={estilos.textoBadgeDisciplina}
                  numberOfLines={1}
                >
                  {item.disciplinaNome}
                </Text>
              </View>
            )}
          </View>

          {/* Horário */}
          <View style={estilos.containerHorario}>
            <Text style={estilos.textoHorario}>
              {item.horarioInicio
                ? item.horarioFim
                  ? `${item.horarioInicio} - ${item.horarioFim}`
                  : item.horarioInicio
                : 'Dia todo'}
            </Text>
          </View>
        </View>

        {/* Linha do Meio: Checkbox (se tarefa) + Título */}
        <View style={estilos.linhaTitulo}>
          {item.categoria === 'ENTREGAS' && (
            <TouchableOpacity
              style={[
                estilos.checkbox,
                item.concluida ? estilos.checkboxMarcado : null,
              ]}
              onPress={() =>
                aoAlternarConclusaoTarefa &&
                aoAlternarConclusaoTarefa(item.origemId)
              }
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {item.concluida && <Text style={estilos.iconeCheck}>✓</Text>}
            </TouchableOpacity>
          )}

          <View style={estilos.infoTexto}>
            <Text
              style={[
                estilos.titulo,
                item.concluida ? estilos.tituloConcluido : null,
              ]}
              numberOfLines={2}
            >
              {item.titulo}
            </Text>

            {item.subtitulo && item.categoria === 'AULAS' && (
              <Text style={estilos.subtitulo}>{item.subtitulo}</Text>
            )}

            {item.descricao && (
              <Text style={estilos.descricao} numberOfLines={2}>
                {item.descricao}
              </Text>
            )}
          </View>
        </View>

        {/* Rodapé do Card: Informações complementares */}
        {(item.categoria === 'PROVAS' ||
          item.localSala ||
          item.categoria === 'EVENTOS') && (
          <View style={estilos.rodape}>
            {item.categoria === 'PROVAS' && (
              <View style={estilos.linhaDetalhesProva}>
                {item.pesoAvaliacao !== undefined && (
                  <Text style={estilos.textoRodape}>
                    Peso: {item.pesoAvaliacao}
                  </Text>
                )}
                {item.notaAvaliacao !== undefined &&
                item.notaAvaliacao !== null ? (
                  <View style={estilos.badgeNota}>
                    <Text style={estilos.textoNota}>
                      Nota: {item.notaAvaliacao.toFixed(1)} /{' '}
                      {item.notaMaximaAvaliacao ?? 10}
                    </Text>
                  </View>
                ) : (
                  <Text style={estilos.textoPendente}>Pendente de nota</Text>
                )}
              </View>
            )}

            {item.localSala && (
              <Text style={estilos.textoRodape}>{item.localSala}</Text>
            )}

            {item.categoria === 'EVENTOS' && aoExcluirEvento && (
              <TouchableOpacity
                onPress={() => aoExcluirEvento(item.origemId)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={estilos.linkExcluir}>Excluir Evento</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.padrao,
    marginBottom: tema.espacamento.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
  },
  containerConcluido: {
    opacity: 0.65,
  },
  barraLateral: {
    width: 4,
    alignSelf: 'stretch',
  },
  conteudo: {
    flex: 1,
    padding: tema.espacamento.sm + 2,
  },
  linhaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  linhaBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  badgeCategoria: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
  },
  textoBadge: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeDisciplina: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 120,
  },
  pontoDisciplina: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  textoBadgeDisciplina: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    fontWeight: '500',
  },
  containerHorario: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  textoHorario: {
    color: tema.cores.corTextoPrimario,
    fontSize: 11,
    fontWeight: '600',
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: tema.cores.corMarcaPrimaria,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxMarcado: {
    backgroundColor: tema.cores.corStatusSeguro,
    borderColor: tema.cores.corStatusSeguro,
  },
  iconeCheck: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoTexto: {
    flex: 1,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno + 1,
    fontWeight: '700',
    lineHeight: 18,
  },
  tituloConcluido: {
    textDecorationLine: 'line-through',
    color: tema.cores.corTextoSecundario,
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    marginTop: 2,
  },
  descricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 4,
    lineHeight: 15,
  },
  rodape: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: tema.cores.bordaCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linhaDetalhesProva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoRodape: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
  badgeNota: {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  textoNota: {
    color: tema.cores.corStatusSeguro,
    fontSize: 11,
    fontWeight: '700',
  },
  textoPendente: {
    color: tema.cores.corStatusAlerta,
    fontSize: 11,
    fontWeight: '500',
  },
  linkExcluir: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
});
