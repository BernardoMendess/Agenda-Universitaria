import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useDisciplinas } from '../../hooks/useDisciplinas';
import { useFrequencia } from '../../hooks/useFrequencia';
import { CardDisciplina } from '../../componentes/CardDisciplina';
import { ModalConfirmacao } from '../../componentes/ModalConfirmacao';
import { ModalHistoricoFaltas } from '../../componentes/ModalHistoricoFaltas';
import { ModalAlertaFaltasCritico } from '../../componentes/ModalAlertaFaltasCritico';
import { Disciplina } from '../../modelos/Disciplina';
import { tema } from '../../estilos/tema';

interface TelaDisciplinasProps {
  aoCriarDisciplina: () => void;
  aoEditarDisciplina: (disciplina: Disciplina) => void;
  aoSelecionarDisciplina: (disciplina: Disciplina) => void;
}

export const TelaDisciplinas: React.FC<TelaDisciplinasProps> = ({
  aoCriarDisciplina,
  aoEditarDisciplina,
  aoSelecionarDisciplina,
}) => {
  const { disciplinas, carregando, erro, excluirDisciplina } = useDisciplinas();
  const {
    resumos,
    alertaCritico,
    fecharAlertaCritico,
    carregarResumos,
    incrementar,
    decrementar,
    registrarFaltaDetalhada,
    removerFalta,
    obterHistorico,
  } = useFrequencia();

  const [busca, setBusca] = useState('');
  const [disciplinaParaExcluir, setDisciplinaParaExcluir] = useState<Disciplina | null>(null);
  const [disciplinaHistorico, setDisciplinaHistorico] = useState<Disciplina | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (disciplinas.length > 0) {
      carregarResumos(disciplinas);
    }
  }, [disciplinas, carregarResumos]);

  const disciplinasFiltradas = useMemo(() => {
    if (!busca.trim()) return disciplinas;
    const termo = busca.toLowerCase();
    return disciplinas.filter(
      (d) =>
        d.nome.toLowerCase().includes(termo) ||
        (d.codigo && d.codigo.toLowerCase().includes(termo)) ||
        (d.nomeProfessor && d.nomeProfessor.toLowerCase().includes(termo))
    );
  }, [disciplinas, busca]);

  const confirmarExclusao = async () => {
    if (!disciplinaParaExcluir) return;
    try {
      setExcluindo(true);
      await excluirDisciplina(disciplinaParaExcluir.id);
      setDisciplinaParaExcluir(null);
    } catch (e) {
      // Erro tratado no hook
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <SafeAreaView style={estilos.container}>
      {/* Cabeçalho */}
      <View style={estilos.cabecalho}>
        <View style={estilos.cabecalhoTextos}>
          <Text style={estilos.titulo}>Disciplinas</Text>
          <Text style={estilos.subtitulo}>
            {disciplinas.length}{' '}
            {disciplinas.length === 1 ? 'matéria cadastrada' : 'matérias cadastradas'}
          </Text>
        </View>

        <TouchableOpacity
          style={estilos.botaoNovo}
          onPress={aoCriarDisciplina}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Adicionar nova disciplina"
        >
          <Text style={estilos.textoBotaoNovo}>+ Nova Matéria</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de Busca */}
      <View style={estilos.containerBusca}>
        <TextInput
          style={estilos.inputBusca}
          placeholder="Buscar por nome, código ou professor..."
          placeholderTextColor={tema.cores.corTextoSecundario}
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Conteúdo Principal */}
      {carregando ? (
        <View style={estilos.centralizado}>
          <ActivityIndicator size="large" color={tema.cores.corMarcaPrimaria} />
        </View>
      ) : erro ? (
        <View style={estilos.centralizado}>
          <Text style={estilos.textoErro}>{erro}</Text>
        </View>
      ) : disciplinasFiltradas.length === 0 ? (
        <View style={estilos.emptyState}>
          <Text style={estilos.emptyTitulo}>
            {busca ? 'Nenhuma disciplina encontrada' : 'Nenhuma disciplina cadastrada'}
          </Text>
          <Text style={estilos.emptyDescricao}>
            {busca
              ? 'Tente buscar com outros termos.'
              : 'Comece adicionando as matérias deste semestre para gerenciar faltas, notas e horários.'}
          </Text>
          {!busca ? (
            <TouchableOpacity
              style={estilos.emptyBotao}
              onPress={aoCriarDisciplina}
              activeOpacity={0.8}
            >
              <Text style={estilos.emptyBotaoTexto}>Cadastrar Primeira Disciplina</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={disciplinasFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardDisciplina
              disciplina={item}
              resumo={resumos[item.id]}
              aoPressionar={aoSelecionarDisciplina}
              aoEditar={aoEditarDisciplina}
              aoExcluir={(disc) => setDisciplinaParaExcluir(disc)}
              aoIncrementarFalta={incrementar}
              aoDecrementarFalta={decrementar}
              aoAbrirHistoricoFaltas={(disc) => setDisciplinaHistorico(disc)}
            />
          )}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Exclusão */}
      <ModalConfirmacao
        visivel={!!disciplinaParaExcluir}
        titulo="Excluir Disciplina"
        mensagem={`Tem certeza que deseja excluir "${disciplinaParaExcluir?.nome}"? Todos os horários e histórico de faltas associados serão removidos permanentemente.`}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setDisciplinaParaExcluir(null)}
        carregando={excluindo}
      />

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

      {/* Alerta de faltas */}
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
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tema.espacamento.md,
    paddingTop: tema.espacamento.xxl,
    paddingBottom: tema.espacamento.sm,
  },
  cabecalhoTextos: {
    flex: 1,
    marginRight: 12,
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
  botaoNovo: {
    flexShrink: 0,
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
  },
  textoBotaoNovo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  containerBusca: {
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
  },
  inputBusca: {
    backgroundColor: tema.cores.corFundoElevado,
    color: tema.cores.corTextoPrimario,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm + 2,
    borderRadius: tema.raioBorda.padrao,
    fontSize: tema.tipografia.pequeno,
  },
  lista: {
    padding: tema.espacamento.md,
    paddingBottom: 100,
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.lg,
  },
  textoErro: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.normal,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.xl,
  },
  emptyIcone: {
    fontSize: 48,
    marginBottom: tema.espacamento.md,
  },
  emptyTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: tema.espacamento.xs,
  },
  emptyDescricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: tema.espacamento.lg,
  },
  emptyBotao: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.lg,
    paddingVertical: tema.espacamento.sm + 4,
    borderRadius: tema.raioBorda.padrao,
  },
  emptyBotaoTexto: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '600',
    fontSize: tema.tipografia.normal,
  },
});
