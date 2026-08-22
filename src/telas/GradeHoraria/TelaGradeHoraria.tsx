import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Cabecalho } from '../../componentes/Cabecalho';
import { CardHorarioAula } from '../../componentes/CardHorarioAula';
import { useGradeHoraria } from '../../hooks/useGradeHoraria';
import {
  DiaSemana,
  DIAS_DA_SEMANA,
  DIAS_SEMANA_LABELS,
  DIAS_SEMANA_ABREV,
} from '../../modelos/HorarioAula';
import { gradeHorariaService } from '../../servicos/GradeHorariaService';
import { tema } from '../../estilos/tema';

interface TelaGradeHorariaProps {
  aoCriarDisciplina: () => void;
}

export const TelaGradeHoraria: React.FC<TelaGradeHorariaProps> = ({
  aoCriarDisciplina,
}) => {
  const diaHoje = gradeHorariaService.converterDateParaDiaSemana();
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana>(diaHoje);
  const [modoVisao, setModoVisao] = useState<'dia' | 'semana'>('dia');
  const { gradeSemanal, carregando } = useGradeHoraria();

  const aulasDoDia = gradeSemanal[diaSelecionado] || [];
  const totalAulasSemana = DIAS_DA_SEMANA.reduce(
    (acc, dia) => acc + (gradeSemanal[dia]?.length || 0),
    0
  );

  return (
    <SafeAreaView style={estilos.container}>
      <Cabecalho
        titulo="Grade Horária"
        subtitulo={`${totalAulasSemana} bloco(s) de aula na semana`}
      />

      {/* Alternador de Visão: Dia ou Semana Completa */}
      <View style={estilos.alternadorContainer}>
        <TouchableOpacity
          style={[
            estilos.botaoAlternador,
            modoVisao === 'dia' ? estilos.botaoAlternadorAtivo : null,
          ]}
          onPress={() => setModoVisao('dia')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              estilos.textoAlternador,
              modoVisao === 'dia' ? estilos.textoAlternadorAtivo : null,
            ]}
          >
            Visão Diária
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            estilos.botaoAlternador,
            modoVisao === 'semana' ? estilos.botaoAlternadorAtivo : null,
          ]}
          onPress={() => setModoVisao('semana')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              estilos.textoAlternador,
              modoVisao === 'semana' ? estilos.textoAlternadorAtivo : null,
            ]}
          >
            Semana Completa
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={estilos.carregandoContainer}>
          <ActivityIndicator size="large" color={tema.cores.corMarcaPrimaria} />
        </View>
      ) : modoVisao === 'dia' ? (
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
        >
          {/* Seletor Horizontal de Dias da Semana */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.listaDiasHorizontal}
          >
            {DIAS_DA_SEMANA.map((dia) => {
              const ativo = diaSelecionado === dia;
              const ehHoje = dia === diaHoje;
              const qtd = gradeSemanal[dia]?.length || 0;

              return (
                <TouchableOpacity
                  key={dia}
                  style={[
                    estilos.cardDiaHorizontal,
                    ativo ? estilos.cardDiaHorizontalAtivo : null,
                  ]}
                  onPress={() => setDiaSelecionado(dia)}
                  activeOpacity={0.7}
                >
                  {ehHoje && <View style={estilos.pontoHoje} />}
                  <Text
                    style={[
                      estilos.textoDiaAbrev,
                      ativo ? estilos.textoDiaAbrevAtivo : null,
                    ]}
                  >
                    {DIAS_SEMANA_ABREV[dia]}
                  </Text>
                  <Text
                    style={[
                      estilos.contadorAulasBadge,
                      ativo ? estilos.contadorAulasBadgeAtivo : null,
                    ]}
                  >
                    {qtd} aula{qtd !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Cabeçalho do Dia */}
          <View style={estilos.secaoDiaCabecalho}>
            <Text style={estilos.tituloDia}>
              {DIAS_SEMANA_LABELS[diaSelecionado]}
              {diaSelecionado === diaHoje ? ' (Hoje)' : ''}
            </Text>
            <Text style={estilos.subtituloDia}>
              {aulasDoDia.length} aula{aulasDoDia.length !== 1 ? 's' : ''} programada{aulasDoDia.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Lista de Aulas do Dia */}
          {aulasDoDia.length === 0 ? (
            <View style={estilos.cardVazio}>
              <Text style={estilos.iconeVazio}>🏖️</Text>
              <Text style={estilos.tituloVazio}>Sem aulas neste dia</Text>
              <Text style={estilos.textoVazio}>
                Nenhum bloco de horário cadastrado para {DIAS_SEMANA_LABELS[diaSelecionado].toLowerCase()}.
              </Text>
            </View>
          ) : (
            aulasDoDia.map((aula) => (
              <CardHorarioAula key={aula.id} aula={aula} />
            ))
          )}
        </ScrollView>
      ) : (
        /* Visão Semana Completa */
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
        >
          {DIAS_DA_SEMANA.map((dia) => {
            const aulas = gradeSemanal[dia] || [];
            if (aulas.length === 0) return null;

            return (
              <View key={dia} style={estilos.blocoDiaSemana}>
                <View style={estilos.linhaTituloDia}>
                  <Text style={estilos.tituloDiaSemana}>
                    {DIAS_SEMANA_LABELS[dia]}
                  </Text>
                  <View style={estilos.badgeQtdAulas}>
                    <Text style={estilos.textoBadgeQtd}>
                      {aulas.length} aula{aulas.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {aulas.map((aula) => (
                  <CardHorarioAula key={aula.id} aula={aula} />
                ))}
              </View>
            );
          })}

          {totalAulasSemana === 0 && (
            <View style={estilos.cardVazio}>
              <Text style={estilos.iconeVazio}>📅</Text>
              <Text style={estilos.tituloVazio}>Grade Semanal Vazia</Text>
              <Text style={estilos.textoVazio}>
                Você ainda não configurou horários para nenhuma disciplina.
              </Text>
              <TouchableOpacity
                style={estilos.botaoAdicionarGrade}
                onPress={aoCriarDisciplina}
              >
                <Text style={estilos.textoBotaoAdicionar}>
                  + Cadastrar Disciplina com Horários
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.cores.corFundoPrincipal,
  },
  alternadorContainer: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoElevado,
    marginHorizontal: tema.espacamento.md,
    marginBottom: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
    padding: 4,
    gap: 4,
  },
  botaoAlternador: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: tema.raioBorda.pequeno,
  },
  botaoAlternadorAtivo: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  textoAlternador: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  textoAlternadorAtivo: {
    color: tema.cores.corTextoPrimario,
    fontWeight: 'bold',
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    padding: tema.espacamento.md,
    paddingBottom: tema.espacamento.xl + 20,
  },
  listaDiasHorizontal: {
    gap: 8,
    paddingBottom: tema.espacamento.md,
  },
  cardDiaHorizontal: {
    backgroundColor: tema.cores.corFundoCard,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: tema.raioBorda.padrao,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21262d',
    minWidth: 64,
    position: 'relative',
  },
  cardDiaHorizontalAtivo: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  pontoHoje: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tema.cores.corStatusSeguro,
  },
  textoDiaAbrev: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  textoDiaAbrevAtivo: {
    color: tema.cores.corTextoPrimario,
  },
  contadorAulasBadge: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 2,
  },
  contadorAulasBadgeAtivo: {
    color: tema.cores.corTextoPrimario,
    fontWeight: '600',
  },
  secaoDiaCabecalho: {
    marginBottom: tema.espacamento.md,
  },
  tituloDia: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  subtituloDia: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginTop: 2,
  },
  blocoDiaSemana: {
    marginBottom: tema.espacamento.lg,
  },
  linhaTituloDia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tema.espacamento.sm,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  tituloDiaSemana: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal + 1,
    fontWeight: 'bold',
  },
  badgeQtdAulas: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  textoBadgeQtd: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  cardVazio: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21262d',
    marginTop: tema.espacamento.sm,
  },
  iconeVazio: {
    fontSize: 40,
    marginBottom: tema.espacamento.sm,
  },
  tituloVazio: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal + 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textoVazio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    textAlign: 'center',
    lineHeight: 20,
  },
  botaoAdicionarGrade: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
    marginTop: tema.espacamento.md,
  },
  textoBotaoAdicionar: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
});
