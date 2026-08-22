import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useDisciplinas } from '../../hooks/useDisciplinas';
import { useGradeHoraria } from '../../hooks/useGradeHoraria';
import { CardDisciplina } from '../../componentes/CardDisciplina';
import { CardHorarioAula } from '../../componentes/CardHorarioAula';
import { Disciplina } from '../../modelos/Disciplina';
import { DIAS_SEMANA_LABELS } from '../../modelos/HorarioAula';
import { gradeHorariaService } from '../../servicos/GradeHorariaService';
import { tema } from '../../estilos/tema';

interface TelaHomeProps {
  aoIrParaDisciplinas: () => void;
  aoIrParaGrade: () => void;
  aoCriarDisciplina: () => void;
  aoEditarDisciplina: (disciplina: Disciplina) => void;
}

export const TelaHome: React.FC<TelaHomeProps> = ({
  aoIrParaDisciplinas,
  aoIrParaGrade,
  aoCriarDisciplina,
  aoEditarDisciplina,
}) => {
  const { disciplinas } = useDisciplinas();
  const { aulasDeHoje } = useGradeHoraria();
  const diaHoje = gradeHorariaService.converterDateParaDiaSemana();

  return (
    <SafeAreaView style={estilos.container}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* Boas-vindas */}
        <View style={estilos.cabecalho}>
          <Text style={estilos.saudacao}>CampusFlow</Text>
          <Text style={estilos.subtitulo}>Gestão Acadêmica Offline</Text>
        </View>

        {/* Resumo Rápido */}
        <View style={estilos.cardResumo}>
          <View style={estilos.linhaResumo}>
            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>{disciplinas.length}</Text>
              <Text style={estilos.rotuloEstatistica}>Disciplinas</Text>
            </View>
            <View style={estilos.separador} />
            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>{aulasDeHoje.length}</Text>
              <Text style={estilos.rotuloEstatistica}>Aulas Hoje</Text>
            </View>
            <View style={estilos.separador} />
            <View style={estilos.itemEstatistica}>
              <Text
                style={[
                  estilos.numeroEstatistica,
                  { color: tema.cores.corStatusSeguro },
                ]}
              >
                100%
              </Text>
              <Text style={estilos.rotuloEstatistica}>Offline</Text>
            </View>
          </View>
        </View>

        {/* Seção Aulas de Hoje */}
        <View style={estilos.secaoCabecalho}>
          <View>
            <Text style={estilos.secaoTitulo}>Aulas de Hoje</Text>
            <Text style={estilos.secaoSubtitulo}>
              {DIAS_SEMANA_LABELS[diaHoje]}
            </Text>
          </View>
          <TouchableOpacity onPress={aoIrParaGrade}>
            <Text style={estilos.linkVerTodas}>Ver grade →</Text>
          </TouchableOpacity>
        </View>

        {aulasDeHoje.length === 0 ? (
          <View style={estilos.cardAulasVazio}>
            <Text style={estilos.iconeAulasVazio}>🏖️</Text>
            <Text style={estilos.textoAulasVazio}>
              Nenhuma aula programada para hoje ({DIAS_SEMANA_LABELS[diaHoje].toLowerCase()}).
            </Text>
          </View>
        ) : (
          aulasDeHoje.map((aula) => (
            <CardHorarioAula key={aula.id} aula={aula} />
          ))
        )}

        {/* Seção Minhas Disciplinas */}
        <View style={[estilos.secaoCabecalho, { marginTop: tema.espacamento.lg }]}>
          <Text style={estilos.secaoTitulo}>Minhas Matérias</Text>
          <TouchableOpacity onPress={aoIrParaDisciplinas}>
            <Text style={estilos.linkVerTodas}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {disciplinas.length === 0 ? (
          <View style={estilos.cardVazio}>
            <Text style={estilos.textoVazio}>Nenhuma matéria cadastrada ainda.</Text>
            <TouchableOpacity
              style={estilos.botaoAdicionar}
              onPress={aoCriarDisciplina}
            >
              <Text style={estilos.textoBotaoAdicionar}>+ Cadastrar Disciplina</Text>
            </TouchableOpacity>
          </View>
        ) : (
          disciplinas.slice(0, 3).map((disc) => (
            <CardDisciplina
              key={disc.id}
              disciplina={disc}
              aoPressionar={() => {}}
              aoEditar={aoEditarDisciplina}
              aoExcluir={() => {}}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.cores.corFundoPrincipal,
  },
  conteudo: {
    padding: tema.espacamento.md,
    paddingBottom: tema.espacamento.xl + 20,
  },
  cabecalho: {
    marginTop: tema.espacamento.lg,
    marginBottom: tema.espacamento.md,
  },
  saudacao: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.destaque,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginTop: 2,
  },
  cardResumo: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    marginBottom: tema.espacamento.lg,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  linhaResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  itemEstatistica: {
    alignItems: 'center',
  },
  numeroEstatistica: {
    color: tema.cores.corTextoPrimario,
    fontSize: 24,
    fontWeight: 'bold',
  },
  rotuloEstatistica: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  separador: {
    width: 1,
    height: 30,
    backgroundColor: tema.cores.corFundoElevado,
  },
  secaoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tema.espacamento.sm,
  },
  secaoTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  secaoSubtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 1,
  },
  linkVerTodas: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  cardAulasVazio: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#21262d',
    gap: 12,
  },
  iconeAulasVazio: {
    fontSize: 24,
  },
  textoAulasVazio: {
    flex: 1,
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
  cardVazio: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21262d',
  },
  textoVazio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginBottom: tema.espacamento.md,
  },
  botaoAdicionar: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
  },
  textoBotaoAdicionar: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
});
