import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Disciplina } from '../modelos/Disciplina';
import { ResumoFrequencia } from '../modelos/Falta';
import { tema } from '../estilos/tema';

interface SecaoFrequenciaRapidaHomeProps {
  disciplinas: Disciplina[];
  resumosFrequencia: Record<string, ResumoFrequencia>;
  aoIncrementarFalta: (disciplinaId: string) => void;
  aoDecrementarFalta?: (disciplinaId: string) => void;
  aoVerDetalhesDisciplina: (disciplinaId: string) => void;
}

export const SecaoFrequenciaRapidaHome: React.FC<SecaoFrequenciaRapidaHomeProps> = ({
  disciplinas,
  resumosFrequencia,
  aoIncrementarFalta,
  aoDecrementarFalta,
  aoVerDetalhesDisciplina,
}) => {
  if (disciplinas.length === 0) return null;

  return (
    <View style={estilos.container}>
      <View style={estilos.cabecalho}>
        <View>
          <Text style={estilos.titulo}>Lançamento Rápido de Faltas</Text>
          <Text style={estilos.subtitulo}>Ação em 1 toque para qualquer matéria</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.listaHorizontal}
      >
        {disciplinas.map((disciplina) => {
          const resumo = resumosFrequencia[disciplina.id];
          const totalFaltas = resumo ? resumo.totalFaltas : 0;
          const limite = disciplina.limiteMaximoFaltas;
          const status = resumo?.status || 'SEGURO';
          const reprovado = resumo?.reprovadoPorFalta || false;

          let corStatus = tema.cores.corStatusSeguro;
          if (reprovado || status === 'CRITICO') {
            corStatus = tema.cores.corStatusCritico;
          } else if (status === 'ALERTA') {
            corStatus = tema.cores.corStatusAlerta;
          }

          return (
            <View key={disciplina.id} style={estilos.cardMateria}>
              {/* Barra de cor da matéria */}
              <View
                style={[
                  estilos.barraCor,
                  {
                    backgroundColor:
                      disciplina.corIdentificacao || tema.cores.corMarcaPrimaria,
                  },
                ]}
              />

              <View style={estilos.conteudoCard}>
                {/* Nome da Matéria */}
                <TouchableOpacity
                  onPress={() => aoVerDetalhesDisciplina(disciplina.id)}
                  activeOpacity={0.7}
                >
                  <Text style={estilos.nomeMateria} numberOfLines={1}>
                    {disciplina.nome}
                  </Text>
                  {disciplina.codigo ? (
                    <Text style={estilos.codigoMateria}>{disciplina.codigo}</Text>
                  ) : null}
                </TouchableOpacity>

                {/* Contador de Faltas e Status */}
                <View style={estilos.linhaContador}>
                  <Text style={estilos.textoContador}>
                    {totalFaltas}
                    {limite && limite > 0 ? (
                      <Text style={estilos.textoLimite}> / {limite}</Text>
                    ) : (
                      <Text style={estilos.textoLimite}> faltas</Text>
                    )}
                  </Text>

                  <View
                    style={[
                      estilos.badgeStatus,
                      {
                        backgroundColor: `${corStatus}15`,
                        borderColor: corStatus,
                      },
                    ]}
                  >
                    <Text style={[estilos.textoStatus, { color: corStatus }]}>
                      {reprovado
                        ? 'Crítico'
                        : status === 'ALERTA'
                        ? 'Alerta'
                        : 'Seguro'}
                    </Text>
                  </View>
                </View>

                {/* Botões de ação */}
                <View style={estilos.linhaBotoes}>
                  {aoDecrementarFalta && totalFaltas > 0 && (
                    <TouchableOpacity
                      style={estilos.botaoMenos}
                      onPress={() => aoDecrementarFalta(disciplina.id)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Diminuir uma falta em ${disciplina.nome}`}
                    >
                      <Text style={estilos.textoBotaoMenos}>-1</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={estilos.botaoMais}
                    onPress={() => aoIncrementarFalta(disciplina.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Registrar uma falta em ${disciplina.nome}`}
                  >
                    <Text style={estilos.textoBotaoMais}>+1 Falta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    marginTop: tema.espacamento.lg,
    marginBottom: tema.espacamento.sm,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tema.espacamento.xs + 2,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    marginTop: 1,
  },
  listaHorizontal: {
    paddingVertical: 4,
    gap: 10,
  },
  cardMateria: {
    width: 175,
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.padrao,
    borderWidth: 1,
    borderColor: '#21262d',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barraCor: {
    width: 4,
    alignSelf: 'stretch',
  },
  conteudoCard: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  nomeMateria: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro + 1,
    fontWeight: '700',
  },
  codigoMateria: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 1,
  },
  linhaContador: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  textoContador: {
    color: tema.cores.corTextoPrimario,
    fontSize: 13,
    fontWeight: 'bold',
  },
  textoLimite: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    fontWeight: '400',
  },
  badgeStatus: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
  },
  textoStatus: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  botaoMenos: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoMenos: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    fontWeight: '700',
  },
  botaoMais: {
    flex: 1,
    backgroundColor: `${tema.cores.corStatusCritico}20`,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.4)',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoMais: {
    color: tema.cores.corStatusCritico,
    fontSize: 11,
    fontWeight: '700',
  },
});
