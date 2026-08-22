import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TarefaComDisciplina, PRIORIDADE_LABELS, PRIORIDADE_CORES } from '../modelos/Tarefa';
import { tema } from '../estilos/tema';

interface CardTarefaProps {
  tarefa: TarefaComDisciplina;
  aoAlternarConclusao: (id: string) => void;
  aoEditar?: (tarefa: TarefaComDisciplina) => void;
  aoExcluir?: (tarefa: TarefaComDisciplina) => void;
  modoCompacto?: boolean;
}

const formatarDataAmigavel = (dataISO?: string, horario?: string): string => {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;
  return horario ? `${dataFormatada} às ${horario}` : dataFormatada;
};

export const CardTarefa: React.FC<CardTarefaProps> = ({
  tarefa,
  aoAlternarConclusao,
  aoEditar,
  aoExcluir,
  modoCompacto = false,
}) => {
  const corPrioridade = PRIORIDADE_CORES[tarefa.prioridade] || PRIORIDADE_CORES.MEDIA;
  const labelPrioridade = PRIORIDADE_LABELS[tarefa.prioridade] || 'Média';
  const corDisciplina = tarefa.disciplinaCor || tema.cores.corTextoSecundario;

  const obterBadgePrazo = () => {
    if (tarefa.concluida) {
      return { texto: 'Concluída', cor: tema.cores.corStatusSeguro };
    }
    switch (tarefa.statusPrazo) {
      case 'ATRASADA':
        return { texto: 'Atrasada', cor: tema.cores.corStatusCritico };
      case 'HOJE':
        return { texto: 'Hoje', cor: tema.cores.corStatusAlerta };
      case 'AMANHA':
        return { texto: 'Amanhã', cor: tema.cores.corStatusAlerta };
      case 'EM_DIA':
        return {
          texto: tarefa.diasRestantes !== undefined ? `Em ${tarefa.diasRestantes}d` : 'No prazo',
          cor: tema.cores.corTextoSecundario,
        };
      default:
        return null;
    }
  };

  const badgePrazo = obterBadgePrazo();

  return (
    <View style={[estilos.card, tarefa.concluida && estilos.cardConcluido]}>
      {/* Barra lateral colorida pela disciplina */}
      <View
        style={[
          estilos.barraLateral,
          {
            backgroundColor: tarefa.disciplinaId
              ? corDisciplina
              : tema.cores.corFundoElevado,
          },
        ]}
      />

      <View style={estilos.conteudo}>
        <View style={estilos.linhaPrincipal}>
          {/* Checkbox customizado com alvo de toque ampliado (1 toque - RNF03) */}
          <TouchableOpacity
            style={[
              estilos.checkbox,
              tarefa.concluida && estilos.checkboxMarcado,
              { borderColor: tarefa.concluida ? tema.cores.corStatusSeguro : tema.cores.bordaPadrao },
            ]}
            onPress={() => aoAlternarConclusao(tarefa.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: tarefa.concluida }}
            accessibilityLabel={`Tarefa ${tarefa.titulo}. Status: ${tarefa.concluida ? 'concluída' : 'pendente'}. Toque para alternar.`}
          >
            {tarefa.concluida && <Text style={estilos.checkTexto}>✓</Text>}
          </TouchableOpacity>

          {/* Textos da Tarefa */}
          <View style={estilos.infoTexto}>
            <Text
              style={[
                estilos.titulo,
                tarefa.concluida && estilos.tituloRiscado,
              ]}
              numberOfLines={modoCompacto ? 1 : 2}
            >
              {tarefa.titulo}
            </Text>

            {!modoCompacto && tarefa.descricao ? (
              <Text
                style={[
                  estilos.descricao,
                  tarefa.concluida && estilos.descricaoRiscada,
                ]}
                numberOfLines={2}
              >
                {tarefa.descricao}
              </Text>
            ) : null}

            {/* Linha de Badges e Tags */}
            <View style={estilos.linhaBadges}>
              {/* Tag de Disciplina */}
              {tarefa.disciplinaNome ? (
                <View
                  style={[
                    estilos.badgeDisciplina,
                    {
                      backgroundColor: `${corDisciplina}20`,
                      borderColor: corDisciplina,
                    },
                  ]}
                >
                  <Text
                    style={[
                      estilos.textoBadgeDisciplina,
                      { color: corDisciplina },
                    ]}
                    numberOfLines={1}
                  >
                    {tarefa.disciplinaNome}
                  </Text>
                </View>
              ) : (
                <View style={estilos.badgeAvulsa}>
                  <Text style={estilos.textoBadgeAvulsa}>Avulsa</Text>
                </View>
              )}

              {/* Tag de Prioridade (se não for modo compacto) */}
              {!modoCompacto && (
                <View
                  style={[
                    estilos.badgePrioridade,
                    {
                      backgroundColor: `${corPrioridade}20`,
                      borderColor: corPrioridade,
                    },
                  ]}
                >
                  <Text
                    style={[
                      estilos.textoBadgePrioridade,
                      { color: corPrioridade },
                    ]}
                  >
                    {labelPrioridade}
                  </Text>
                </View>
              )}

              {/* Badge de Prazo */}
              {badgePrazo && (
                <View
                  style={[
                    estilos.badgePrazo,
                    {
                      backgroundColor: `${badgePrazo.cor}20`,
                      borderColor: badgePrazo.cor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      estilos.textoBadgePrazo,
                      { color: badgePrazo.cor },
                    ]}
                  >
                    {badgePrazo.texto}
                  </Text>
                </View>
              )}
            </View>

            {/* Data/Horário formatado */}
            {!modoCompacto && tarefa.dataLimite && (
              <Text style={estilos.dataTexto}>
                Prazo: {formatarDataAmigavel(tarefa.dataLimite, tarefa.horarioLimite)}
              </Text>
            )}
          </View>
        </View>

        {/* Botões de Ação na barra inferior do card */}
        {!modoCompacto && (aoEditar || aoExcluir) && (
          <View style={estilos.rodape}>
            <View style={estilos.espacador} />
            <View style={estilos.acoes}>
              {aoEditar && (
                <TouchableOpacity
                  style={estilos.botaoAcao}
                  onPress={() => aoEditar(tarefa)}
                >
                  <Text style={estilos.textoBotaoEditar}>Editar</Text>
                </TouchableOpacity>
              )}
              {aoExcluir && (
                <TouchableOpacity
                  style={estilos.botaoAcao}
                  onPress={() => aoExcluir(tarefa)}
                >
                  <Text style={estilos.textoBotaoExcluir}>Excluir</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
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
  cardConcluido: {
    opacity: 0.65,
    backgroundColor: '#12161c',
  },
  barraLateral: {
    width: 4,
    alignSelf: 'stretch',
  },
  conteudo: {
    flex: 1,
    padding: tema.espacamento.md,
  },
  linhaPrincipal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: tema.espacamento.sm + 2,
    backgroundColor: 'transparent',
  },
  checkboxMarcado: {
    backgroundColor: tema.cores.corStatusSeguro,
  },
  checkTexto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  infoTexto: {
    flex: 1,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '600',
    lineHeight: 20,
  },
  tituloRiscado: {
    textDecorationLine: 'line-through',
    color: tema.cores.corTextoSecundario,
  },
  descricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 4,
    lineHeight: 16,
  },
  descricaoRiscada: {
    textDecorationLine: 'line-through',
    color: '#656d76',
  },
  linhaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  badgeDisciplina: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    maxWidth: 150,
  },
  textoBadgeDisciplina: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeAvulsa: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  textoBadgeAvulsa: {
    fontSize: 11,
    color: tema.cores.corTextoSecundario,
    fontWeight: '500',
  },
  badgePrioridade: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
  },
  textoBadgePrioridade: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgePrazo: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
  },
  textoBadgePrazo: {
    fontSize: 10,
    fontWeight: '700',
  },
  dataTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    marginTop: 6,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  espacador: {
    flex: 1,
  },
  acoes: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoAcao: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  textoBotaoEditar: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  textoBotaoExcluir: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
});
