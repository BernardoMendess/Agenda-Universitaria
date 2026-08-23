import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { CampoTexto } from './CampoTexto';
import { CampoData } from './CampoData';
import { Botao } from './Botao';
import { Disciplina } from '../modelos/Disciplina';
import {
  EventoAcademico,
  CriarEventoAcademicoDTO,
  AtualizarEventoAcademicoDTO,
} from '../modelos/EventoAcademico';
import { tema } from '../estilos/tema';

interface ModalFormularioEventoProps {
  visivel: boolean;
  dataPreSelecionada?: string;
  disciplinas: Disciplina[];
  eventoParaEditar?: EventoAcademico | null;
  aoFechar: () => void;
  aoSalvar: (
    dados: CriarEventoAcademicoDTO | AtualizarEventoAcademicoDTO
  ) => Promise<void>;
}

export const ModalFormularioEvento: React.FC<ModalFormularioEventoProps> = ({
  visivel,
  dataPreSelecionada,
  disciplinas,
  eventoParaEditar,
  aoFechar,
  aoSalvar,
}) => {
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [disciplinaId, setDisciplinaId] = useState<string | undefined>(undefined);
  const [cor, setCor] = useState<string>(tema.cores.corMarcaPrimaria);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (eventoParaEditar) {
      setTitulo(eventoParaEditar.titulo);
      setData(eventoParaEditar.data);
      setHorarioInicio(eventoParaEditar.horarioInicio || '');
      setHorarioFim(eventoParaEditar.horarioFim || '');
      setLocal(eventoParaEditar.local || '');
      setDescricao(eventoParaEditar.descricao || '');
      setDisciplinaId(eventoParaEditar.disciplinaId);
      setCor(eventoParaEditar.cor || tema.cores.corMarcaPrimaria);
    } else {
      setTitulo('');
      setData(dataPreSelecionada || new Date().toISOString().split('T')[0]);
      setHorarioInicio('');
      setHorarioFim('');
      setLocal('');
      setDescricao('');
      setDisciplinaId(undefined);
      setCor(tema.cores.corMarcaPrimaria);
    }
  }, [eventoParaEditar, dataPreSelecionada, visivel]);

  const validarESalvar = async () => {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Informe o título do evento.');
      return;
    }

    if (!data.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(data.trim())) {
      Alert.alert(
        'Atenção',
        'Informe uma data válida no formato AAAA-MM-DD (ex: 2026-08-22).'
      );
      return;
    }

    if (
      horarioInicio.trim() &&
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(horarioInicio.trim())
    ) {
      Alert.alert(
        'Atenção',
        'Horário de início inválido. Utilize o formato HH:mm (ex: 14:00).'
      );
      return;
    }

    if (
      horarioFim.trim() &&
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(horarioFim.trim())
    ) {
      Alert.alert(
        'Atenção',
        'Horário de término inválido. Utilize o formato HH:mm (ex: 16:00).'
      );
      return;
    }

    try {
      setSalvando(true);
      const payload: CriarEventoAcademicoDTO = {
        titulo: titulo.trim(),
        data: data.trim(),
        horarioInicio: horarioInicio.trim() || undefined,
        horarioFim: horarioFim.trim() || undefined,
        local: local.trim() || undefined,
        descricao: descricao.trim() || undefined,
        disciplinaId: disciplinaId || undefined,
        cor,
      };

      await aoSalvar(payload);
      aoFechar();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao salvar evento.');
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
      <KeyboardAvoidingView
        style={estilos.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={estilos.modalCard}>
          {/* Cabeçalho */}
          <View style={estilos.cabecalho}>
            <Text style={estilos.tituloModal}>
              {eventoParaEditar ? 'Editar Evento' : 'Novo Evento Acadêmico'}
            </Text>
            <TouchableOpacity onPress={aoFechar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={estilos.textoFechar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={estilos.conteudo}
          >
            {/* Título do Evento */}
            <CampoTexto
              rotulo="Título do Evento *"
              valor={titulo}
              aoMudarTexto={setTitulo}
              placeholder="Ex: Semana de Engenharia, Palestra..."
            />

            {/* Data do Evento com Calendário */}
            <CampoData
              rotulo="Data do Evento"
              obrigatorio
              valor={data}
              aoSelecionarData={setData}
              placeholder="Selecione a data no calendário..."
            />

            {/* Horários Início e Término */}
            <View style={estilos.linhaHorarios}>
              <View style={estilos.colunaHorario}>
                <CampoTexto
                  rotulo="Início (HH:mm)"
                  valor={horarioInicio}
                  aoMudarTexto={setHorarioInicio}
                  placeholder="08:00"
                />
              </View>
              <View style={estilos.colunaHorario}>
                <CampoTexto
                  rotulo="Término (HH:mm)"
                  valor={horarioFim}
                  aoMudarTexto={setHorarioFim}
                  placeholder="10:00"
                />
              </View>
            </View>

            {/* Local / Sala */}
            <CampoTexto
              rotulo="Local / Sala / Link"
              valor={local}
              aoMudarTexto={setLocal}
              placeholder="Ex: Auditório Central ou Lab 2"
            />

            {/* Disciplina Vinculada (Opcional) */}
            {disciplinas.length > 0 && (
              <View style={estilos.blocoCampo}>
                <Text style={estilos.rotuloCampo}>Matéria Vinculada (Opcional)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={estilos.scrollDisciplinas}
                >
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
                      Nenhuma (Geral)
                    </Text>
                  </TouchableOpacity>

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
                        onPress={() => {
                          setDisciplinaId(selecionada ? undefined : disc.id);
                          if (!selecionada) setCor(disc.corIdentificacao);
                        }}
                      >
                        <View
                          style={[
                            estilos.pontoCorDisc,
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
            )}

            {/* Descrição */}
            <CampoTexto
              rotulo="Descrição / Observações"
              valor={descricao}
              aoMudarTexto={setDescricao}
              placeholder="Anotações relevantes..."
              multiline
              quantidadeLinhas={3}
            />

            {/* Botões de Ação */}
            <View style={estilos.rodapeBotoes}>
              <Botao
                titulo="Cancelar"
                aoPressionar={aoFechar}
                variante="secundario"
                estilo={estilos.botaoCancelar}
              />
              <Botao
                titulo={salvando ? 'Salvando...' : 'Salvar Evento'}
                aoPressionar={validarESalvar}
                carregando={salvando}
                estilo={estilos.botaoSalvar}
              />
            </View>
          </ScrollView>
        </View>
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
  modalCard: {
    backgroundColor: tema.cores.corFundoCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#21262d',
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tema.espacamento.md,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  tituloModal: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  textoFechar: {
    color: tema.cores.corTextoSecundario,
    fontSize: 18,
    fontWeight: 'bold',
  },
  conteudo: {
    padding: tema.espacamento.md,
    gap: tema.espacamento.sm,
  },
  linhaHorarios: {
    flexDirection: 'row',
    gap: 12,
  },
  colunaHorario: {
    flex: 1,
  },
  blocoCampo: {
    marginBottom: tema.espacamento.sm,
  },
  rotuloCampo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
    marginBottom: 6,
  },
  scrollDisciplinas: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chipDisciplina: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  chipDisciplinaAtivo: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}25`,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  pontoCorDisc: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  textoChipDisciplina: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    fontWeight: '500',
  },
  textoChipDisciplinaAtivo: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
  rodapeBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: tema.espacamento.md,
    paddingBottom: tema.espacamento.md,
  },
  botaoCancelar: {
    flex: 1,
  },
  botaoSalvar: {
    flex: 1,
  },
});
