import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AulaGradeItem } from '../servicos/GradeHorariaService';
import { tema } from '../estilos/tema';

interface CardHorarioAulaProps {
  aula: AulaGradeItem;
}

export const CardHorarioAula: React.FC<CardHorarioAulaProps> = ({ aula }) => {
  return (
    <View style={estilos.card}>
      {/* Barra lateral com a cor da disciplina */}
      <View
        style={[
          estilos.indicadorCor,
          { backgroundColor: aula.corIdentificacao || tema.cores.corMarcaPrimaria },
        ]}
      />

      <View style={estilos.conteudo}>
        {/* Cabeçalho do Card: Horário e Código */}
        <View style={estilos.cabecalho}>
          <View style={estilos.badgeHorario}>
            <Text style={estilos.textoHorario}>
              {aula.horarioInicio} - {aula.horarioFim}
            </Text>
          </View>
          {aula.codigoDisciplina ? (
            <Text style={estilos.codigo}>{aula.codigoDisciplina}</Text>
          ) : null}
        </View>

        {/* Nome da Matéria */}
        <Text style={estilos.nomeDisciplina} numberOfLines={2}>
          {aula.nomeDisciplina}
        </Text>

        {/* Detalhes: Sala e Professor */}
        <View style={estilos.rodape}>
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
        </View>
      </View>
    </View>
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
  badgeHorario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  iconeRelogio: {
    fontSize: 12,
  },
  textoHorario: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    flexWrap: 'wrap',
    gap: tema.espacamento.sm,
    marginTop: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconeInfo: {
    fontSize: 12,
  },
  textoInfo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
});
