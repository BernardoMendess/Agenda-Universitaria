import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Disciplina } from '../../modelos/Disciplina';
import { Avaliacao, CriarAvaliacaoDTO, AtualizarAvaliacaoDTO } from '../../modelos/Avaliacao';
import { TarefaComDisciplina, CriarTarefaDTO, AtualizarTarefaDTO } from '../../modelos/Tarefa';
import { Cabecalho } from '../../componentes/Cabecalho';
import { CardAvaliacao } from '../../componentes/CardAvaliacao';
import { CardTarefa } from '../../componentes/CardTarefa';
import { PainelDesempenhoNotas } from '../../componentes/PainelDesempenhoNotas';
import { ModalFormularioAvaliacao } from '../../componentes/ModalFormularioAvaliacao';
import { ModalFormularioTarefa } from '../../componentes/ModalFormularioTarefa';
import { ModalLancamentoNota } from '../../componentes/ModalLancamentoNota';
import { ModalConfirmacao } from '../../componentes/ModalConfirmacao';
import { ControleFrequencia } from '../../componentes/ControleFrequencia';
import { useAvaliacoes } from '../../hooks/useAvaliacoes';
import { useFrequencia } from '../../hooks/useFrequencia';
import { useGradeHoraria } from '../../hooks/useGradeHoraria';
import { useTarefas } from '../../hooks/useTarefas';
import { DIAS_SEMANA_LABELS } from '../../modelos/HorarioAula';
import { tema } from '../../estilos/tema';

interface TelaDetalhesDisciplinaProps {
  disciplina: Disciplina;
  aoVoltar: () => void;
  aoEditar: (disciplina: Disciplina) => void;
}

type AbaAtiva = 'notas' | 'frequencia' | 'tarefas' | 'horarios';

type FiltroAvaliacao = 'todas' | 'pendentes' | 'lancadas';

export const TelaDetalhesDisciplina: React.FC<TelaDetalhesDisciplinaProps> = ({
  disciplina,
  aoVoltar,
  aoEditar,
}) => {
  const { avaliacoes, resumosDesempenho, carregarAvaliacoes, carregarDesempenhos, criarAvaliacao, atualizarAvaliacao, lancarNota, excluirAvaliacao } = useAvaliacoes();
  const { resumos, carregarResumos, incrementar, decrementar, registrarFaltaDetalhada, removerFalta, obterHistorico } = useFrequencia();
  const { obterHorariosDisciplina } = useGradeHoraria();
  const { tarefas, carregarTarefas, criarTarefa, atualizarTarefa, alternarConclusao, excluirTarefa } = useTarefas();

  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('notas');
  const [filtroAvaliacao, setFiltroAvaliacao] = useState<FiltroAvaliacao>('todas');
  const [horarios, setHorarios] = useState<any[]>([]);
  const [modalFormularioVisivel, setModalFormularioVisivel] = useState(false);
  const [avaliacaoEmEdicao, setAvaliacaoEmEdicao] = useState<Avaliacao | null>(null);
  const [avaliacaoLancamentoNota, setAvaliacaoLancamentoNota] = useState<Avaliacao | null>(null);
  const [avaliacaoParaExcluir, setAvaliacaoParaExcluir] = useState<Avaliacao | null>(null);

  const [modalTarefaVisivel, setModalTarefaVisivel] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaComDisciplina | null>(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<TarefaComDisciplina | null>(null);

  const [excluindo, setExcluindo] = useState(false);

  const carregarDados = useCallback(async () => {
    await Promise.all([
      carregarAvaliacoes(disciplina.id),
      carregarDesempenhos([disciplina]),
      carregarResumos([disciplina]),
      carregarTarefas({ disciplinaId: disciplina.id }),
    ]);
    const horariosLista = await obterHorariosDisciplina(disciplina.id);
    setHorarios(horariosLista);
  }, [disciplina, carregarAvaliacoes, carregarDesempenhos, carregarResumos, carregarTarefas, obterHorariosDisciplina]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const avaliacoesFiltradas = avaliacoes.filter((a) => {
    if (filtroAvaliacao === 'pendentes') return a.nota === null || a.nota === undefined;
    if (filtroAvaliacao === 'lancadas') return a.nota !== null && a.nota !== undefined;
    return true;
  });

  const salvarFormulario = async (dados: CriarAvaliacaoDTO | AtualizarAvaliacaoDTO) => {
    if (avaliacaoEmEdicao) {
      await atualizarAvaliacao(avaliacaoEmEdicao.id, dados as AtualizarAvaliacaoDTO);
    } else {
      await criarAvaliacao(dados as CriarAvaliacaoDTO);
    }
    // Atualiza resumo de desempenho após salvar
    await carregarDesempenhos([disciplina]);
  };

  const confirmarExclusao = async () => {
    if (!avaliacaoParaExcluir) return;
    try {
      setExcluindo(true);
      await excluirAvaliacao(avaliacaoParaExcluir.id);
      await carregarDesempenhos([disciplina]);
      setAvaliacaoParaExcluir(null);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao excluir avaliação.');
    } finally {
      setExcluindo(false);
    }
  };

  const salvarTarefa = async (dados: CriarTarefaDTO | AtualizarTarefaDTO) => {
    if (tarefaEmEdicao) {
      await atualizarTarefa(tarefaEmEdicao.id, dados as AtualizarTarefaDTO);
    } else {
      await criarTarefa({ ...dados, disciplinaId: disciplina.id } as CriarTarefaDTO);
    }
    await carregarTarefas({ disciplinaId: disciplina.id });
  };

  const confirmarExclusaoTarefa = async () => {
    if (!tarefaParaExcluir) return;
    try {
      setExcluindo(true);
      await excluirTarefa(tarefaParaExcluir.id);
      setTarefaParaExcluir(null);
      await carregarTarefas({ disciplinaId: disciplina.id });
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao excluir tarefa.');
    } finally {
      setExcluindo(false);
    }
  };

  const resumoFrequencia = resumos[disciplina.id];
  const resumoDesempenho = resumosDesempenho[disciplina.id];

  return (
    <SafeAreaView style={estilos.container}>
      <Cabecalho
        titulo={disciplina.nome}
        subtitulo={disciplina.codigo || ''}
        aoVoltar={aoVoltar}
        acaoDireita={{
          texto: 'Editar',
          aoPressionar: () => aoEditar(disciplina),
        }}
      />

      {/* Abas de Navegação */}
      <View style={estilos.abas}>
        {([
          { id: 'notas', label: 'Notas' },
          { id: 'frequencia', label: 'Frequência' },
          { id: 'tarefas', label: `Tarefas (${tarefas.length})` },
          { id: 'horarios', label: 'Horários' },
        ] as { id: AbaAtiva; label: string }[]).map((aba) => (
          <TouchableOpacity
            key={aba.id}
            style={[estilos.aba, abaAtiva === aba.id && estilos.abaAtiva]}
            onPress={() => setAbaAtiva(aba.id)}
            activeOpacity={0.8}
          >
            <Text style={[estilos.abaTexto, abaAtiva === aba.id && estilos.abaTextoAtiva]}>
              {aba.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* === ABA NOTAS === */}
        {abaAtiva === 'notas' && (
          <>
            {/* Painel de desempenho */}
            <PainelDesempenhoNotas resumo={resumoDesempenho} />

            {/* Filtros e botão de adicionar */}
            <View style={estilos.barraAcoes}>
              <View style={estilos.filtros}>
                {([
                  { id: 'todas', label: 'Todas' },
                  { id: 'pendentes', label: 'Pendentes' },
                  { id: 'lancadas', label: 'Lançadas' },
                ] as { id: FiltroAvaliacao; label: string }[]).map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[estilos.filtro, filtroAvaliacao === f.id && estilos.filtroAtivo]}
                    onPress={() => setFiltroAvaliacao(f.id)}
                  >
                    <Text style={[estilos.filtroTexto, filtroAvaliacao === f.id && estilos.filtroTextoAtivo]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={estilos.botaoNovaAvaliacao}
                onPress={() => { setAvaliacaoEmEdicao(null); setModalFormularioVisivel(true); }}
                activeOpacity={0.8}
              >
                <Text style={estilos.botaoNovaAvaliacaoTexto}>+ Nova</Text>
              </TouchableOpacity>
            </View>

            {avaliacoesFiltradas.length === 0 ? (
              <View style={estilos.emptyState}>
                <Text style={estilos.emptyTitulo}>
                  {filtroAvaliacao === 'todas' ? 'Nenhuma avaliação cadastrada' : 'Nenhuma avaliação nesta categoria'}
                </Text>
                <Text style={estilos.emptyDescricao}>
                  {filtroAvaliacao === 'todas'
                    ? 'Agende provas, trabalhos e testes para acompanhar seu desempenho e calcular a média automaticamente.'
                    : 'Mude o filtro para ver outras avaliações.'}
                </Text>
              </View>
            ) : (
              avaliacoesFiltradas.map((avaliacao) => (
                <CardAvaliacao
                  key={avaliacao.id}
                  avaliacao={avaliacao}
                  aoLancarNota={(a) => setAvaliacaoLancamentoNota(a)}
                  aoEditar={(a) => { setAvaliacaoEmEdicao(a); setModalFormularioVisivel(true); }}
                  aoExcluir={(a) => setAvaliacaoParaExcluir(a)}
                />
              ))
            )}
          </>
        )}

        {/* === ABA FREQUÊNCIA === */}
        {abaAtiva === 'frequencia' && (
          <>
            <Text style={estilos.rotuloSecao}>Controle de Faltas</Text>
            <ControleFrequencia
              resumo={resumoFrequencia}
              limiteMaximoFaltas={disciplina.limiteMaximoFaltas}
              aoIncrementar={() => incrementar(disciplina.id).then(() => carregarResumos([disciplina]))}
              aoDecrementar={() => decrementar(disciplina.id).then(() => carregarResumos([disciplina]))}
              aoAbrirHistorico={() => {}}
            />
          </>
        )}

        {/* === ABA TAREFAS === */}
        {abaAtiva === 'tarefas' && (
          <>
            <View style={estilos.barraAcoes}>
              <Text style={estilos.rotuloSecao}>Tarefas da Matéria</Text>
              <TouchableOpacity
                style={estilos.botaoNovaAvaliacao}
                onPress={() => {
                  setTarefaEmEdicao(null);
                  setModalTarefaVisivel(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={estilos.botaoNovaAvaliacaoTexto}>+ Nova Tarefa</Text>
              </TouchableOpacity>
            </View>

            {tarefas.length === 0 ? (
              <View style={estilos.emptyState}>
                <Text style={estilos.emptyTitulo}>Nenhuma tarefa cadastrada</Text>
                <Text style={estilos.emptyDescricao}>
                  Adicione listas de exercícios, leituras e pendências vinculadas a {disciplina.nome}.
                </Text>
              </View>
            ) : (
              tarefas.map((t) => (
                <CardTarefa
                  key={t.id}
                  tarefa={t}
                  aoAlternarConclusao={alternarConclusao}
                  aoEditar={(tarefa) => {
                    setTarefaEmEdicao(tarefa);
                    setModalTarefaVisivel(true);
                  }}
                  aoExcluir={(tarefa) => setTarefaParaExcluir(tarefa)}
                />
              ))
            )}
          </>
        )}

        {/* === ABA HORÁRIOS === */}
        {abaAtiva === 'horarios' && (
          <>
            <Text style={estilos.rotuloSecao}>Horários Semanais</Text>
            {horarios.length === 0 ? (
              <View style={estilos.emptyState}>
                <Text style={estilos.emptyTitulo}>Nenhum horário configurado</Text>
                <Text style={estilos.emptyDescricao}>
                  Edite a disciplina para adicionar horários à grade semanal.
                </Text>
              </View>
            ) : (
              horarios.map((h, index) => (
                <View key={index} style={estilos.cardHorario}>
                  <View style={[estilos.badgeDia, { backgroundColor: disciplina.corIdentificacao }]}>
                    <Text style={estilos.badgeDiaTexto}>{DIAS_SEMANA_LABELS[h.diaSemana].substring(0, 3).toUpperCase()}</Text>
                  </View>
                  <View style={estilos.infoHorario}>
                    <Text style={estilos.horarioPeriodo}>{h.horarioInicio} às {h.horarioFim}</Text>
                    {h.localSala ? (
                      <Text style={estilos.horarioSala}>Sala: {h.localSala}</Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de Formulário de Avaliação */}
      <ModalFormularioAvaliacao
        visivel={modalFormularioVisivel}
        disciplinaId={disciplina.id}
        criterioAprovacao={disciplina.criterioAprovacao}
        avaliacaoParaEditar={avaliacaoEmEdicao}
        aoFechar={() => setModalFormularioVisivel(false)}
        aoSalvar={salvarFormulario}
      />

      {/* Modal de Formulário de Tarefa */}
      <ModalFormularioTarefa
        visivel={modalTarefaVisivel}
        disciplinas={[disciplina]}
        disciplinaIdPreSelecionada={disciplina.id}
        tarefaParaEditar={tarefaEmEdicao}
        aoFechar={() => setModalTarefaVisivel(false)}
        aoSalvar={salvarTarefa}
      />

      {/* Modal de Lançamento de Nota */}
      <ModalLancamentoNota
        visivel={!!avaliacaoLancamentoNota}
        avaliacao={avaliacaoLancamentoNota}
        aoFechar={() => setAvaliacaoLancamentoNota(null)}
        aoSalvar={async (id, nota) => {
          await lancarNota(id, nota);
          await carregarDesempenhos([disciplina]);
        }}
      />

      {/* Modal de Confirmação de Exclusão de Avaliação */}
      <ModalConfirmacao
        visivel={!!avaliacaoParaExcluir}
        titulo="Excluir Avaliação"
        mensagem={`Tem certeza que deseja excluir "${avaliacaoParaExcluir?.titulo}"? Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setAvaliacaoParaExcluir(null)}
        carregando={excluindo}
      />

      {/* Modal de Confirmação de Exclusão de Tarefa */}
      <ModalConfirmacao
        visivel={!!tarefaParaExcluir}
        titulo="Excluir Tarefa"
        mensagem={`Tem certeza que deseja excluir "${tarefaParaExcluir?.titulo}"?`}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        aoConfirmar={confirmarExclusaoTarefa}
        aoCancelar={() => setTarefaParaExcluir(null)}
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
  abas: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoCard,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  aba: {
    flex: 1,
    paddingVertical: tema.espacamento.sm + 2,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  abaAtiva: {
    borderBottomColor: tema.cores.corMarcaPrimaria,
  },
  abaTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  abaTextoAtiva: {
    color: tema.cores.corMarcaPrimaria,
  },
  conteudo: {
    padding: tema.espacamento.md,
    paddingBottom: 40,
  },
  barraAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tema.espacamento.md,
  },
  filtros: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: 3,
    gap: 2,
  },
  filtro: {
    paddingHorizontal: tema.espacamento.sm,
    paddingVertical: 5,
    borderRadius: tema.raioBorda.pequeno,
  },
  filtroAtivo: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  filtroTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  filtroTextoAtivo: {
    color: tema.cores.corTextoPrimario,
  },
  botaoNovaAvaliacao: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.sm + 2,
    paddingVertical: tema.espacamento.xs + 2,
    borderRadius: tema.raioBorda.pequeno,
  },
  botaoNovaAvaliacaoTexto: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: tema.espacamento.xl,
    paddingHorizontal: tema.espacamento.md,
  },
  emptyTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: tema.espacamento.xs,
  },
  emptyDescricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    textAlign: 'center',
    lineHeight: 20,
  },
  rotuloSecao: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: tema.espacamento.sm,
  },
  cardHorario: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm + 2,
    marginBottom: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: '#21262d',
    gap: tema.espacamento.sm,
  },
  badgeDia: {
    paddingHorizontal: tema.espacamento.sm,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.pequeno,
    minWidth: 44,
    alignItems: 'center',
  },
  badgeDiaTexto: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    fontWeight: '800',
  },
  infoHorario: {
    flex: 1,
  },
  horarioPeriodo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '600',
  },
  horarioSala: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
});
