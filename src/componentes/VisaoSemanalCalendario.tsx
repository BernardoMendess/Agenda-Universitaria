import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SemanaCalendario, ItemCalendario } from '../modelos/Calendario';
import { DIAS_SEMANA_LABELS } from '../modelos/HorarioAula';
import { CardItemCalendario } from './CardItemCalendario';
import { tema } from '../estilos/tema';

interface VisaoSemanalCalendarioProps {
  semana: SemanaCalendario;
  aoAlternarConclusaoTarefa?: (tarefaId: string) => void;
  aoPressionarItem?: (item: ItemCalendario) => void;
  aoExcluirEvento?: (eventoId: string) => void;
}

export const VisaoSemanalCalendario: React.FC<VisaoSemanalCalendarioProps> = ({
  semana,
  aoAlternarConclusaoTarefa,
  aoPressionarItem,
  aoExcluirEvento,
}) => {
  return (
    <View style={estilos.container}>
      {semana.dias.map((dia) => {
        const nomeDia = DIAS_SEMANA_LABELS[dia.diaSemana];
        const temEventos = dia.eventos.length > 0;

        return (
          <View
            key={dia.dataStr}
            style={[
              estilos.blocoDia,
              dia.ehHoje ? estilos.blocoDiaHoje : null,
            ]}
          >
            {/* Cabeçalho do Dia */}
            <View style={estilos.cabecalhoDia}>
              <View style={estilos.infoData}>
                <View
                  style={[
                    estilos.badgeNumeroDia,
                    dia.ehHoje ? estilos.badgeNumeroDiaHoje : null,
                  ]}
                >
                  <Text
                    style={[
                      estilos.textoNumeroDia,
                      dia.ehHoje ? estilos.textoNumeroDiaHoje : null,
                    ]}
                  >
                    {dia.diaDoMes}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[
                      estilos.textoNomeDia,
                      dia.ehHoje ? estilos.textoNomeDiaHoje : null,
                    ]}
                  >
                    {nomeDia} {dia.ehHoje ? '(Hoje)' : ''}
                  </Text>
                  <Text style={estilos.textoDataSub}>
                    {dia.dataStr.split('-').reverse().join('/')}
                  </Text>
                </View>
              </View>

              <View style={estilos.badgeQtd}>
                <Text style={estilos.textoBadgeQtd}>
                  {dia.eventos.length} item{dia.eventos.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Lista de Itens do Dia */}
            <View style={estilos.listaItens}>
              {!temEventos ? (
                <View style={estilos.containerVazioDia}>
                  <Text style={estilos.textoVazioDia}>
                    Nenhum compromisso agendado para este dia.
                  </Text>
                </View>
              ) : (
                dia.eventos.map((item) => (
                  <CardItemCalendario
                    key={item.id}
                    item={item}
                    aoAlternarConclusaoTarefa={aoAlternarConclusaoTarefa}
                    aoPressionarItem={aoPressionarItem}
                    aoExcluirEvento={aoExcluirEvento}
                  />
                ))
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    gap: tema.espacamento.md,
  },
  blocoDia: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
  },
  blocoDiaHoje: {
    borderColor: tema.cores.corMarcaPrimaria,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  cabecalhoDia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tema.espacamento.sm,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: tema.cores.bordaCard,
  },
  infoData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeNumeroDia: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tema.cores.corFundoElevado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumeroDiaHoje: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  textoNumeroDia: {
    color: tema.cores.corTextoPrimario,
    fontSize: 14,
    fontWeight: 'bold',
  },
  textoNumeroDiaHoje: {
    color: '#ffffff',
  },
  textoNomeDia: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  textoNomeDiaHoje: {
    color: tema.cores.corMarcaPrimaria,
  },
  textoDataSub: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
  },
  badgeQtd: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoBadgeQtd: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    fontWeight: '600',
  },
  listaItens: {
    marginTop: 4,
  },
  containerVazioDia: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  textoVazioDia: {
    color: tema.cores.corTextoSecundario,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
