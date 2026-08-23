import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  Tarefa,
  CriarTarefaDTO,
  AtualizarTarefaDTO,
  PrioridadeTarefa,
  PRIORIDADE_LABELS,
  PRIORIDADE_CORES,
} from '../modelos/Tarefa';
import { Disciplina } from '../modelos/Disciplina';
import { CampoData } from './CampoData';
import { tema } from '../estilos/tema';

interface ModalFormularioTarefaProps {
  visivel: boolean;
  disciplinas: Disciplina[];
  disciplinaIdPreSelecionada?: string;
  tarefaParaEditar?: Tarefa | null;
  aoFechar: () => void;
  aoSalvar: (dados: CriarTarefaDTO | AtualizarTarefaDTO) => Promise<void>;
}

const PRIORIDADES: PrioridadeTarefa[] = ['BAIXA', 'MEDIA', 'ALTA'];

const obterDataHoje = (): string => {
  return new Date().toISOString().split('T')[0];
};

const obterDataAmanha = (): string => {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return amanha.toISOString().split('T')[0];
};

export const ModalFormularioTarefa: React.FC<ModalFormularioTarefaProps> = ({
  visivel,
  disciplinas,
  disciplinaIdPreSelecionada,
  tarefaParaEditar,
  aoFechar,
  aoSalvar,
}) => {
  const editando = !!tarefaParaEditar;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [disciplinaId, setDisciplinaId] = useState<string | undefined>(
    disciplinaIdPreSelecionada
  );
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('MEDIA');
  const [dataLimite, setDataLimite] = useState('');
  const [horarioLimite, setHorarioLimite] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tarefaParaEditar) {
      setTitulo(tarefaParaEditar.titulo);
      setDescricao(tarefaParaEditar.descricao || '');
      setDisciplinaId(tarefaParaEditar.disciplinaId);
      setPrioridade(tarefaParaEditar.prioridade || 'MEDIA');
      setDataLimite(tarefaParaEditar.dataLimite || '');
      setHorarioLimite(tarefaParaEditar.horarioLimite || '');
    } else {
      setTitulo('');
      setDescricao('');
      setDisciplinaId(disciplinaIdPreSelecionada);
      setPrioridade('MEDIA');
      setDataLimite('');
      setHorarioLimite('');
    }
    setErros({});
  }, [tarefaParaEditar, disciplinaIdPreSelecionada, visivel]);

  const validar = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!titulo.trim() || titulo.trim().length < 2) {
      novosErros.titulo = 'O título deve ter pelo menos 2 caracteres.';
    }

    if (dataLimite.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dataLimite)) {
      novosErros.dataLimite = 'Data inválida. Use o formato AAAA-MM-DD.';
    }

    if (
      horarioLimite.trim() &&
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(horarioLimite)
    ) {
      novosErros.horarioLimite = 'Horário inválido. Use o formato HH:mm.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validar()) return;

    try {
      setSalvando(true);
      if (editando && tarefaParaEditar) {
        const dadosAtualizacao: AtualizarTarefaDTO = {
          titulo: titulo.trim(),
          descricao: descricao.trim() ? descricao.trim() : null,
          disciplinaId: disciplinaId ? disciplinaId : null,
          prioridade,
          dataLimite: dataLimite.trim() ? dataLimite.trim() : null,
          horarioLimite: horarioLimite.trim() ? horarioLimite.trim() : null,
        };
        await aoSalvar(dadosAtualizacao);
      } else {
        const dadosCriacao: CriarTarefaDTO = {
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          disciplinaId: disciplinaId || undefined,
          prioridade,
          dataLimite: dataLimite.trim() || undefined,
          horarioLimite: horarioLimite.trim() || undefined,
        };
        await aoSalvar(dadosCriacao);
      }
      aoFechar();
    } catch (e: any) {
      Alert.alert('Erro ao Salvar', e.message || 'Ocorreu um erro ao salvar a tarefa.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent={true}
      onRequestClose={aoFechar}
    >
      <SafeAreaView style={estilos.modalOverlay}>
        <View style={estilos.modalContainer}>
          {/* Cabeçalho */}
          <View style={estilos.modalCabecalho}>
            <Text style={estilos.modalTitulo}>
              {editando ? 'Editar Tarefa' : 'Nova Tarefa'}
            </Text>
            <TouchableOpacity onPress={aoFechar} style={estilos.botaoFechar}>
              <Text style={estilos.textoBotaoFechar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={estilos.formulario}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Título */}
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>
                Título da Tarefa <Text style={estilos.obrigatorio}>*</Text>
              </Text>
              <TextInput
                style={[estilos.input, erros.titulo ? estilos.inputErro : null]}
                placeholder="Ex: Leitura do artigo X, Entregar lista 2"
                placeholderTextColor={tema.cores.corTextoSecundario}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={150}
              />
              {erros.titulo && (
                <Text style={estilos.textoErro}>{erros.titulo}</Text>
              )}
            </View>

            {/* Descrição / Notas */}
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Descrição / Observações (Opcional)</Text>
              <TextInput
                style={[estilos.input, estilos.inputArea]}
                placeholder="Detalhes adicionais, links ou lembretes..."
                placeholderTextColor={tema.cores.corTextoSecundario}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Vínculo de Disciplina */}
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Vincular à Disciplina</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={estilos.chipsScroll}
              >
                {/* Opção Avulsa */}
                <TouchableOpacity
                  style={[
                    estilos.chipDisciplina,
                    !disciplinaId && estilos.chipDisciplinaAtivo,
                  ]}
                  onPress={() => setDisciplinaId(undefined)}
                >
                  <Text
                    style={[
                      estilos.textoChipDisciplina,
                      !disciplinaId && estilos.textoChipDisciplinaAtivo,
                    ]}
                  >
                    Nenhuma (Avulsa)
                  </Text>
                </TouchableOpacity>

                {/* Lista de Disciplinas cadastradas */}
                {disciplinas.map((disc) => {
                  const selecionada = disciplinaId === disc.id;
                  return (
                    <TouchableOpacity
                      key={disc.id}
                      style={[
                        estilos.chipDisciplina,
                        selecionada && {
                          backgroundColor: `${disc.corIdentificacao}25`,
                          borderColor: disc.corIdentificacao,
                        },
                      ]}
                      onPress={() => setDisciplinaId(disc.id)}
                    >
                      <View
                        style={[
                          estilos.pontoCor,
                          { backgroundColor: disc.corIdentificacao },
                        ]}
                      />
                      <Text
                        style={[
                          estilos.textoChipDisciplina,
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
            </View>

            {/* Prioridade */}
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Prioridade</Text>
              <View style={estilos.linhaBotoesOpcao}>
                {PRIORIDADES.map((p) => {
                  const selecionada = prioridade === p;
                  const cor = PRIORIDADE_CORES[p];
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        estilos.botaoOpcao,
                        selecionada && {
                          backgroundColor: `${cor}25`,
                          borderColor: cor,
                        },
                      ]}
                      onPress={() => setPrioridade(p)}
                    >
                      <Text
                        style={[
                          estilos.textoBotaoOpcao,
                          selecionada && { color: cor, fontWeight: '700' },
                        ]}
                      >
                        {PRIORIDADE_LABELS[p]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Data Limite com Calendário */}
            <CampoData
              rotulo="Data Limite"
              valor={dataLimite}
              aoSelecionarData={(novaData) => {
                setDataLimite(novaData);
                if (erros.dataLimite) {
                  setErros((e) => ({ ...e, dataLimite: '' }));
                }
              }}
              placeholder="Toque para escolher no calendário..."
              permiteLimpar
              erro={erros.dataLimite}
              dica="Opcional: selecione a data de entrega no calendário"
            />

            {/* Horário Limite */}
            <View style={estilos.campo}>
              <Text style={estilos.rotulo}>Horário Limite</Text>
              <TextInput
                style={[
                  estilos.input,
                  erros.horarioLimite ? estilos.inputErro : null,
                ]}
                placeholder="Ex: 18:00"
                placeholderTextColor={tema.cores.corTextoSecundario}
                value={horarioLimite}
                onChangeText={(t) => {
                  const numeros = t.replace(/\D/g, '');
                  const formatado = numeros.length <= 2 ? numeros : `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
                  setHorarioLimite(formatado);
                  if (erros.horarioLimite) {
                    setErros((e) => ({ ...e, horarioLimite: '' }));
                  }
                }}
                keyboardType="numeric"
                maxLength={5}
              />
              {erros.horarioLimite && (
                <Text style={estilos.textoErro}>{erros.horarioLimite}</Text>
              )}
            </View>
          </ScrollView>

          {/* Rodapé com Ações */}
          <View style={estilos.modalRodape}>
            <TouchableOpacity
              style={estilos.botaoCancelar}
              onPress={aoFechar}
              disabled={salvando}
            >
              <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                estilos.botaoSalvar,
                salvando && estilos.botaoDesabilitado,
              ]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              <Text style={estilos.textoBotaoSalvar}>
                {salvando
                  ? 'Salvando...'
                  : editando
                  ? 'Atualizar Tarefa'
                  : 'Criar Tarefa'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: tema.cores.corFundoCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  modalCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tema.espacamento.md,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  modalTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  botaoFechar: {
    padding: 6,
  },
  textoBotaoFechar: {
    color: tema.cores.corTextoSecundario,
    fontSize: 18,
    fontWeight: 'bold',
  },
  formulario: {
    padding: tema.espacamento.md,
  },
  campo: {
    marginBottom: tema.espacamento.md,
  },
  rotulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
    marginBottom: 6,
  },
  obrigatorio: {
    color: tema.cores.corStatusCritico,
  },
  input: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
  },
  inputArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  inputErro: {
    borderColor: tema.cores.corStatusCritico,
  },
  textoErro: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    marginTop: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chipDisciplina: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  chipDisciplinaAtivo: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}25`,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  pontoCor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  textoChipDisciplina: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
  },
  textoChipDisciplinaAtivo: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
  linhaBotoesOpcao: {
    flexDirection: 'row',
    gap: 8,
  },
  botaoOpcao: {
    flex: 1,
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 10,
    alignItems: 'center',
  },
  textoBotaoOpcao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
  linhaAtalhos: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  botaoAtalho: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  botaoAtalhoAtivo: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}20`,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoBotaoAtalho: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    fontWeight: '500',
  },
  modalRodape: {
    flexDirection: 'row',
    gap: 12,
    padding: tema.espacamento.md,
    borderTopWidth: 1,
    borderTopColor: '#21262d',
  },
  botaoCancelar: {
    flex: 1,
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textoBotaoCancelar: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoSalvar: {
    flex: 2,
    backgroundColor: tema.cores.corMarcaPrimaria,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textoBotaoSalvar: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  botaoDesabilitado: {
    opacity: 0.6,
  },
});
