import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Cabecalho } from '../../componentes/Cabecalho';
import { CampoTexto } from '../../componentes/CampoTexto';
import { Botao } from '../../componentes/Botao';
import { SeletorCor } from '../../componentes/SeletorCor';
import { SeletorHorarioModal } from '../../componentes/SeletorHorarioModal';
import { Disciplina, CriarDisciplinaDTO, CriterioAprovacao } from '../../modelos/Disciplina';
import { CriarHorarioAulaDTO, DIAS_SEMANA_ABREV } from '../../modelos/HorarioAula';
import { useDisciplinas } from '../../hooks/useDisciplinas';
import { useGradeHoraria } from '../../hooks/useGradeHoraria';
import { tema } from '../../estilos/tema';

interface TelaFormularioDisciplinaProps {
  disciplinaParaEditar?: Disciplina | null;
  aoVoltar: () => void;
  aoSalvarSucesso: () => void;
}

type BlocoHorarioItem = Omit<CriarHorarioAulaDTO, 'disciplinaId'>;

export const TelaFormularioDisciplina: React.FC<TelaFormularioDisciplinaProps> = ({
  disciplinaParaEditar,
  aoVoltar,
  aoSalvarSucesso,
}) => {
  const { criarDisciplina, atualizarDisciplina } = useDisciplinas();
  const { obterHorariosDisciplina, definirHorariosDisciplina } = useGradeHoraria();

  // Estados dos campos
  const [nome, setNome] = useState(disciplinaParaEditar?.nome || '');
  const [codigo, setCodigo] = useState(disciplinaParaEditar?.codigo || '');
  const [nomeProfessor, setNomeProfessor] = useState(disciplinaParaEditar?.nomeProfessor || '');
  const [contatoProfessor, setContatoProfessor] = useState(disciplinaParaEditar?.contatoProfessor || '');
  const [localSala, setLocalSala] = useState(disciplinaParaEditar?.localSala || '');
  const [anotacoes, setAnotacoes] = useState(disciplinaParaEditar?.anotacoes || '');
  const [corIdentificacao, setCorIdentificacao] = useState(
    disciplinaParaEditar?.corIdentificacao || tema.cores.paletaDisciplinas[0]
  );
  const [limiteFaltas, setLimiteFaltas] = useState(
    disciplinaParaEditar?.limiteMaximoFaltas !== undefined
      ? String(disciplinaParaEditar.limiteMaximoFaltas)
      : '10'
  );
  const [criterioAprovacao, setCriterioAprovacao] = useState<CriterioAprovacao>(
    disciplinaParaEditar?.criterioAprovacao || 'ARITMETICA'
  );

  // Estados de Grade Horária
  const [horarios, setHorarios] = useState<BlocoHorarioItem[]>([]);
  const [modalHorarioVisivel, setModalHorarioVisivel] = useState(false);
  const [indiceEdicaoHorario, setIndiceEdicaoHorario] = useState<number | null>(null);

  // Estados de controle e validação
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (disciplinaParaEditar) {
      obterHorariosDisciplina(disciplinaParaEditar.id).then((lista) => {
        setHorarios(
          lista.map((h) => ({
            diaSemana: h.diaSemana,
            horarioInicio: h.horarioInicio,
            horarioFim: h.horarioFim,
            localSala: h.localSala,
          }))
        );
      });
    }
  }, [disciplinaParaEditar, obterHorariosDisciplina]);

  const abrirModalNovoHorario = () => {
    setIndiceEdicaoHorario(null);
    setModalHorarioVisivel(true);
  };

  const abrirModalEditarHorario = (indice: number) => {
    setIndiceEdicaoHorario(indice);
    setModalHorarioVisivel(true);
  };

  const salvarHorarioModal = (horario: BlocoHorarioItem) => {
    if (indiceEdicaoHorario !== null) {
      const atualizados = [...horarios];
      atualizados[indiceEdicaoHorario] = horario;
      setHorarios(atualizados);
    } else {
      setHorarios([...horarios, horario]);
    }
  };

  const removerHorario = (indice: number) => {
    setHorarios(horarios.filter((_, i) => i !== indice));
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!nome.trim() || nome.trim().length < 2) {
      novosErros.nome = 'O nome da disciplina deve ter pelo menos 2 caracteres.';
    }

    const valorFaltasNum = Number(limiteFaltas);
    if (limiteFaltas.trim() === '' || isNaN(valorFaltasNum) || valorFaltasNum < 0) {
      novosErros.limiteFaltas = 'O limite deve ser um número maior ou igual a 0.';
    } else if (!Number.isInteger(valorFaltasNum)) {
      novosErros.limiteFaltas = 'O limite de faltas deve ser um número inteiro.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const salvar = async () => {
    if (!validarFormulario()) return;

    try {
      setSalvando(true);

      const dados: CriarDisciplinaDTO = {
        nome: nome.trim(),
        codigo: codigo.trim() || undefined,
        nomeProfessor: nomeProfessor.trim() || undefined,
        contatoProfessor: contatoProfessor.trim() || undefined,
        localSala: localSala.trim() || undefined,
        anotacoes: anotacoes.trim() || undefined,
        corIdentificacao,
        limiteMaximoFaltas: Math.floor(Number(limiteFaltas)),
        criterioAprovacao,
      };

      let idDisciplina = disciplinaParaEditar?.id;

      if (disciplinaParaEditar) {
        await atualizarDisciplina(disciplinaParaEditar.id, dados);
      } else {
        const nova = await criarDisciplina(dados);
        idDisciplina = nova.id;
      }

      // Salva os blocos de horário vinculados
      if (idDisciplina) {
        await definirHorariosDisciplina(idDisciplina, horarios);
      }

      aoSalvarSucesso();
    } catch (err: any) {
      Alert.alert('Erro ao Salvar', err.message || 'Ocorreu um erro ao salvar a disciplina.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.container}>
      <Cabecalho
        titulo={disciplinaParaEditar ? 'Editar Disciplina' : 'Nova Disciplina'}
        subtitulo="Preencha os dados da matéria para o semestre"
        aoVoltar={aoVoltar}
      />

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Identificação Principal */}
        <Text style={estilos.secaoTitulo}>Identificação</Text>

        <CampoTexto
          rotulo="Nome da Disciplina"
          obrigatorio
          placeholder="Ex: Engenharia de Software"
          value={nome}
          onChangeText={setNome}
          erro={erros.nome}
        />

        <CampoTexto
          rotulo="Código da Disciplina"
          placeholder="Ex: CC401"
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
        />

        <SeletorCor
          corSelecionada={corIdentificacao}
          aoSelecionarCor={setCorIdentificacao}
        />

        {/* Informações do Docente e Local */}
        <Text style={estilos.secaoTitulo}>Docente e Local</Text>

        <CampoTexto
          rotulo="Nome do Professor"
          placeholder="Ex: Prof. Dr. Alan Turing"
          value={nomeProfessor}
          onChangeText={setNomeProfessor}
        />

        <CampoTexto
          rotulo="Contato do Professor"
          placeholder="Ex: turing@universidade.edu.br"
          value={contatoProfessor}
          onChangeText={setContatoProfessor}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CampoTexto
          rotulo="Local Padrão / Sala de Aula"
          placeholder="Ex: Bloco B, Sala 304"
          value={localSala}
          onChangeText={setLocalSala}
        />

        {/* Grade Horária Semanal */}
        <View style={estilos.secaoGradeCabecalho}>
          <Text style={estilos.secaoTitulo}>Grade Horária Semanal</Text>
          <TouchableOpacity
            style={estilos.botaoAdicionarHorario}
            onPress={abrirModalNovoHorario}
          >
            <Text style={estilos.textoBotaoAdicionarHorario}>+ Adicionar Aula</Text>
          </TouchableOpacity>
        </View>

        {horarios.length === 0 ? (
          <View style={estilos.cardSemHorario}>
            <Text style={estilos.textoSemHorario}>
              Nenhum horário de aula adicionado ainda. Adicione dias e horários para compor a grade semanal.
            </Text>
          </View>
        ) : (
          horarios.map((h, index) => (
            <View key={index} style={estilos.cardHorarioLinha}>
              <View style={estilos.badgeDia}>
                <Text style={estilos.textoBadgeDia}>{DIAS_SEMANA_ABREV[h.diaSemana]}</Text>
              </View>
              <View style={estilos.infoHorarioBloco}>
                <Text style={estilos.textoHorarioPeriodo}>
                  {h.horarioInicio} às {h.horarioFim}
                </Text>
                {h.localSala ? (
                  <Text style={estilos.textoSalaBloco}>Sala: {h.localSala}</Text>
                ) : null}
              </View>
              <View style={estilos.acoesHorario}>
                <TouchableOpacity
                  style={estilos.botaoAcaoHorario}
                  onPress={() => abrirModalEditarHorario(index)}
                >
                  <Text style={estilos.textoAcaoHorario}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.botaoAcaoHorario}
                  onPress={() => removerHorario(index)}
                >
                  <Text style={estilos.textoAcaoHorarioExcluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Gestão de Frequência e Critérios */}
        <Text style={estilos.secaoTitulo}>Frequência e Avaliação</Text>

        <CampoTexto
          rotulo="Limite Máximo de Faltas"
          obrigatorio
          placeholder="Ex: 10 (use 0 para tolerância zero)"
          value={limiteFaltas}
          onChangeText={setLimiteFaltas}
          keyboardType="numeric"
          erro={erros.limiteFaltas}
          dica="Permite valor 0 para disciplinas sem tolerância a faltas (ex: Estágio)."
        />

        {/* Critério de Média */}
        <View style={estilos.campoContainer}>
          <Text style={estilos.rotuloCampo}>Critério de Média para Aprovação</Text>
          <View style={estilos.seletorCriterio}>
            {(
              [
                { tipo: 'ARITMETICA', texto: 'Média Aritmética' },
                { tipo: 'PONDERADA', texto: 'Média Ponderada' },
                { tipo: 'CUSTOMIZADA', texto: 'Fórmula Customizada' },
              ] as const
            ).map((item) => {
              const ativo = criterioAprovacao === item.tipo;
              return (
                <TouchableOpacity
                  key={item.tipo}
                  style={[
                    estilos.opcaoCriterio,
                    ativo ? estilos.opcaoCriterioAtiva : null,
                  ]}
                  onPress={() => setCriterioAprovacao(item.tipo)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      estilos.textoOpcaoCriterio,
                      ativo ? estilos.textoOpcaoAtiva : null,
                    ]}
                  >
                    {item.texto}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Anotações e Links */}
        <Text style={estilos.secaoTitulo}>Anotações Úteis</Text>

        <CampoTexto
          rotulo="Links, pastas ou avisos"
          placeholder="Ex: Pasta no Drive, links do Moodle, regras de entrega..."
          value={anotacoes}
          onChangeText={setAnotacoes}
          multiline
          numberOfLines={3}
          style={estilos.inputAnotacoes}
        />

        {/* Botão de Ação */}
        <View style={estilos.containerBotoes}>
          <Botao
            titulo={disciplinaParaEditar ? 'Salvar Alterações' : 'Cadastrar Disciplina'}
            aoPressionar={salvar}
            carregando={salvando}
            variante="primario"
          />
        </View>
      </ScrollView>

      {/* Modal de Horário */}
      <SeletorHorarioModal
        visivel={modalHorarioVisivel}
        horarioEdicao={indiceEdicaoHorario !== null ? horarios[indiceEdicaoHorario] : null}
        aoFechar={() => setModalHorarioVisivel(false)}
        aoSalvar={salvarHorarioModal}
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
    paddingHorizontal: tema.espacamento.md,
    paddingBottom: tema.espacamento.xl + 20,
  },
  secaoTitulo: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
    marginTop: tema.espacamento.md,
    marginBottom: tema.espacamento.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  secaoGradeCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tema.espacamento.sm,
  },
  botaoAdicionarHorario: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  textoBotaoAdicionarHorario: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.micro,
    fontWeight: '700',
  },
  cardSemHorario: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.md,
    marginBottom: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#21262d',
    borderStyle: 'dashed',
  },
  textoSemHorario: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textAlign: 'center',
    lineHeight: 18,
  },
  cardHorarioLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.padrao,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  badgeDia: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  textoBadgeDia: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    fontWeight: 'bold',
  },
  infoHorarioBloco: {
    flex: 1,
  },
  textoHorarioPeriodo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  textoSalaBloco: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  acoesHorario: {
    flexDirection: 'row',
    gap: 6,
  },
  botaoAcaoHorario: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  textoAcaoHorario: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  textoAcaoHorarioExcluir: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  campoContainer: {
    marginBottom: tema.espacamento.md,
  },
  rotuloCampo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '500',
    marginBottom: tema.espacamento.xs,
  },
  seletorCriterio: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: 4,
    gap: 4,
  },
  opcaoCriterio: {
    flex: 1,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.pequeno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoCriterioAtiva: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  textoOpcaoCriterio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
    textAlign: 'center',
  },
  textoOpcaoAtiva: {
    color: tema.cores.corTextoPrimario,
  },
  inputAnotacoes: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  containerBotoes: {
    marginTop: tema.espacamento.lg,
  },
});
