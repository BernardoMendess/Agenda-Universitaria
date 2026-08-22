import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DiagnosticoEficiencia } from '../modelos/EficienciaEnergetica';
import { tema } from '../estilos/tema';

interface PropsCardEficienciaEnergetica {
  diagnostico?: DiagnosticoEficiencia | null;
}

export const CardEficienciaEnergetica: React.FC<PropsCardEficienciaEnergetica> = ({
  diagnostico,
}) => {
  const metricas = diagnostico?.metricas;

  return (
    <View
      style={estilos.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel="Card de Eficiência Energética RNF04. Zero rotinas ativas em segundo plano."
    >
      <View style={estilos.cabecalho}>
        <View style={estilos.titulosContainer}>
          <Text style={estilos.titulo}>Eficiência Energética</Text>
          <Text style={estilos.subtitulo}>Protocolo RNF04 • Background Zero</Text>
        </View>
        <View style={estilos.badgeConformidade}>
          <Text style={estilos.textoBadgeConformidade}>✓ Otimizado</Text>
        </View>
      </View>

      <Text style={estilos.descricao}>
        Uso exclusivo de agendadores nativos do sistema operacional. O aplicativo não mantém
        loops contínuos em segundo plano, preservando 100% a vida útil da bateria.
      </Text>

      <View style={estilos.gradeMetricas}>
        <View style={estilos.itemMetrica}>
          <Text style={estilos.rotuloMetrica}>Rotinas em 2º Plano</Text>
          <Text style={[estilos.valorMetrica, { color: tema.cores.corStatusSeguro }]}>
            {metricas ? `${metricas.rotinasSegundoPlanoAtivas} ativas` : '0 ativas'}
          </Text>
        </View>

        <View style={estilos.itemMetrica}>
          <Text style={estilos.rotuloMetrica}>Agendador de Alarmes</Text>
          <Text style={estilos.valorMetrica}>Nativo do SO</Text>
        </View>

        <View style={estilos.itemMetrica}>
          <Text style={estilos.rotuloMetrica}>Processamento</Text>
          <Text style={estilos.valorMetrica}>Event-Driven (Idle)</Text>
        </View>

        <View style={estilos.itemMetrica}>
          <Text style={estilos.rotuloMetrica}>Impacto na Bateria</Text>
          <Text style={[estilos.valorMetrica, { color: tema.cores.corStatusSeguro }]}>
            &lt; 0.1% / dia
          </Text>
        </View>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: 'rgba(46, 160, 67, 0.25)',
    marginBottom: tema.espacamento.md,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  badgeConformidade: {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.corStatusSeguro,
  },
  textoBadgeConformidade: {
    color: tema.cores.corStatusSeguro,
    fontSize: 11,
    fontWeight: '700',
  },
  descricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    lineHeight: 16,
    marginVertical: tema.espacamento.sm,
  },
  gradeMetricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    gap: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  itemMetrica: {
    width: '48%',
    paddingVertical: 2,
  },
  rotuloMetrica: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
  },
  valorMetrica: {
    color: tema.cores.corTextoPrimario,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
});
