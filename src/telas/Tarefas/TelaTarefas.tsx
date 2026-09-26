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
import { useTarefas } from '../../hooks/useTarefas';
import { useDisciplinas } from '../../hooks/useDisciplinas';
import { CardTarefa } from '../../componentes/CardTarefa';
import { ModalFormularioTarefa } from '../../componentes/ModalFormularioTarefa';
import { ModalConfirmacao } from '../../componentes/ModalConfirmacao';
import { TarefaComDisciplina, CriarTarefaDTO, AtualizarTarefaDTO } from '../../modelos/Tarefa';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../../estilos/tema';

type FiltroStatus = 'TODAS' | 'PENDENTES' | 'CONCLUIDAS' | 'HOJE' | 'ATRASADAS';

export const TelaTarefas: React.FC = () => {
  const {
    tarefas,
    estatisticas,
    carregando,
    carregarTarefas,
    criarTarefa,
    atualizarTarefa,
    alternarConclusao,
    excluirTarefa,
  } = useTarefas();

  const { disciplinas } = useDisciplinas();

  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODAS');
  const [disciplinaFiltroId, setDisciplinaFiltroId] = useState<string | undefined>(undefined);
  const [modalFormularioVisivel, setModalFormularioVisivel] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<TarefaComDisciplina | null>(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<TarefaComDisciplina | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const recarregar = useCallback(async () => {
    const params: any = {};
    if (disciplinaFiltroId) {
      params.disciplinaId = disciplinaFiltroId;
    }
    if (filtroStatus === 'PENDENTES') params.status = 'PENDENTES';
    else if (filtroStatus === 'CONCLUIDAS') params.status = 'CONCLUIDAS';
    else if (filtroStatus === 'HOJE') params.apenasHoje = true;
    else if (filtroStatus === 'ATRASADAS') params.atrasadas = true;

    await carregarTarefas(params);
  }, [carregarTarefas, filtroStatus, disciplinaFiltroId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const abrirCriacao = () => {
    setTarefaEmEdicao(null);
    setModalFormularioVisivel(true);
  };

  const abrirEdicao = (tarefa: TarefaComDisciplina) => {
    setTarefaEmEdicao(tarefa);
    setModalFormularioVisivel(true);
  };

  const salvarFormulario = async (dados: CriarTarefaDTO | AtualizarTarefaDTO) => {
    if (tarefaEmEdicao) {
      await atualizarTarefa(tarefaEmEdicao.id, dados as AtualizarTarefaDTO);
    } else {
      await criarTarefa(dados as CriarTarefaDTO);
    }
    await recarregar();
  };

  const confirmarExclusao = async () => {
    if (!tarefaParaExcluir) return;
    try {
      setExcluindo(true);
      await excluirTarefa(tarefaParaExcluir.id);
      setTarefaParaExcluir(null);
      await recarregar();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao excluir tarefa.');
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
        {/* Cabeçalho */}
        <View style={estilos.cabecalho}>
          <View style={estilos.cabecalhoTextos}>
            <Text style={estilos.titulo}>Tarefas & To-Do</Text>
            <Text style={estilos.subtitulo}>
              Organize suas entregas, leituras e pendências
            </Text>
          </View>
          <TouchableOpacity
            style={estilos.botaoNovo}
            onPress={abrirCriacao}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={estilos.textoBotaoNovo}>Nova</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo Estatístico */}
        <View style={estilos.cardResumo}>
          <View style={estilos.linhaResumo}>
            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>{estatisticas.pendentes}</Text>
              <Text style={estilos.rotuloEstatistica}>Pendentes</Text>
            </View>
            <View style={estilos.separador} />
            <View style={estilos.itemEstatistica}>
              <Text
                style={[
                  estilos.numeroEstatistica,
                  {
                    color:
                      estatisticas.atrasadas > 0
                        ? tema.cores.corStatusCritico
                        : tema.cores.corTextoPrimario,
                  },
                ]}
              >
                {estatisticas.atrasadas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Atrasadas</Text>
            </View>
            <View style={estilos.separador} />
            <View style={estilos.itemEstatistica}>
              <Text
                style={[
                  estilos.numeroEstatistica,
                  { color: tema.cores.corStatusSeguro },
                ]}
              >
                {estatisticas.concluidas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Concluídas</Text>
            </View>
            <View style={estilos.separador} />
            <View style={estilos.itemEstatistica}>
              <Text
                style={[
                  estilos.numeroEstatistica,
                  { color: tema.cores.corMarcaPrimaria },
                ]}
              >
                {estatisticas.percentualConclusao}%
              </Text>
              <Text style={estilos.rotuloEstatistica}>Progresso</Text>
            </View>
          </View>
        </View>

        {/* Filtros por Status */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.filtrosScroll}
        >
          <TouchableOpacity
            style={[
              estilos.chipFiltro,
              filtroStatus === 'TODAS' && estilos.chipFiltroAtivo,
            ]}
            onPress={() => setFiltroStatus('TODAS')}
          >
            <Text
              style={[
                estilos.textoChipFiltro,
                filtroStatus === 'TODAS' && estilos.textoChipFiltroAtivo,
              ]}
            >
              Todas ({estatisticas.total})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.chipFiltro,
              filtroStatus === 'PENDENTES' && estilos.chipFiltroAtivo,
            ]}
            onPress={() => setFiltroStatus('PENDENTES')}
          >
            <Text
              style={[
                estilos.textoChipFiltro,
                filtroStatus === 'PENDENTES' && estilos.textoChipFiltroAtivo,
              ]}
            >
              Pendentes ({estatisticas.pendentes})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.chipFiltro,
              filtroStatus === 'HOJE' && estilos.chipFiltroAtivo,
            ]}
            onPress={() => setFiltroStatus('HOJE')}
          >
            <Text
              style={[
                estilos.textoChipFiltro,
                filtroStatus === 'HOJE' && estilos.textoChipFiltroAtivo,
              ]}
            >
              Hoje ({estatisticas.hoje})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.chipFiltro,
              filtroStatus === 'ATRASADAS' && estilos.chipFiltroAtivo,
            ]}
            onPress={() => setFiltroStatus('ATRASADAS')}
          >
            <Text
              style={[
                estilos.textoChipFiltro,
                filtroStatus === 'ATRASADAS' && estilos.textoChipFiltroAtivo,
                { color: estatisticas.atrasadas > 0 ? tema.cores.corStatusCritico : tema.cores.corTextoSecundario },
              ]}
            >
              Atrasadas ({estatisticas.atrasadas})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.chipFiltro,
              filtroStatus === 'CONCLUIDAS' && estilos.chipFiltroAtivo,
            ]}
            onPress={() => setFiltroStatus('CONCLUIDAS')}
          >
            <Text
              style={[
                estilos.textoChipFiltro,
                filtroStatus === 'CONCLUIDAS' && estilos.textoChipFiltroAtivo,
              ]}
            >
              Concluídas ({estatisticas.concluidas})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Filtros por Disciplina (se houver matérias cadastradas) */}
        {disciplinas.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[estilos.filtrosScroll, { marginTop: 4 }]}
          >
            <TouchableOpacity
              style={[
                estilos.chipDisciplinaFiltro,
                !disciplinaFiltroId && estilos.chipDisciplinaFiltroAtivo,
              ]}
              onPress={() => setDisciplinaFiltroId(undefined)}
            >
              <Text
                style={[
                  estilos.textoChipDisciplinaFiltro,
                  !disciplinaFiltroId && estilos.textoChipDisciplinaFiltroAtivo,
                ]}
              >
                Todas Matérias
              </Text>
            </TouchableOpacity>

            {disciplinas.map((disc) => {
              const selecionada = disciplinaFiltroId === disc.id;
              return (
                <TouchableOpacity
                  key={disc.id}
                  style={[
                    estilos.chipDisciplinaFiltro,
                    selecionada && {
                      backgroundColor: `${disc.corIdentificacao}25`,
                      borderColor: disc.corIdentificacao,
                    },
                  ]}
                  onPress={() =>
                    setDisciplinaFiltroId(selecionada ? undefined : disc.id)
                  }
                >
                  <View
                    style={[
                      estilos.pontoCor,
                      { backgroundColor: disc.corIdentificacao },
                    ]}
                  />
                  <Text
                    style={[
                      estilos.textoChipDisciplinaFiltro,
                      selecionada && {
                        color: disc.corIdentificacao,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {disc.nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Lista de Tarefas */}
        <View style={estilos.secaoLista}>
          {tarefas.length === 0 ? (
            <View style={estilos.cardVazio}>
              <Text style={estilos.textoVazio}>
                {carregando
                  ? 'Carregando tarefas...'
                  : 'Nenhuma tarefa encontrada neste filtro.'}
              </Text>
              {!carregando && (
                <TouchableOpacity
                  style={estilos.botaoAdicionarVazio}
                  onPress={abrirCriacao}
                >
                  <Text style={estilos.textoBotaoAdicionarVazio}>
                    + Criar Primeira Tarefa
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            tarefas.map((tarefa) => (
              <CardTarefa
                key={tarefa.id}
                tarefa={tarefa}
                aoAlternarConclusao={alternarConclusao}
                aoEditar={abrirEdicao}
                aoExcluir={(t) => setTarefaParaExcluir(t)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de Formulário */}
      <ModalFormularioTarefa
        visivel={modalFormularioVisivel}
        disciplinas={disciplinas}
        disciplinaIdPreSelecionada={disciplinaFiltroId}
        tarefaParaEditar={tarefaEmEdicao}
        aoFechar={() => setModalFormularioVisivel(false)}
        aoSalvar={salvarFormulario}
      />

      {/* Modal de Exclusão */}
      <ModalConfirmacao
        visivel={!!tarefaParaExcluir}
        titulo="Excluir Tarefa"
        mensagem={`Tem certeza que deseja excluir "${tarefaParaExcluir?.titulo}"?`}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        aoConfirmar={confirmarExclusao}
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
  conteudo: {
    padding: tema.espacamento.md,
    paddingBottom: 100,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tema.espacamento.xxl,
    marginBottom: tema.espacamento.md,
  },
  titulo: {
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
  cabecalhoTextos: {
    flex: 1,
    marginRight: 12,
  },
  botaoNovo: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
    minHeight: 40,
  },
  textoBotaoNovo: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  cardResumo: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    marginBottom: tema.espacamento.md,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  rotuloEstatistica: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  separador: {
    width: 1,
    height: 26,
    backgroundColor: tema.cores.corFundoElevado,
  },
  filtrosScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  chipFiltro: {
    backgroundColor: tema.cores.corFundoCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipFiltroAtivo: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}25`,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoChipFiltro: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
  },
  textoChipFiltroAtivo: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
  chipDisciplinaFiltro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoCard,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipDisciplinaFiltroAtivo: {
    backgroundColor: tema.cores.corFundoElevado,
    borderColor: tema.cores.bordaPadrao,
  },
  pontoCor: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  textoChipDisciplinaFiltro: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
  },
  textoChipDisciplinaFiltroAtivo: {
    color: tema.cores.corTextoPrimario,
    fontWeight: '600',
  },
  secaoLista: {
    marginTop: tema.espacamento.sm,
  },
  cardVazio: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
    marginTop: tema.espacamento.sm,
  },
  textoVazio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginBottom: tema.espacamento.md,
    textAlign: 'center',
  },
  botaoAdicionarVazio: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
  },
  textoBotaoAdicionarVazio: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
});
