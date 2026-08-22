import React, { useState } from 'react';
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
import { Disciplina, CriarDisciplinaDTO, CriterioAprovacao } from '../../modelos/Disciplina';
import { useDisciplinas } from '../../hooks/useDisciplinas';
import { tema } from '../../estilos/tema';

interface TelaFormularioDisciplinaProps {
  disciplinaParaEditar?: Disciplina | null;
  aoVoltar: () => void;
  aoSalvarSucesso: () => void;
}

export const TelaFormularioDisciplina: React.FC<TelaFormularioDisciplinaProps> = ({
  disciplinaParaEditar,
  aoVoltar,
  aoSalvarSucesso,
}) => {
  const { criarDisciplina, atualizarDisciplina } = useDisciplinas();

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

  // Estados de controle e validação
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

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

      if (disciplinaParaEditar) {
        await atualizarDisciplina(disciplinaParaEditar.id, dados);
      } else {
        await criarDisciplina(dados);
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
          rotulo="Local / Sala de Aula"
          placeholder="Ex: Bloco B, Sala 304"
          value={localSala}
          onChangeText={setLocalSala}
        />

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
