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
import { Avaliacao, CriarAvaliacaoDTO, AtualizarAvaliacaoDTO, TipoAvaliacao, TIPO_AVALIACAO_LABELS } from '../modelos/Avaliacao';
import { tema } from '../estilos/tema';

interface ModalFormularioAvaliacaoProps {
  visivel: boolean;
  disciplinaId: string;
  avaliacaoParaEditar?: Avaliacao | null;
  aoFechar: () => void;
  aoSalvar: (dados: CriarAvaliacaoDTO | AtualizarAvaliacaoDTO) => Promise<void>;
}

const TIPOS_AVALIACAO: TipoAvaliacao[] = ['PROVA', 'TRABALHO', 'TESTE', 'SEMINARIO', 'OUTRO'];

const obterDataHoje = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const ModalFormularioAvaliacao: React.FC<ModalFormularioAvaliacaoProps> = ({
  visivel,
  disciplinaId,
  avaliacaoParaEditar,
  aoFechar,
  aoSalvar,
}) => {
  const editando = !!avaliacaoParaEditar;

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoAvaliacao>('PROVA');
  const [data, setData] = useState(obterDataHoje());
  const [horario, setHorario] = useState('');
  const [peso, setPeso] = useState('1');
  const [notaMaxima, setNotaMaxima] = useState('10');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (avaliacaoParaEditar) {
      setTitulo(avaliacaoParaEditar.titulo);
      setTipo(avaliacaoParaEditar.tipo);
      setData(avaliacaoParaEditar.data);
      setHorario(avaliacaoParaEditar.horario || '');
      setPeso(String(avaliacaoParaEditar.peso));
      setNotaMaxima(String(avaliacaoParaEditar.notaMaxima));
      setDescricao(avaliacaoParaEditar.descricao || '');
    } else {
      setTitulo('');
      setTipo('PROVA');
      setData(obterDataHoje());
      setHorario('');
      setPeso('1');
      setNotaMaxima('10');
      setDescricao('');
    }
    setErros({});
  }, [avaliacaoParaEditar, visivel]);

  const validar = (): boolean => {
    const novosErros: Record<string, string> = {};

    if (!titulo.trim() || titulo.trim().length < 2) {
      novosErros.titulo = 'O título deve ter pelo menos 2 caracteres.';
    }

    if (!data.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      novosErros.data = 'Data inválida. Use o formato AAAA-MM-DD.';
    }

    if (horario && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(horario)) {
      novosErros.horario = 'Horário inválido. Use HH:mm (ex: 08:30).';
    }

    const pesoNum = Number(peso.trim().replace(',', '.'));
    if (isNaN(pesoNum) || pesoNum < 0) {
      novosErros.peso = 'O peso deve ser um número maior ou igual a 0.';
    }

    const notaMaximaNum = Number(notaMaxima.trim().replace(',', '.'));
    if (isNaN(notaMaximaNum) || notaMaximaNum <= 0) {
      novosErros.notaMaxima = 'A nota máxima deve ser maior que 0.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const salvar = async () => {
    if (!validar()) return;

    try {
      setSalvando(true);
      const dados: CriarAvaliacaoDTO = {
        disciplinaId,
        titulo: titulo.trim(),
        tipo,
        data,
        horario: horario.trim() || undefined,
        peso: Number(peso.trim().replace(',', '.')),
        notaMaxima: Number(notaMaxima.trim().replace(',', '.')),
        descricao: descricao.trim() || undefined,
      };
      await aoSalvar(dados);
      aoFechar();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao salvar avaliação.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={aoFechar}
    >
      <SafeAreaView style={estilos.container}>
        {/* Cabeçalho */}
        <View style={estilos.cabecalho}>
          <TouchableOpacity onPress={aoFechar} style={estilos.botaoCancelar}>
            <Text style={estilos.botaoCancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={estilos.titulo}>{editando ? 'Editar Avaliação' : 'Nova Avaliação'}</Text>
          <TouchableOpacity
            onPress={salvar}
            style={[estilos.botaoSalvar, salvando && estilos.botaoDesabilitado]}
            disabled={salvando}
          >
            <Text style={estilos.botaoSalvarTexto}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Título */}
          <Text style={estilos.rotulo}>Título *</Text>
          <TextInput
            style={[estilos.input, erros.titulo ? estilos.inputErro : null]}
            placeholder="Ex: Prova 1, Trabalho Final..."
            placeholderTextColor={tema.cores.corTextoSecundario}
            value={titulo}
            onChangeText={setTitulo}
          />
          {erros.titulo ? <Text style={estilos.textoErro}>{erros.titulo}</Text> : null}

          {/* Tipo de Avaliação */}
          <Text style={[estilos.rotulo, { marginTop: tema.espacamento.md }]}>Tipo *</Text>
          <View style={estilos.seletorTipo}>
            {TIPOS_AVALIACAO.map((t) => (
              <TouchableOpacity
                key={t}
                style={[estilos.opcaoTipo, tipo === t && estilos.opcaoTipoAtiva]}
                onPress={() => setTipo(t)}
                activeOpacity={0.8}
              >
                <Text style={[estilos.opcaoTipoTexto, tipo === t && estilos.opcaoTipoTextoAtiva]}>
                  {TIPO_AVALIACAO_LABELS[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Data */}
          <Text style={[estilos.rotulo, { marginTop: tema.espacamento.md }]}>Data *</Text>
          <TextInput
            style={[estilos.input, erros.data ? estilos.inputErro : null]}
            placeholder="AAAA-MM-DD (ex: 2026-09-15)"
            placeholderTextColor={tema.cores.corTextoSecundario}
            value={data}
            onChangeText={setData}
            keyboardType="numeric"
          />
          {erros.data ? <Text style={estilos.textoErro}>{erros.data}</Text> : null}

          {/* Horário */}
          <Text style={[estilos.rotulo, { marginTop: tema.espacamento.md }]}>Horário (opcional)</Text>
          <TextInput
            style={[estilos.input, erros.horario ? estilos.inputErro : null]}
            placeholder="HH:mm (ex: 08:30)"
            placeholderTextColor={tema.cores.corTextoSecundario}
            value={horario}
            onChangeText={setHorario}
            keyboardType="numeric"
          />
          {erros.horario ? <Text style={estilos.textoErro}>{erros.horario}</Text> : null}

          {/* Peso e Nota Máxima */}
          <View style={estilos.linhaDouble}>
            <View style={estilos.campoMeio}>
              <Text style={estilos.rotulo}>Peso *</Text>
              <TextInput
                style={[estilos.input, erros.peso ? estilos.inputErro : null]}
                placeholder="Ex: 1, 2, 3"
                placeholderTextColor={tema.cores.corTextoSecundario}
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
              />
              {erros.peso ? <Text style={estilos.textoErro}>{erros.peso}</Text> : null}
            </View>

            <View style={estilos.campoMeio}>
              <Text style={estilos.rotulo}>Nota Máxima *</Text>
              <TextInput
                style={[estilos.input, erros.notaMaxima ? estilos.inputErro : null]}
                placeholder="Ex: 10"
                placeholderTextColor={tema.cores.corTextoSecundario}
                value={notaMaxima}
                onChangeText={setNotaMaxima}
                keyboardType="numeric"
              />
              {erros.notaMaxima ? <Text style={estilos.textoErro}>{erros.notaMaxima}</Text> : null}
            </View>
          </View>

          {/* Descrição */}
          <Text style={[estilos.rotulo, { marginTop: tema.espacamento.md }]}>Descrição (opcional)</Text>
          <TextInput
            style={[estilos.input, estilos.inputMultiline]}
            placeholder="Conteúdo cobrado, instruções de entrega..."
            placeholderTextColor={tema.cores.corTextoSecundario}
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    paddingVertical: tema.espacamento.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  botaoCancelar: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  botaoCancelarTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.normal,
  },
  botaoSalvar: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.pequeno,
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  botaoSalvarTexto: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  conteudo: {
    padding: tema.espacamento.md,
    paddingBottom: 40,
  },
  rotulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
    marginBottom: tema.espacamento.xs,
  },
  input: {
    backgroundColor: tema.cores.corFundoElevado,
    color: tema.cores.corTextoPrimario,
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm + 2,
    fontSize: tema.tipografia.normal,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  inputErro: {
    borderColor: tema.cores.corStatusCritico,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: tema.espacamento.sm,
  },
  textoErro: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    marginTop: 4,
  },
  seletorTipo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  opcaoTipo: {
    paddingHorizontal: tema.espacamento.sm + 2,
    paddingVertical: 7,
    borderRadius: tema.raioBorda.pequeno,
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  opcaoTipoAtiva: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  opcaoTipoTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  opcaoTipoTextoAtiva: {
    color: tema.cores.corTextoPrimario,
  },
  linhaDouble: {
    flexDirection: 'row',
    gap: tema.espacamento.sm,
    marginTop: tema.espacamento.md,
  },
  campoMeio: {
    flex: 1,
  },
});
