import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AulaGradeItem } from '../servicos/GradeHorariaService';
import { StatusMomentoAula } from '../modelos/Dashboard';
import { tema } from '../estilos/tema';

interface CardHorarioAulaProps {
  aula: AulaGradeItem & { statusMomento?: StatusMomentoAula };
  totalFaltas?: number;
  limiteFaltas?: number | null;
  aoPressionar?: (disciplinaId: string) => void;
  aoIncrementarFalta?: (disciplinaId: string) => void;
  aoDecrementarFalta?: (disciplinaId: string) => void;
}

export const CardHorarioAula: React.FC<CardHorarioAulaProps> = ({
  aula,
  totalFaltas,
  limiteFaltas,
  aoPressionar,
  aoIncrementarFalta,
  aoDecrementarFalta,
}) => {
  const status = aula.statusMomento;
  const ehAgora = status === 'EM_ANDAMENTO';
  const ehProxima = status === 'PROXIMA';
  const ehEncerrada = status === 'ENCERRADA';

  return (
    <TouchableOpacity
      style={[
        estilos.card,
        ehAgora && estilos.cardEmAndamento,
        ehEncerrada && estilos.cardEncerrada,
      ]}
      onPress={() => aoPressionar?.(aula.disciplinaId)}
      activeOpacity={aoPressionar ? 0.75 : 1}
      disabled={!aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={`Aula de ${aula.nomeDisciplina}, horário ${aula.horarioInicio} às ${aula.horarioFim}`}
    >
      {/* Barra lateral com a cor da disciplina */}
      <View
        style={[
          estilos.indicadorCor,
          { backgroundColor: aula.corIdentificacao || tema.cores.corMarcaPrimaria },
        ]}
      />

      <View style={estilos.conteudo}>
        {/* Cabeçalho do Card: Horário, Status do Momento e Código */}
        <View style={estilos.cabecalho}>
          <View style={estilos.linhaHorario}>
            <View
              style={[
                estilos.badgeHorario,
                ehAgora && estilos.badgeHorarioAgora,
              ]}
            >
              <Text
                style={[
                  estilos.textoHorario,
                  ehAgora && estilos.textoHorarioAgora,
                ]}
              >
                {aula.horarioInicio} - {aula.horarioFim}
              </Text>
            </View>

            {/* Badge de Status do Momento */}
            {ehAgora && (
              <View style={estilos.badgeAgora}>
                <View style={estilos.pontoPulso} />
                <Text style={estilos.textoBadgeAgora}>Agora</Text>
              </View>
            )}

            {ehProxima && (
              <View style={estilos.badgeProxima}>
                <Text style={estilos.textoBadgeProxima}>Próxima</Text>
              </View>
            )}

            {ehEncerrada && (
              <View style={estilos.badgeEncerrada}>
                <Text style={estilos.textoBadgeEncerrada}>Encerrada</Text>
              </View>
            )}
          </View>

          {aula.codigoDisciplina ? (
            <Text style={estilos.codigo}>{aula.codigoDisciplina}</Text>
          ) : null}
        </View>

        {/* Nome da Matéria */}
        <Text style={estilos.nomeDisciplina} numberOfLines={2}>
          {aula.nomeDisciplina}
        </Text>

        {/* Detalhes: Sala, Professor e Ação Rápida */}
        <View style={estilos.rodape}>
          <View style={estilos.infoGrupo}>
            {aula.localSala ? (
              <View style={estilos.infoItem}>
                <Text style={estilos.textoInfo}>Sala: {aula.localSala}</Text>
              </View>
            ) : null}

            {aula.nomeProfessor ? (
              <View style={estilos.infoItem}>
                <Text style={estilos.textoInfo}>Prof: {aula.nomeProfessor}</Text>
              </View>
            ) : null}

            {typeof totalFaltas === 'number' ? (
              <View style={estilos.infoItem}>
                <Text style={estilos.textoFaltasContador}>
                  Faltas: {totalFaltas}
                  {limiteFaltas && limiteFaltas > 0 ? `/${limiteFaltas}` : ''}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Ações Rápidas em 1 Toque (RNF03): Registrar / Remover Falta */}
          <View style={estilos.grupoBotoesFalta}>
            {aoDecrementarFalta && typeof totalFaltas === 'number' && totalFaltas > 0 && (
              <TouchableOpacity
                style={estilos.botaoFaltaMenos}
                onPress={() => aoDecrementarFalta(aula.disciplinaId)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Diminuir falta em ${aula.nomeDisciplina}`}
              >
                <Text style={estilos.textoBotaoFaltaMenos}>-1</Text>
              </TouchableOpacity>
            )}

            {aoIncrementarFalta && (
              <TouchableOpacity
                style={estilos.botaoFaltaRapida}
                onPress={() => aoIncrementarFalta(aula.disciplinaId)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Registrar falta em ${aula.nomeDisciplina}`}
              >
                <Text style={estilos.textoBotaoFaltaRapida}>+1 Falta</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    marginBottom: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: '#21262d',
    overflow: 'hidden',
  },
  cardEmAndamento: {
    borderColor: tema.cores.corMarcaPrimaria,
    backgroundColor: '#161d2b',
  },
  cardEncerrada: {
    opacity: 0.6,
  },
  indicadorCor: {
    width: 6,
  },
  conteudo: {
    flex: 1,
    padding: tema.espacamento.md,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  linhaHorario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeHorario: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeHorarioAgora: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}30`,
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoHorario: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textoHorarioAgora: {
    color: '#818cf8',
  },
  badgeAgora: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${tema.cores.corStatusSeguro}25`,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.corStatusSeguro,
    gap: 4,
  },
  pontoPulso: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tema.cores.corStatusSeguro,
  },
  textoBadgeAgora: {
    color: tema.cores.corStatusSeguro,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeProxima: {
    backgroundColor: `${tema.cores.corStatusAlerta}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.corStatusAlerta,
  },
  textoBadgeProxima: {
    color: tema.cores.corStatusAlerta,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeEncerrada: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
  },
  textoBadgeEncerrada: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    fontWeight: '500',
  },
  codigo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  nomeDisciplina: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal + 1,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  infoGrupo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tema.espacamento.sm,
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoInfo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
  textoFaltasContador: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  grupoBotoesFalta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  botaoFaltaMenos: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tema.raioBorda.pequeno,
  },
  textoBotaoFaltaMenos: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    fontWeight: '700',
  },
  botaoFaltaRapida: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tema.raioBorda.pequeno,
    backgroundColor: `${tema.cores.corStatusCritico}20`,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.4)',
  },
  textoBotaoFaltaRapida: {
    color: tema.cores.corStatusCritico,
    fontSize: 10,
    fontWeight: '700',
  },
});
