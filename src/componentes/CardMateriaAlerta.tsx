import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MateriaAlertaItem } from '../modelos/Dashboard';
import { tema } from '../estilos/tema';

interface CardMateriaAlertaProps {
  alerta: MateriaAlertaItem;
  aoVerDetalhes: (disciplinaId: string) => void;
  aoIncrementarFalta?: (disciplinaId: string) => void;
  aoDecrementarFalta?: (disciplinaId: string) => void;
}

export const CardMateriaAlerta: React.FC<CardMateriaAlertaProps> = ({
  alerta,
  aoVerDetalhes,
  aoIncrementarFalta,
  aoDecrementarFalta,
}) => {
  const ehCritico = alerta.nivelGravidade === 'CRITICO';
  const corDestaque = ehCritico
    ? tema.cores.corStatusCritico
    : tema.cores.corStatusAlerta;

  const temFaltas = alerta.resumoFrequencia && alerta.resumoFrequencia.totalFaltas > 0;

  return (
    <View
      style={[
        estilos.card,
        {
          borderColor: ehCritico
            ? 'rgba(248, 81, 73, 0.4)'
            : 'rgba(210, 153, 34, 0.4)',
          backgroundColor: ehCritico
            ? 'rgba(248, 81, 73, 0.05)'
            : 'rgba(210, 153, 34, 0.05)',
        },
      ]}
    >
      {/* Barra lateral de gravidade */}
      <View style={[estilos.barraLateral, { backgroundColor: corDestaque }]} />

      <View style={estilos.conteudo}>
        {/* Cabeçalho do Card */}
        <View style={estilos.cabecalho}>
          <View style={estilos.infoDisciplina}>
            <View style={estilos.linhaNome}>
              <View
                style={[
                  estilos.pontoCor,
                  { backgroundColor: alerta.corIdentificacao },
                ]}
              />
              <Text style={estilos.nomeDisciplina} numberOfLines={1}>
                {alerta.disciplinaNome}
              </Text>
            </View>
            {alerta.disciplinaCodigo ? (
              <Text style={estilos.codigo}>{alerta.disciplinaCodigo}</Text>
            ) : null}
          </View>

          {/* Badge de Nível de Gravidade */}
          <View
            style={[
              estilos.badgeGravidade,
              {
                backgroundColor: `${corDestaque}25`,
                borderColor: corDestaque,
              },
            ]}
          >
            <Text style={[estilos.textoBadgeGravidade, { color: corDestaque }]}>
              {ehCritico ? 'Crítico' : 'Atenção'}
            </Text>
          </View>
        </View>

        {/* Tags de Categoria do Alerta */}
        <View style={estilos.linhaTags}>
          {(alerta.tipoAlerta === 'FALTA' || alerta.tipoAlerta === 'AMBOS') && (
            <View style={estilos.tagAlerta}>
              <Text style={estilos.textoTagAlerta}>Frequência</Text>
            </View>
          )}
          {(alerta.tipoAlerta === 'NOTA' || alerta.tipoAlerta === 'AMBOS') && (
            <View style={estilos.tagAlerta}>
              <Text style={estilos.textoTagAlerta}>Desempenho / Notas</Text>
            </View>
          )}
        </View>

        {/* Lista de Motivos / Justificativas do Alerta */}
        <View style={estilos.secaoMotivos}>
          {alerta.motivosFalta.map((motivo, index) => (
            <View key={`falta-${index}`} style={estilos.itemMotivo}>
              <Text style={[estilos.marcador, { color: corDestaque }]}>•</Text>
              <Text style={estilos.textoMotivo}>{motivo}</Text>
            </View>
          ))}

          {alerta.motivosNota.map((motivo, index) => (
            <View key={`nota-${index}`} style={estilos.itemMotivo}>
              <Text style={[estilos.marcador, { color: corDestaque }]}>•</Text>
              <Text style={estilos.textoMotivo}>{motivo}</Text>
            </View>
          ))}
        </View>

        {/* Rodapé com Ações Rápidas (1 Toque - RNF03) e Ver Detalhes */}
        <View style={estilos.rodape}>
          <View style={estilos.acoesFrequenciaAlerta}>
            {aoDecrementarFalta && temFaltas && (
              <TouchableOpacity
                style={estilos.botaoAlertaFaltaMenos}
                onPress={() => aoDecrementarFalta(alerta.disciplinaId)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Diminuir falta em ${alerta.disciplinaNome}`}
              >
                <Text style={estilos.textoBotaoAlertaMenos}>-1</Text>
              </TouchableOpacity>
            )}

            {aoIncrementarFalta && (
              <TouchableOpacity
                style={estilos.botaoAlertaFaltaMais}
                onPress={() => aoIncrementarFalta(alerta.disciplinaId)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Registrar falta em ${alerta.disciplinaNome}`}
              >
                <Text style={estilos.textoBotaoAlertaMais}>+1 Falta</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[estilos.botaoAcao, { borderColor: corDestaque }]}
            onPress={() => aoVerDetalhes(alerta.disciplinaId)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalhes de ${alerta.disciplinaNome}`}
          >
            <Text style={[estilos.textoBotaoAcao, { color: corDestaque }]}>
              Ver Detalhes →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  card: {
    borderRadius: tema.raioBorda.card,
    marginBottom: tema.espacamento.sm,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barraLateral: {
    width: 5,
    alignSelf: 'stretch',
  },
  conteudo: {
    flex: 1,
    padding: tema.espacamento.md,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoDisciplina: {
    flex: 1,
    marginRight: tema.espacamento.sm,
  },
  linhaNome: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pontoCor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  nomeDisciplina: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal + 1,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  codigo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
    marginLeft: 14,
  },
  badgeGravidade: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
  },
  textoBadgeGravidade: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linhaTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 6,
  },
  tagAlerta: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  textoTagAlerta: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    fontWeight: '600',
  },
  secaoMotivos: {
    marginTop: 4,
    gap: 4,
  },
  itemMotivo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  marcador: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
    lineHeight: 18,
  },
  textoMotivo: {
    flex: 1,
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro + 1,
    lineHeight: 18,
  },
  rodape: {
    marginTop: tema.espacamento.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acoesFrequenciaAlerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  botaoAlertaFaltaMenos: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tema.raioBorda.pequeno,
  },
  textoBotaoAlertaMenos: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    fontWeight: '700',
  },
  botaoAlertaFaltaMais: {
    backgroundColor: `${tema.cores.corStatusCritico}20`,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tema.raioBorda.pequeno,
  },
  textoBotaoAlertaMais: {
    color: tema.cores.corStatusCritico,
    fontSize: 10,
    fontWeight: '700',
  },
  botaoAcao: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
  },
  textoBotaoAcao: {
    fontSize: tema.tipografia.micro + 1,
    fontWeight: '600',
  },
});
