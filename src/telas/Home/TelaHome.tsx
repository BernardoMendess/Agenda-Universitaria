import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useDashboard } from '../../hooks/useDashboard';
import { CardMateriaAlerta } from '../../componentes/CardMateriaAlerta';
import { CardHorarioAula } from '../../componentes/CardHorarioAula';
import { CardTarefa } from '../../componentes/CardTarefa';
import { SecaoFrequenciaRapidaHome } from '../../componentes/SecaoFrequenciaRapidaHome';
import { BarraAcaoRapidaFeedback } from '../../componentes/BarraAcaoRapidaFeedback';
import { ModalFormularioTarefa } from '../../componentes/ModalFormularioTarefa';
import { ModalHistoricoFaltas } from '../../componentes/ModalHistoricoFaltas';
import { ModalAlertaFaltasCritico } from '../../componentes/ModalAlertaFaltasCritico';
import { Disciplina } from '../../modelos/Disciplina';
import { TIPO_AVALIACAO_LABELS, TIPO_AVALIACAO_CORES } from '../../modelos/Avaliacao';
import { BadgeStatusOffline } from '../../componentes/BadgeStatusOffline';
import { tema } from '../../estilos/tema';

interface TelaHomeProps {
  aoIrParaDisciplinas: () => void;
  aoIrParaGrade: () => void;
  aoIrParaTarefas: () => void;
  aoIrParaCalendario?: () => void;
  aoCriarDisciplina: () => void;
  aoEditarDisciplina: (disciplina: Disciplina) => void;
  aoVerDetalhesDisciplina: (disciplina: Disciplina) => void;
}

export const TelaHome: React.FC<TelaHomeProps> = ({
  aoIrParaDisciplinas,
  aoIrParaGrade,
  aoIrParaTarefas,
  aoIrParaCalendario,
  aoCriarDisciplina,
  aoEditarDisciplina,
  aoVerDetalhesDisciplina,
}) => {
  const {
    disciplinas,
    aulasProcessadas,
    materiasEmAlerta,
    tarefasHome,
    proximasAvaliacoes,
    estatisticas,
    metricas,
    dataExtenso,
    resumosFrequencia,
    alertaCritico,
    fecharAlertaCritico,
    alternarConclusao,
    criarTarefa,
    incrementarFalta,
    decrementarFalta,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistoricoFaltas,
    feedbackAcaoRapida,
    desfazerUltimaAcao,
    fecharFeedback,
  } = useDashboard();

  const [modalNovaTarefaVisivel, setModalNovaTarefaVisivel] = useState(false);
  const [disciplinaHistorico, setDisciplinaHistorico] = useState<Disciplina | null>(null);

  const abrirDetalhesPorId = (disciplinaId: string) => {
    const disc = disciplinas.find((d) => d.id === disciplinaId);
    if (disc) {
      aoVerDetalhesDisciplina(disc);
    }
  };

  return (
    <SafeAreaView style={estilos.container}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho do Dashboard */}
        <View style={estilos.cabecalho}>
          <View style={estilos.linhaCabecalho}>
            <Text style={estilos.saudacao}>CampusFlow</Text>
            <BadgeStatusOffline tamanho="pequeno" />
          </View>
          <Text style={estilos.dataSubtitulo}>{dataExtenso}</Text>
        </View>

        {/* Métricas Consolidadas do Topo (RF08) */}
        <View style={estilos.cardResumo}>
          <View style={estilos.linhaResumo}>
            {/* Aulas Hoje */}
            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>{metricas.aulasHoje}</Text>
              <Text style={estilos.rotuloEstatistica}>Aulas Hoje</Text>
            </View>

            <View style={estilos.separador} />

            {/* Tarefas Pendentes */}
            <View style={estilos.itemEstatistica}>
              <Text
                style={[
                  estilos.numeroEstatistica,
                  {
                    color:
                      metricas.tarefasAtrasadas > 0
                        ? tema.cores.corStatusCritico
                        : metricas.tarefasPendentes > 0
                        ? tema.cores.corMarcaPrimaria
                        : tema.cores.corTextoPrimario,
                  },
                ]}
              >
                {metricas.tarefasPendentes}
              </Text>
              <Text style={estilos.rotuloEstatistica}>
                {metricas.tarefasAtrasadas > 0
                  ? `${metricas.tarefasAtrasadas} Atrasada${metricas.tarefasAtrasadas > 1 ? 's' : ''}`
                  : 'Tarefas'}
              </Text>
            </View>

            <View style={estilos.separador} />

            {/* Matérias em Alerta */}
            <View style={estilos.itemEstatistica}>
              <Text
                style={[
                  estilos.numeroEstatistica,
                  {
                    color:
                      metricas.materiasEmAlerta > 0
                        ? tema.cores.corStatusCritico
                        : tema.cores.corStatusSeguro,
                  },
                ]}
              >
                {metricas.materiasEmAlerta}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Em Risco</Text>
            </View>

            <View style={estilos.separador} />

            {/* Total de Matérias */}
            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>
                {metricas.totalDisciplinas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Matérias</Text>
            </View>
          </View>
        </View>

        {/* Barra de Ações Rápidas em 1 Toque (RNF03) */}
        <View style={estilos.barraAtalhos}>
          <TouchableOpacity
            style={estilos.botaoAtalhoRapido}
            onPress={() => setModalNovaTarefaVisivel(true)}
            activeOpacity={0.7}
          >
            <Text style={estilos.textoBotaoAtalhoRapido}>+ Nova Tarefa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botaoAtalhoRapido}
            onPress={aoCriarDisciplina}
            activeOpacity={0.7}
          >
            <Text style={estilos.textoBotaoAtalhoRapido}>+ Matéria</Text>
          </TouchableOpacity>

          {aoIrParaCalendario && (
            <TouchableOpacity
              style={estilos.botaoAtalhoRapidoSecundario}
              onPress={aoIrParaCalendario}
              activeOpacity={0.7}
            >
              <Text style={estilos.textoBotaoAtalhoSecundario}>Calendário</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={estilos.botaoAtalhoRapidoSecundario}
            onPress={aoIrParaGrade}
            activeOpacity={0.7}
          >
            <Text style={estilos.textoBotaoAtalhoSecundario}>Grade</Text>
          </TouchableOpacity>
        </View>

        {/* Seção 1: Resumo das Matérias em Estado de Alerta (Faltas e Notas Baixas - RF08 & RNF03) */}
        <View style={estilos.secaoCabecalho}>
          <View>
            <Text style={estilos.secaoTitulo}>Diagnóstico Acadêmico</Text>
            <Text style={estilos.secaoSubtitulo}>
              {materiasEmAlerta.length > 0
                ? `${materiasEmAlerta.length} matéria(s) com atenção necessária`
                : 'Frequência e notas sob controle'}
            </Text>
          </View>
          <TouchableOpacity onPress={aoIrParaDisciplinas}>
            <Text style={estilos.linkVerTodas}>Ver matérias →</Text>
          </TouchableOpacity>
        </View>

        {materiasEmAlerta.length === 0 ? (
          <View style={estilos.cardSituacaoRegular}>
            <View style={estilos.badgeRegular}>
              <Text style={estilos.textoBadgeRegular}>✓ Situação Regular</Text>
            </View>
            <Text style={estilos.textoRegular}>
              Tudo sob controle! Nenhuma matéria está com limite de faltas em risco ou reprovação por nota.
            </Text>
          </View>
        ) : (
          materiasEmAlerta.map((alerta) => (
            <CardMateriaAlerta
              key={alerta.disciplinaId}
              alerta={alerta}
              aoVerDetalhes={abrirDetalhesPorId}
              aoIncrementarFalta={incrementarFalta}
              aoDecrementarFalta={decrementarFalta}
            />
          ))
        )}

        {/* Seção 2: Aulas de Hoje (RF08 & RNF03) */}
        <View style={[estilos.secaoCabecalho, { marginTop: tema.espacamento.lg }]}>
          <View>
            <Text style={estilos.secaoTitulo}>Aulas de Hoje</Text>
            <Text style={estilos.secaoSubtitulo}>
              {aulasProcessadas.length > 0
                ? `${aulasProcessadas.length} aula(s) programada(s) • Faltas em 1 toque`
                : 'Dia livre de aulas'}
            </Text>
          </View>
          <TouchableOpacity onPress={aoIrParaGrade}>
            <Text style={estilos.linkVerTodas}>Ver grade →</Text>
          </TouchableOpacity>
        </View>

        {aulasProcessadas.length === 0 ? (
          <View style={estilos.cardVazio}>
            <Text style={estilos.textoVazio}>
              Nenhuma aula cadastrada para hoje.
            </Text>
            <TouchableOpacity
              style={estilos.botaoAdicionarVazio}
              onPress={aoIrParaGrade}
            >
              <Text style={estilos.textoBotaoAdicionarVazio}>
                Consultar Grade Semanal
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          aulasProcessadas.map((aula) => {
            const resumo = resumosFrequencia[aula.disciplinaId];
            const disciplinaObj = disciplinas.find((d) => d.id === aula.disciplinaId);
            return (
              <CardHorarioAula
                key={aula.id}
                aula={aula}
                totalFaltas={resumo?.totalFaltas}
                limiteFaltas={disciplinaObj?.limiteMaximoFaltas}
                aoPressionar={abrirDetalhesPorId}
                aoIncrementarFalta={incrementarFalta}
                aoDecrementarFalta={decrementarFalta}
              />
            );
          })
        )}

        {/* Seção: Lançamento Rápido de Faltas para qualquer disciplina (RNF03) */}
        {disciplinas.length > 0 && (
          <SecaoFrequenciaRapidaHome
            disciplinas={disciplinas}
            resumosFrequencia={resumosFrequencia}
            aoIncrementarFalta={incrementarFalta}
            aoDecrementarFalta={decrementarFalta}
            aoVerDetalhesDisciplina={abrirDetalhesPorId}
          />
        )}

        {/* Seção 3: Tarefas Pendentes com Vencimento Próximo (RF08 & RNF03) */}
        <View style={[estilos.secaoCabecalho, { marginTop: tema.espacamento.lg }]}>
          <View>
            <Text style={estilos.secaoTitulo}>Tarefas Prioritárias</Text>
            <Text style={estilos.secaoSubtitulo}>
              {estatisticas.pendentes} pendente(s) • Conclusão em 1 toque
            </Text>
          </View>
          <TouchableOpacity onPress={aoIrParaTarefas}>
            <Text style={estilos.linkVerTodas}>Ver To-Do →</Text>
          </TouchableOpacity>
        </View>

        {tarefasHome.length === 0 ? (
          <View style={estilos.cardVazio}>
            <Text style={estilos.textoVazio}>
              Tudo em dia! Nenhuma tarefa pendente no momento.
            </Text>
            <TouchableOpacity
              style={estilos.botaoAdicionarVazio}
              onPress={() => setModalNovaTarefaVisivel(true)}
            >
              <Text style={estilos.textoBotaoAdicionarVazio}>+ Criar Tarefa</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tarefasHome.map((tarefa) => (
            <CardTarefa
              key={tarefa.id}
              tarefa={tarefa}
              aoAlternarConclusao={alternarConclusao}
              modoCompacto={true}
            />
          ))
        )}

        {/* Seção 4: Próximas Avaliações */}
        {proximasAvaliacoes.length > 0 && (
          <>
            <View style={[estilos.secaoCabecalho, { marginTop: tema.espacamento.lg }]}>
              <View>
                <Text style={estilos.secaoTitulo}>Próximas Avaliações</Text>
                <Text style={estilos.secaoSubtitulo}>
                  Provas e entregas agendadas
                </Text>
              </View>
              {aoIrParaCalendario && (
                <TouchableOpacity onPress={aoIrParaCalendario}>
                  <Text style={estilos.linkVerTodas}>Ver calendário →</Text>
                </TouchableOpacity>
              )}
            </View>

            {proximasAvaliacoes.map((avaliacao) => {
              const corTipo = TIPO_AVALIACAO_CORES[avaliacao.tipo];
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);
              const dataAval = new Date(`${avaliacao.data}T00:00:00`);
              const diasRestantes = Math.round(
                (dataAval.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <TouchableOpacity
                  key={avaliacao.id}
                  style={estilos.cardProximaAvaliacao}
                  onPress={() => abrirDetalhesPorId(avaliacao.disciplinaId)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      estilos.barraLateralAvaliacao,
                      { backgroundColor: corTipo },
                    ]}
                  />
                  <View style={estilos.infoProximaAvaliacao}>
                    <Text style={estilos.tituloProximaAvaliacao} numberOfLines={1}>
                      {avaliacao.titulo}
                    </Text>
                    <Text style={estilos.disciplinaProximaAvaliacao}>
                      {avaliacao.disciplinaNome}
                    </Text>
                  </View>
                  <View style={estilos.prazoContainer}>
                    <Text
                      style={[
                        estilos.prazoNumero,
                        {
                          color:
                            diasRestantes <= 2
                              ? tema.cores.corStatusCritico
                              : diasRestantes <= 7
                              ? tema.cores.corStatusAlerta
                              : tema.cores.corTextoSecundario,
                        },
                      ]}
                    >
                      {diasRestantes === 0
                        ? 'Hoje!'
                        : diasRestantes === 1
                        ? 'Amanhã'
                        : `${diasRestantes}d`}
                    </Text>
                    <Text style={estilos.prazoLabel}>
                      {TIPO_AVALIACAO_LABELS[avaliacao.tipo]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Barra de Feedback de Ações Rápidas com Desfazer em 1 Toque (RNF03) */}
      <BarraAcaoRapidaFeedback
        feedback={feedbackAcaoRapida}
        aoDesfazer={desfazerUltimaAcao}
        aoFechar={fecharFeedback}
      />

      {/* Modal de Criação Rápida de Tarefa (Acesso direto do Dashboard) */}
      <ModalFormularioTarefa
        visivel={modalNovaTarefaVisivel}
        disciplinas={disciplinas}
        aoFechar={() => setModalNovaTarefaVisivel(false)}
        aoSalvar={async (dados) => {
          await criarTarefa(dados as any);
        }}
      />

      {/* Modal de Histórico de Faltas */}
      <ModalHistoricoFaltas
        visivel={!!disciplinaHistorico}
        disciplina={disciplinaHistorico}
        resumo={disciplinaHistorico ? resumosFrequencia[disciplinaHistorico.id] : undefined}
        aoFechar={() => setDisciplinaHistorico(null)}
        aoBuscarHistorico={obterHistoricoFaltas}
        aoAdicionarFaltaDetalhada={registrarFaltaDetalhada}
        aoRemoverFalta={removerFalta}
      />

      {/* Modal de Alerta Crítico de Faltas (RF10) */}
      <ModalAlertaFaltasCritico
        visivel={!!alertaCritico}
        disciplinaNome={alertaCritico?.disciplinaNome || ''}
        limiteMaximoFaltas={alertaCritico?.limiteMaximoFaltas || 0}
        totalFaltas={alertaCritico?.totalFaltas || 0}
        reprovadoPorFalta={alertaCritico?.reprovadoPorFalta || false}
        aoFechar={fecharAlertaCritico}
        aoAbrirHistorico={() => {
          if (alertaCritico) {
            const disc = disciplinas.find((d) => d.id === alertaCritico.disciplinaId);
            if (disc) {
              setDisciplinaHistorico(disc);
            }
          }
        }}
      />
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
  linhaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saudacao: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.destaque,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  dataSubtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginTop: 2,
    fontWeight: '500',
  },
  cardResumo: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    marginBottom: tema.espacamento.sm,
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
    flex: 1,
  },
  numeroEstatistica: {
    color: tema.cores.corTextoPrimario,
    fontSize: 22,
    fontWeight: 'bold',
  },
  rotuloEstatistica: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  separador: {
    width: 1,
    height: 28,
    backgroundColor: tema.cores.corFundoElevado,
  },
  barraAtalhos: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: tema.espacamento.md,
  },
  botaoAtalhoRapido: {
    flex: 1,
    backgroundColor: `${tema.cores.corMarcaPrimaria}20`,
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoAtalhoRapido: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: 11,
    fontWeight: '700',
  },
  botaoAtalhoRapidoSecundario: {
    flex: 1,
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoAtalhoSecundario: {
    color: tema.cores.corTextoPrimario,
    fontSize: 11,
    fontWeight: '600',
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
    fontSize: 11,
    marginTop: 1,
  },
  linkVerTodas: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  cardSituacaoRegular: {
    backgroundColor: 'rgba(46, 160, 67, 0.08)',
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: 'rgba(46, 160, 67, 0.3)',
    marginBottom: tema.espacamento.sm,
  },
  badgeRegular: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46, 160, 67, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: tema.raioBorda.redondo,
    marginBottom: 6,
  },
  textoBadgeRegular: {
    color: tema.cores.corStatusSeguro,
    fontSize: 11,
    fontWeight: '700',
  },
  textoRegular: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro + 1,
    lineHeight: 18,
  },
  cardVazio: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21262d',
    marginBottom: tema.espacamento.sm,
  },
  textoVazio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro + 1,
    marginBottom: tema.espacamento.sm,
    textAlign: 'center',
  },
  botaoAdicionarVazio: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.pequeno,
  },
  textoBotaoAdicionarVazio: {
    color: tema.cores.corTextoPrimario,
    fontSize: 11,
    fontWeight: '600',
  },
  cardProximaAvaliacao: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.padrao,
    marginBottom: tema.espacamento.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#21262d',
    alignItems: 'center',
  },
  barraLateralAvaliacao: {
    width: 4,
    alignSelf: 'stretch',
  },
  infoProximaAvaliacao: {
    flex: 1,
    paddingVertical: tema.espacamento.sm,
    paddingLeft: tema.espacamento.sm,
  },
  tituloProximaAvaliacao: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  disciplinaProximaAvaliacao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  prazoContainer: {
    alignItems: 'center',
    paddingHorizontal: tema.espacamento.md,
  },
  prazoNumero: {
    fontSize: tema.tipografia.pequeno,
    fontWeight: '800',
  },
  prazoLabel: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 1,
  },
});
