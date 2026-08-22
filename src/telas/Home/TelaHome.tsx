import React, { useState, useEffect } from 'react';
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
import { useFrequencia } from '../../hooks/useFrequencia';
import { CardDisciplina } from '../../componentes/CardDisciplina';
import { CardHorarioAula } from '../../componentes/CardHorarioAula';
import { ModalHistoricoFaltas } from '../../componentes/ModalHistoricoFaltas';
import { ModalConfirmacao } from '../../componentes/ModalConfirmacao';
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
  const { disciplinas, excluirDisciplina } = useDisciplinas();
  const { aulasDeHoje } = useGradeHoraria();
  const {
    resumos,
    carregarResumos,
    incrementar,
    decrementar,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistorico,
  } = useFrequencia();

  const [disciplinaHistorico, setDisciplinaHistorico] = useState<Disciplina | null>(null);
  const [disciplinaParaExcluir, setDisciplinaParaExcluir] = useState<Disciplina | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const diaHoje = gradeHorariaService.converterDateParaDiaSemana();

  useEffect(() => {
    if (disciplinas.length > 0) {
      carregarResumos(disciplinas);
    }
  }, [disciplinas, carregarResumos]);

  const totalFaltasGeral = Object.values(resumos).reduce(
    (acc, r) => acc + (r?.totalFaltas || 0),
    0
  );

  const materiasEmAlertaOuCritico = Object.values(resumos).filter(
    (r) => r?.status === 'ALERTA' || r?.status === 'CRITICO'
  ).length;

  const confirmarExclusao = async () => {
    if (!disciplinaParaExcluir) return;
    try {
      setExcluindo(true);
      await excluirDisciplina(disciplinaParaExcluir.id);
      setDisciplinaParaExcluir(null);
    } catch (e) {
      // Erro tratado
    } finally {
      setExcluindo(false);
    }
  };

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

        {/* Resumo Rápido com Frequência */}
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
                  {
                    color:
                      materiasEmAlertaOuCritico > 0
                        ? tema.cores.corStatusAlerta
                        : tema.cores.corTextoPrimario,
                  },
                ]}
              >
                {totalFaltasGeral}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Faltas Totais</Text>
            </View>
          </View>
        </View>

        {/* Alerta de Matérias em Risco */}
        {materiasEmAlertaOuCritico > 0 && (
          <View style={estilos.cardAtencao}>
            <Text style={estilos.iconeAtencao}>⚠️</Text>
            <View style={estilos.infoAtencao}>
              <Text style={estilos.tituloAtencao}>Atenção à Frequência</Text>
              <Text style={estilos.textoAtencao}>
                Você tem {materiasEmAlertaOuCritico}{' '}
                {materiasEmAlertaOuCritico === 1
                  ? 'matéria em estado de alerta ou limite crítico'
                  : 'matérias em estado de alerta ou limite crítico'}
                .
              </Text>
            </View>
          </View>
        )}

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
              resumo={resumos[disc.id]}
              aoPressionar={() => {}}
              aoEditar={aoEditarDisciplina}
              aoExcluir={(d) => setDisciplinaParaExcluir(d)}
              aoIncrementarFalta={incrementar}
              aoDecrementarFalta={decrementar}
              aoAbrirHistoricoFaltas={(d) => setDisciplinaHistorico(d)}
            />
          ))
        )}
      </ScrollView>

      {/* Modal de Histórico de Faltas */}
      <ModalHistoricoFaltas
        visivel={!!disciplinaHistorico}
        disciplina={disciplinaHistorico}
        resumo={disciplinaHistorico ? resumos[disciplinaHistorico.id] : undefined}
        aoFechar={() => setDisciplinaHistorico(null)}
        aoBuscarHistorico={obterHistorico}
        aoAdicionarFaltaDetalhada={registrarFaltaDetalhada}
        aoRemoverFalta={removerFalta}
      />

      {/* Modal de Exclusão */}
      <ModalConfirmacao
        visivel={!!disciplinaParaExcluir}
        titulo="Excluir Disciplina"
        mensagem={`Tem certeza que deseja excluir "${disciplinaParaExcluir?.nome}"? Todos os horários e faltas serão excluídos.`}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setDisciplinaParaExcluir(null)}
        carregando={excluindo}
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
    marginBottom: tema.espacamento.md,
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
  cardAtencao: {
    backgroundColor: 'rgba(210, 153, 34, 0.1)',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm + 2,
    marginBottom: tema.espacamento.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(210, 153, 34, 0.3)',
    gap: 10,
  },
  iconeAtencao: {
    fontSize: 20,
  },
  infoAtencao: {
    flex: 1,
  },
  tituloAtencao: {
    color: tema.cores.corStatusAlerta,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  textoAtencao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
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
