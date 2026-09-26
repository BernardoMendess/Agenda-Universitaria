import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResumoFrequencia, StatusFrequencia } from '../modelos/Falta';
import { tema } from '../estilos/tema';

interface ControleFrequenciaProps {
  resumo?: ResumoFrequencia;
  limiteMaximoFaltas?: number | null;
  aoIncrementar: () => void;
  aoDecrementar: () => void;
  aoAbrirHistorico: () => void;
}

export const ControleFrequencia: React.FC<ControleFrequenciaProps> = ({
  resumo,
  limiteMaximoFaltas,
  aoIncrementar,
  aoDecrementar,
  aoAbrirHistorico,
}) => {
  const totalFaltas = resumo ? resumo.totalFaltas : 0;
  const presencaObrigatoria =
    resumo?.presencaObrigatoria ??
    (typeof limiteMaximoFaltas === 'number' && limiteMaximoFaltas > 0);
  const limiteValido =
    typeof limiteMaximoFaltas === 'number' && limiteMaximoFaltas > 0
      ? limiteMaximoFaltas
      : resumo?.limiteMaximoFaltas ?? null;

  const faltasRestantes = resumo ? resumo.faltasRestantes : limiteValido;
  const status: StatusFrequencia = resumo ? resumo.status : 'SEGURO';
  const reprovado = resumo ? resumo.reprovadoPorFalta : false;

  const obterCorStatus = (statusFrequencia: StatusFrequencia) => {
    switch (statusFrequencia) {
      case 'SEGURO':
        return tema.cores.corStatusSeguro;
      case 'MODERADO':
        return '#388bfd';
      case 'ALERTA':
        return tema.cores.corStatusAlerta;
      case 'CRITICO':
        return tema.cores.corStatusCritico;
      default:
        return tema.cores.corStatusSeguro;
    }
  };

  const corStatus = obterCorStatus(status);

  return (
    <View style={estilos.container}>
      {/* Linha de Indicador de Status e Informação de Saldo */}
      <View style={estilos.linhaStatus}>
        <View style={estilos.infoFaltasContainer}>
          <Text style={estilos.rotuloFaltas}>Frequência & Faltas</Text>

          {!presencaObrigatoria || !limiteValido ? (
            <View style={estilos.linhaInfoValores}>
              <Text style={estilos.contadorPrincipal}>
                {totalFaltas}
                <Text style={estilos.contadorLimite}> falta{totalFaltas !== 1 ? 's' : ''} registrada{totalFaltas !== 1 ? 's' : ''}</Text>
              </Text>

              <View
                style={[
                  estilos.badgeStatus,
                  {
                    backgroundColor: 'rgba(46, 160, 67, 0.15)',
                    borderColor: tema.cores.corStatusSeguro,
                  },
                ]}
              >
                <View style={[estilos.pontoStatus, { backgroundColor: tema.cores.corStatusSeguro }]} />
                <Text style={[estilos.textoStatus, { color: tema.cores.corStatusSeguro }]}>
                  Presença Facultativa
                </Text>
              </View>
            </View>
          ) : (
            <View style={estilos.linhaInfoValores}>
              <Text style={estilos.contadorPrincipal}>
                {totalFaltas}
                <Text style={estilos.contadorLimite}> / {limiteValido} faltas</Text>
              </Text>

              <View
                style={[
                  estilos.badgeStatus,
                  {
                    backgroundColor:
                      status === 'CRITICO'
                        ? 'rgba(248, 81, 73, 0.15)'
                        : status === 'ALERTA'
                        ? 'rgba(210, 153, 34, 0.15)'
                        : 'rgba(46, 160, 67, 0.15)',
                    borderColor: corStatus,
                  },
                ]}
              >
                <View style={[estilos.pontoStatus, { backgroundColor: corStatus }]} />
                <Text style={[estilos.textoStatus, { color: corStatus }]}>
                  {reprovado
                    ? 'Limite Excedido'
                    : status === 'ALERTA'
                    ? `Alerta (${faltasRestantes} rest.)`
                    : `${faltasRestantes} restante${faltasRestantes === 1 ? '' : 's'}`}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Barra de Progresso do Consumo de Faltas (apenas se presença obrigatória) */}
      {presencaObrigatoria && limiteValido && limiteValido > 0 && (
        <View style={estilos.containerBarraProgresso}>
          <View style={estilos.trilhaBarra}>
            <View
              style={[
                estilos.preenchimentoBarra,
                {
                  width: `${Math.min(100, Math.max(0, (totalFaltas / limiteValido) * 100))}%`,
                  backgroundColor: corStatus,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Controles de Ação Rápida (+1 / -1 e Histórico) */}
      <View style={estilos.linhaAcoes}>
        <TouchableOpacity
          style={estilos.botaoHistorico}
          onPress={aoAbrirHistorico}
          activeOpacity={0.7}
          accessibilityLabel="Abrir histórico de faltas"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="time-outline" size={14} color={tema.cores.corTextoSecundario} />
          <Text style={estilos.textoBotaoHistorico}>Histórico</Text>
        </TouchableOpacity>

        <View style={estilos.grupoContadores}>
          <TouchableOpacity
            style={[
              estilos.botaoIncremento,
              totalFaltas === 0 ? estilos.botaoDesabilitado : null,
            ]}
            onPress={aoDecrementar}
            disabled={totalFaltas === 0}
            activeOpacity={0.7}
            accessibilityLabel="Diminuir uma falta"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text
              style={[
                estilos.textoBotaoControle,
                totalFaltas === 0 ? estilos.textoDesabilitado : null,
              ]}
            >
              -1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[estilos.botaoIncremento, estilos.botaoMais]}
            onPress={aoIncrementar}
            activeOpacity={0.7}
            accessibilityLabel="Adicionar uma falta"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[estilos.textoBotaoControle, estilos.textoMais]}>+1</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(33, 38, 45, 0.6)',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    marginTop: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
  },
  linhaStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoFaltasContainer: {
    flex: 1,
  },
  rotuloFaltas: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  linhaInfoValores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  contadorPrincipal: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  contadorLimite: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '400',
  },
  badgeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tema.espacamento.xs + 4,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  pontoStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  textoStatus: {
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  containerBarraProgresso: {
    marginTop: 8,
    marginBottom: 4,
  },
  trilhaBarra: {
    height: 4,
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: 2,
    overflow: 'hidden',
  },
  preenchimentoBarra: {
    height: '100%',
    borderRadius: 2,
  },
  linhaAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tema.espacamento.xs + 4,
    paddingTop: tema.espacamento.xs + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  botaoHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: tema.espacamento.sm,
    paddingHorizontal: tema.espacamento.smd,
    borderRadius: tema.raioBorda.pequeno,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minHeight: 38,
  },
  textoBotaoHistorico: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  grupoContadores: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoIncremento: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 14,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
    minWidth: 44,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoMais: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: tema.cores.corMarcaPrimaria,
  },
  botaoDesabilitado: {
    opacity: 0.4,
  },
  textoBotaoControle: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  textoMais: {
    color: tema.cores.corMarcaPrimaria,
  },
  textoDesabilitado: {
    color: tema.cores.corTextoSecundario,
  },
});
