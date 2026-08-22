import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DiaCalendario } from '../modelos/Calendario';
import { tema } from '../estilos/tema';

interface GridCalendarioMensalProps {
  matrizMes: DiaCalendario[];
  dataSelecionada: string;
  aoSelecionarData: (dataStr: string) => void;
}

const DIAS_CABECALHO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const GridCalendarioMensal: React.FC<GridCalendarioMensalProps> = ({
  matrizMes,
  dataSelecionada,
  aoSelecionarData,
}) => {
  return (
    <View style={estilos.container}>
      {/* Cabeçalho dos Dias da Semana */}
      <View style={estilos.linhaCabecalho}>
        {DIAS_CABECALHO.map((diaAbrev, index) => (
          <View key={index} style={estilos.colunaCabecalho}>
            <Text
              style={[
                estilos.textoCabecalho,
                index === 0 || index === 6 ? estilos.textoCabecalhoFimDeSemana : null,
              ]}
            >
              {diaAbrev}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid de Células do Mês */}
      <View style={estilos.grid}>
        {matrizMes.map((dia) => {
          const selecionado = dia.dataStr === dataSelecionada;
          const temEventos = dia.eventos.length > 0;

          return (
            <TouchableOpacity
              key={dia.dataStr}
              style={[
                estilos.celula,
                !dia.ehMesAtual ? estilos.celulaMesAdjacente : null,
                dia.ehHoje ? estilos.celulaHoje : null,
                selecionado ? estilos.celulaSelecionada : null,
              ]}
              onPress={() => aoSelecionarData(dia.dataStr)}
              activeOpacity={0.7}
            >
              {/* Número do Dia */}
              <Text
                style={[
                  estilos.numeroDia,
                  !dia.ehMesAtual ? estilos.numeroDiaMesAdjacente : null,
                  dia.ehHoje ? estilos.numeroDiaHoje : null,
                  selecionado ? estilos.numeroDiaSelecionado : null,
                ]}
              >
                {dia.diaDoMes}
              </Text>

              {/* Indicadores de Eventos (Pontos Coloridos) */}
              <View style={estilos.containerIndicadores}>
                {temEventos &&
                  dia.indicadoresCores.slice(0, 3).map((cor, idx) => (
                    <View
                      key={idx}
                      style={[
                        estilos.pontoEvento,
                        { backgroundColor: cor },
                        selecionado ? estilos.pontoEventoSelecionado : null,
                      ]}
                    />
                  ))}
                {dia.eventos.length > 3 && (
                  <Text
                    style={[
                      estilos.textoMaisEventos,
                      selecionado ? estilos.textoMaisEventosSelecionado : null,
                    ]}
                  >
                    +
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: '#21262d',
    marginBottom: tema.espacamento.md,
  },
  linhaCabecalho: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    paddingBottom: 8,
    marginBottom: 4,
  },
  colunaCabecalho: {
    flex: 1,
    alignItems: 'center',
  },
  textoCabecalho: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textoCabecalhoFimDeSemana: {
    color: '#6b7280',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celula: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    borderRadius: tema.raioBorda.padrao,
    position: 'relative',
  },
  celulaMesAdjacente: {
    opacity: 0.35,
  },
  celulaHoje: {
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  celulaSelecionada: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  numeroDia: {
    color: tema.cores.corTextoPrimario,
    fontSize: 13,
    fontWeight: '600',
  },
  numeroDiaMesAdjacente: {
    color: tema.cores.corTextoSecundario,
  },
  numeroDiaHoje: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '800',
  },
  numeroDiaSelecionado: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  containerIndicadores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 6,
    marginTop: 2,
  },
  pontoEvento: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  pontoEventoSelecionado: {
    backgroundColor: '#ffffff',
  },
  textoMaisEventos: {
    fontSize: 8,
    fontWeight: 'bold',
    color: tema.cores.corTextoSecundario,
    lineHeight: 8,
  },
  textoMaisEventosSelecionado: {
    color: '#ffffff',
  },
});
