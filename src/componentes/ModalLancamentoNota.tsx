import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Avaliacao } from '../modelos/Avaliacao';
import { tema } from '../estilos/tema';

interface ModalLancamentoNotaProps {
  visivel: boolean;
  avaliacao: Avaliacao | null;
  aoFechar: () => void;
  aoSalvar: (id: string, nota: number | null) => Promise<void>;
}

export const ModalLancamentoNota: React.FC<ModalLancamentoNotaProps> = ({
  visivel,
  avaliacao,
  aoFechar,
  aoSalvar,
}) => {
  const [nota, setNota] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (avaliacao) {
      setNota(
        avaliacao.nota !== null && avaliacao.nota !== undefined
          ? String(avaliacao.nota)
          : ''
      );
    }
    setErro('');
  }, [avaliacao, visivel]);

  const validar = (): boolean => {
    if (nota.trim() === '') {
      setErro('Informe uma nota válida.');
      return false;
    }
    const notaNum = Number(nota);
    if (isNaN(notaNum)) {
      setErro('A nota deve ser um número.');
      return false;
    }
    if (notaNum < 0 || notaNum > (avaliacao?.notaMaxima ?? 10)) {
      setErro(`A nota deve estar entre 0 e ${avaliacao?.notaMaxima ?? 10}.`);
      return false;
    }
    setErro('');
    return true;
  };

  const salvar = async () => {
    if (!avaliacao) return;
    if (!validar()) return;

    try {
      setSalvando(true);
      await aoSalvar(avaliacao.id, Number(nota));
      aoFechar();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao lançar nota.');
    } finally {
      setSalvando(false);
    }
  };

  const remover = async () => {
    if (!avaliacao) return;
    try {
      setSalvando(true);
      await aoSalvar(avaliacao.id, null);
      aoFechar();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao remover nota.');
    } finally {
      setSalvando(false);
    }
  };

  if (!avaliacao) return null;

  const temNota = avaliacao.nota !== null && avaliacao.nota !== undefined;

  return (
    <Modal
      visible={visivel}
      animationType="fade"
      transparent
      onRequestClose={aoFechar}
    >
      <View style={estilos.overlay}>
        <SafeAreaView style={estilos.containerModal}>
          {/* Cabeçalho */}
          <View style={estilos.cabecalho}>
            <Text style={estilos.titulo}>Lançar Nota</Text>
            <Text style={estilos.subtitulo} numberOfLines={2}>{avaliacao.titulo}</Text>
          </View>

          {/* Campo de Nota */}
          <View style={estilos.campoNota}>
            <TextInput
              style={[estilos.inputNota, erro ? estilos.inputErro : null]}
              value={nota}
              onChangeText={(v) => { setNota(v); setErro(''); }}
              keyboardType="numeric"
              placeholder="0.0"
              placeholderTextColor={tema.cores.corTextoSecundario}
              autoFocus
              selectTextOnFocus
            />
            <Text style={estilos.notaMaximaLabel}>/ {avaliacao.notaMaxima}</Text>
          </View>

          {erro ? <Text style={estilos.textoErro}>{erro}</Text> : null}

          <Text style={estilos.dica}>
            A média será recalculada automaticamente.
          </Text>

          {/* Botões */}
          <View style={estilos.botoes}>
            {temNota && (
              <TouchableOpacity
                style={estilos.botaoRemover}
                onPress={remover}
                disabled={salvando}
              >
                <Text style={estilos.botaoRemoverTexto}>Remover Nota</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={estilos.botaoCancelar}
              onPress={aoFechar}
              disabled={salvando}
            >
              <Text style={estilos.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[estilos.botaoSalvar, salvando && estilos.botaoDesabilitado]}
              onPress={salvar}
              disabled={salvando}
            >
              <Text style={estilos.botaoSalvarTexto}>
                {salvando ? 'Salvando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tema.espacamento.md,
  },
  containerModal: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cabecalho: {
    marginBottom: tema.espacamento.md,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    lineHeight: 20,
  },
  campoNota: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tema.espacamento.sm,
    marginBottom: tema.espacamento.xs,
  },
  inputNota: {
    backgroundColor: tema.cores.corFundoElevado,
    color: tema.cores.corTextoPrimario,
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    width: 120,
    borderWidth: 2,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  inputErro: {
    borderColor: tema.cores.corStatusCritico,
  },
  notaMaximaLabel: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.titulo,
    fontWeight: '600',
  },
  textoErro: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    textAlign: 'center',
    marginTop: 4,
  },
  dica: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textAlign: 'center',
    marginTop: tema.espacamento.xs,
    marginBottom: tema.espacamento.md,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: tema.espacamento.sm,
  },
  botaoRemover: {
    flex: 1,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.pequeno,
    borderWidth: 1,
    borderColor: tema.cores.corStatusCritico,
    alignItems: 'center',
  },
  botaoRemoverTexto: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoCancelar: {
    paddingVertical: tema.espacamento.sm,
    paddingHorizontal: tema.espacamento.md,
    borderRadius: tema.raioBorda.pequeno,
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  botaoCancelarTexto: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoSalvar: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingVertical: tema.espacamento.sm,
    paddingHorizontal: tema.espacamento.md,
    borderRadius: tema.raioBorda.pequeno,
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  botaoSalvarTexto: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
});
