import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Disciplina } from '../modelos/Disciplina';
import { Falta, ResumoFrequencia } from '../modelos/Falta';
import { CampoData } from './CampoData';
import { tema } from '../estilos/tema';

interface ModalHistoricoFaltasProps {
  visivel: boolean;
  disciplina: Disciplina | null;
  resumo?: ResumoFrequencia;
  aoFechar: () => void;
  aoBuscarHistorico: (disciplinaId: string) => Promise<Falta[]>;
  aoAdicionarFaltaDetalhada: (dados: {
    disciplinaId: string;
    data?: string;
    horario?: string;
    justificativa?: string;
  }) => Promise<any>;
  aoRemoverFalta: (id: string, disciplinaId: string) => Promise<any>;
}

export const ModalHistoricoFaltas: React.FC<ModalHistoricoFaltasProps> = ({
  visivel,
  disciplina,
  resumo,
  aoFechar,
  aoBuscarHistorico,
  aoAdicionarFaltaDetalhada,
  aoRemoverFalta,
}) => {
  const [historico, setHistorico] = useState<Falta[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modoAdicionar, setModoAdicionar] = useState(false);

  // Form states
  const [dataInput, setDataInput] = useState('');
  const [horarioInput, setHorarioInput] = useState('');
  const [justificativaInput, setJustificativaInput] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    if (visivel && disciplina) {
      carregarHistorico();
      const hoje = new Date();
      setDataInput(hoje.toISOString().split('T')[0]);
      setHorarioInput(
        `${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`
      );
      setJustificativaInput('');
      setModoAdicionar(false);
      setErroForm(null);
    }
  }, [visivel, disciplina]);

  const carregarHistorico = async () => {
    if (!disciplina) return;
    try {
      setCarregando(true);
      const lista = await aoBuscarHistorico(disciplina.id);
      setHistorico(lista);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarFalta = async () => {
    if (!disciplina) return;
    try {
      setSalvando(true);
      setErroForm(null);

      await aoAdicionarFaltaDetalhada({
        disciplinaId: disciplina.id,
        data: dataInput.trim() || undefined,
        horario: horarioInput.trim() || undefined,
        justificativa: justificativaInput.trim() || undefined,
      });

      setModoAdicionar(false);
      setJustificativaInput('');
      await carregarHistorico();
    } catch (e: any) {
      setErroForm(e.message || 'Erro ao registrar falta.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirFalta = async (faltaId: string) => {
    if (!disciplina) return;
    try {
      await aoRemoverFalta(faltaId, disciplina.id);
      setHistorico((prev) => prev.filter((f) => f.id !== faltaId));
    } catch (e) {
      // erro tratado no hook
    }
  };

  const formatarDataExibicao = (dataIso: string) => {
    try {
      const partes = dataIso.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return dataIso;
    } catch {
      return dataIso;
    }
  };

  if (!disciplina) return null;

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
    >
      <KeyboardAvoidingView
        style={estilos.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={estilos.containerModal}>
          {/* Cabeçalho */}
          <View style={estilos.cabecalho}>
            <View style={estilos.tituloArea}>
              <View
                style={[
                  estilos.tagCor,
                  { backgroundColor: disciplina.corIdentificacao || tema.cores.corMarcaPrimaria },
                ]}
              />
              <View>
                <Text style={estilos.tituloModal}>Histórico de Faltas</Text>
                <Text style={estilos.subtituloModal}>{disciplina.nome}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={estilos.botaoFechar}
              onPress={aoFechar}
              accessibilityLabel="Fechar modal"
            >
              <Text style={estilos.textoFechar}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Resumo do Topo */}
          <View style={estilos.cardResumoTopo}>
            <View style={estilos.itemResumo}>
              <Text style={estilos.valorResumo}>{resumo ? resumo.totalFaltas : 0}</Text>
              <Text style={estilos.rotuloResumo}>Faltas Registradas</Text>
            </View>
            <View style={estilos.separadorResumo} />
            <View style={estilos.itemResumo}>
              <Text style={estilos.valorResumo}>
                {disciplina.limiteMaximoFaltas && disciplina.limiteMaximoFaltas > 0
                  ? disciplina.limiteMaximoFaltas
                  : 'Livre'}
              </Text>
              <Text style={estilos.rotuloResumo}>
                {disciplina.limiteMaximoFaltas && disciplina.limiteMaximoFaltas > 0
                  ? 'Limite Permitido'
                  : 'Presença'}
              </Text>
            </View>
            <View style={estilos.separadorResumo} />
            <View style={estilos.itemResumo}>
              <Text
                style={[
                  estilos.valorResumo,
                  {
                    color:
                      resumo?.status === 'CRITICO'
                        ? tema.cores.corStatusCritico
                        : resumo?.status === 'ALERTA'
                        ? tema.cores.corStatusAlerta
                        : tema.cores.corStatusSeguro,
                  },
                ]}
              >
                {resumo?.presencaObrigatoria && resumo.faltasRestantes !== null
                  ? resumo.faltasRestantes
                  : 'Facultativa'}
              </Text>
              <Text style={estilos.rotuloResumo}>
                {resumo?.presencaObrigatoria ? 'Saldo Restante' : 'Status'}
              </Text>
            </View>
          </View>

          {/* Alternador / Botão de Nova Falta */}
          <View style={estilos.barraAdicionar}>
            <TouchableOpacity
              style={[
                estilos.botaoAlternarModo,
                modoAdicionar ? estilos.botaoAlternarAtivo : null,
              ]}
              onPress={() => {
                setModoAdicionar(!modoAdicionar);
                setErroForm(null);
              }}
            >
              <Text style={estilos.textoBotaoAlternar}>
                {modoAdicionar ? '✕ Cancelar Cadastro' : '+ Registrar com Justificativa'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulário de Cadastro Detalhado */}
          {modoAdicionar && (
            <View style={estilos.formularioContainer}>
              <Text style={estilos.tituloForm}>Nova Falta</Text>

              {erroForm && <Text style={estilos.textoErroForm}>{erroForm}</Text>}

              <View style={estilos.linhaInputs}>
                <View style={{ flex: 1 }}>
                  <CampoData
                    rotulo="Data da Falta"
                    valor={dataInput}
                    aoSelecionarData={setDataInput}
                    placeholder="Selecione a data..."
                  />
                </View>

                <View style={[estilos.grupoInput, { width: 100, marginBottom: tema.espacamento.md }]}>
                  <Text style={estilos.labelInput}>Horário</Text>
                  <TextInput
                    style={estilos.inputTexto}
                    value={horarioInput}
                    onChangeText={(t) => {
                      const numeros = t.replace(/\D/g, '');
                      const formatado = numeros.length <= 2 ? numeros : `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
                      setHorarioInput(formatado);
                    }}
                    placeholder="08:00"
                    placeholderTextColor={tema.cores.corTextoSecundario}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={estilos.grupoInput}>
                <Text style={estilos.labelInput}>Justificativa (Opcional)</Text>
                <TextInput
                  style={estilos.inputTexto}
                  value={justificativaInput}
                  onChangeText={setJustificativaInput}
                  placeholder="Ex: Atestado médico, consulta, imprevisto..."
                  placeholderTextColor={tema.cores.corTextoSecundario}
                />
              </View>

              <TouchableOpacity
                style={estilos.botaoSalvarFalta}
                onPress={handleSalvarFalta}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color={tema.cores.corTextoPrimario} />
                ) : (
                  <Text style={estilos.textoBotaoSalvar}>Salvar Registro de Falta</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Lista do Histórico */}
          {carregando ? (
            <View style={estilos.centralizado}>
              <ActivityIndicator size="large" color={tema.cores.corMarcaPrimaria} />
            </View>
          ) : historico.length === 0 ? (
            <View style={estilos.emptyState}>
              <Text style={estilos.emptyTitulo}>Nenhuma falta registrada</Text>
              <Text style={estilos.emptyDescricao}>
                Você ainda não possui faltas computadas nesta disciplina.
              </Text>
            </View>
          ) : (
            <FlatList
              data={historico}
              keyExtractor={(item) => item.id}
              contentContainerStyle={estilos.listaFaltas}
              renderItem={({ item }) => (
                <View style={estilos.cardItemFalta}>
                  <View style={estilos.infoItemFalta}>
                    <View style={estilos.linhaDataHora}>
                      <Text style={estilos.dataFalta}>
                        {formatarDataExibicao(item.data)}
                      </Text>
                      <Text style={estilos.horarioFalta}>{item.horario}</Text>
                    </View>

                    {item.justificativa ? (
                      <View style={estilos.tagJustificativa}>
                        <Text style={estilos.textoJustificativa}>
                          {item.justificativa}
                        </Text>
                      </View>
                    ) : (
                      <Text style={estilos.semJustificativa}>Sem justificativa informada</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={estilos.botaoExcluirItem}
                    onPress={() => handleExcluirFalta(item.id)}
                    accessibilityLabel="Excluir esta falta"
                  >
                    <Text style={estilos.textoExcluirItem}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  containerModal: {
    backgroundColor: tema.cores.corFundoCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
    paddingBottom: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tema.espacamento.md,
    paddingTop: tema.espacamento.md,
    paddingBottom: tema.espacamento.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  tituloArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  tagCor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tituloModal: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  subtituloModal: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 1,
  },
  botaoFechar: {
    padding: 6,
  },
  textoFechar: {
    color: tema.cores.corTextoSecundario,
    fontSize: 18,
  },
  cardResumoTopo: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoElevado,
    marginHorizontal: tema.espacamento.md,
    marginTop: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  itemResumo: {
    alignItems: 'center',
  },
  valorResumo: {
    color: tema.cores.corTextoPrimario,
    fontSize: 18,
    fontWeight: '700',
  },
  rotuloResumo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  separadorResumo: {
    width: 1,
    height: 24,
    backgroundColor: '#30363d',
  },
  barraAdicionar: {
    paddingHorizontal: tema.espacamento.md,
    marginTop: tema.espacamento.sm,
  },
  botaoAlternarModo: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingVertical: 8,
    borderRadius: tema.raioBorda.padrao,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  botaoAlternarAtivo: {
    backgroundColor: 'rgba(248, 81, 73, 0.12)',
    borderColor: 'rgba(248, 81, 73, 0.3)',
  },
  textoBotaoAlternar: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  formularioContainer: {
    backgroundColor: tema.cores.corFundoElevado,
    marginHorizontal: tema.espacamento.md,
    marginTop: tema.espacamento.sm,
    padding: tema.espacamento.md,
    borderRadius: tema.raioBorda.padrao,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  tituloForm: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
    marginBottom: 8,
  },
  textoErroForm: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    marginBottom: 8,
  },
  linhaInputs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  grupoInput: {
    marginBottom: 8,
  },
  labelInput: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginBottom: 4,
  },
  inputTexto: {
    backgroundColor: tema.cores.corFundoPrincipal,
    color: tema.cores.corTextoPrimario,
    borderRadius: tema.raioBorda.pequeno,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: tema.tipografia.pequeno,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  botaoSalvarFalta: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingVertical: 10,
    borderRadius: tema.raioBorda.padrao,
    alignItems: 'center',
    marginTop: 4,
  },
  textoBotaoSalvar: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.xl,
  },
  emptyIcone: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  emptyDescricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    textAlign: 'center',
    marginTop: 4,
  },
  listaFaltas: {
    padding: tema.espacamento.md,
    gap: 8,
  },
  cardItemFalta: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  infoItemFalta: {
    flex: 1,
  },
  linhaDataHora: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dataFalta: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  horarioFalta: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
  tagJustificativa: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  textoJustificativa: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
  },
  semJustificativa: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontStyle: 'italic',
    marginTop: 4,
  },
  botaoExcluirItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.25)',
    marginLeft: 8,
  },
  textoExcluirItem: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
});
