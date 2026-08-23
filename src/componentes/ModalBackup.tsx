import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { tema } from '../estilos/tema';
import { useBackup } from '../hooks/useBackup';
import { ModoRestauracao, ResultadoValidacaoBackup } from '../modelos/Backup';

interface ModalBackupProps {
  visivel: boolean;
  aoFechar: () => void;
  aoRestaurarSucesso?: () => void;
}

type AbaBackup = 'exportar' | 'restaurar';

export const ModalBackup: React.FC<ModalBackupProps> = ({
  visivel,
  aoFechar,
  aoRestaurarSucesso,
}) => {
  const {
    resumoLocal,
    carregando,
    erro,
    sucesso,
    carregarResumo,
    gerarBackup,
    validarConteudo,
    restaurarBackup,
    limparMensagens,
  } = useBackup();

  const [abaAtiva, setAbaAtiva] = useState<AbaBackup>('exportar');
  const [jsonExportado, setJsonExportado] = useState<string>('');
  const [jsonParaRestaurar, setJsonParaRestaurar] = useState<string>('');
  const [modoRestauracao, setModoRestauracao] = useState<ModoRestauracao>('SUBSTITUIR');
  const [diagnostico, setDiagnostico] = useState<ResultadoValidacaoBackup | null>(null);
  const [copiado, setCopiado] = useState<boolean>(false);

  useEffect(() => {
    if (visivel) {
      carregarResumo();
      limparMensagens();
      setJsonExportado('');
      setJsonParaRestaurar('');
      setDiagnostico(null);
      setCopiado(false);
    }
  }, [visivel, carregarResumo]);

  const handleGerarBackup = async () => {
    try {
      const json = await gerarBackup();
      setJsonExportado(json);
    } catch {
      // Erro tratado pelo hook
    }
  };

  const handleCompartilharOuCopiar = async () => {
    if (!jsonExportado) return;
    try {
      await Share.share({
        message: jsonExportado,
        title: 'backup_campusflow.json',
      });
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      Alert.alert('Backup Gerado', 'Selecione e copie o texto do backup abaixo.');
    }
  };

  const handleValidarTexto = () => {
    if (!jsonParaRestaurar.trim()) {
      Alert.alert('Atenção', 'Cole o conteúdo do backup JSON no campo de texto.');
      return;
    }
    const resultado = validarConteudo(jsonParaRestaurar);
    setDiagnostico(resultado);
  };

  const handleConfirmarRestauracao = () => {
    if (!jsonParaRestaurar.trim()) {
      Alert.alert('Atenção', 'Insira o JSON do backup para restaurar.');
      return;
    }

    const validacao = validarConteudo(jsonParaRestaurar);
    if (!validacao.valido) {
      setDiagnostico(validacao);
      Alert.alert('Arquivo Inválido', validacao.erros.join('\n'));
      return;
    }

    const mensagemConfirmacao =
      modoRestauracao === 'SUBSTITUIR'
        ? 'Atenção: A Substituição Total apagará todos os dados atuais do aparelho e carregará exatamente o estado do arquivo de backup. Deseja continuar?'
        : 'A Mesclagem adicionará os dados do arquivo ao seu banco atual sem apagar os dados existentes. Deseja continuar?';

    Alert.alert(
      modoRestauracao === 'SUBSTITUIR' ? 'Substituir Dados Atuais?' : 'Mesclar Dados?',
      mensagemConfirmacao,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Restauração',
          style: modoRestauracao === 'SUBSTITUIR' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await restaurarBackup(jsonParaRestaurar, modoRestauracao);
              Alert.alert(
                'Sucesso!',
                'Seu backup foi restaurado com sucesso e todos os alarmes locais foram reprogramados.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (aoRestaurarSucesso) aoRestaurarSucesso();
                      aoFechar();
                    },
                  },
                ]
              );
            } catch (err: any) {
              Alert.alert('Erro ao Restaurar', err?.message || 'Falha na restauração.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
    >
      <TouchableWithoutFeedback onPress={aoFechar}>
        <View style={estilos.overlay}>
          <TouchableWithoutFeedback>
            <View style={estilos.containerModal}>
              {/* Cabeçalho */}
              <View style={estilos.cabecalhoModal}>
                <View>
                  <Text style={estilos.tituloModal}>Backup & Portabilidade</Text>
                  <Text style={estilos.subtituloModal}>
                    Gerenciamento manual 100% offline (RF11)
                  </Text>
                </View>
                <TouchableOpacity
                  style={estilos.botaoFechar}
                  onPress={aoFechar}
                  activeOpacity={0.7}
                >
                  <Text style={estilos.textoBotaoFechar}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Seletor de Abas */}
              <View style={estilos.seletorAbas}>
                <TouchableOpacity
                  style={[
                    estilos.itemAba,
                    abaAtiva === 'exportar' ? estilos.itemAbaAtiva : null,
                  ]}
                  onPress={() => setAbaAtiva('exportar')}
                >
                  <Text
                    style={[
                      estilos.textoAba,
                      abaAtiva === 'exportar' ? estilos.textoAbaAtiva : null,
                    ]}
                  >
                    Exportar Dados
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    estilos.itemAba,
                    abaAtiva === 'restaurar' ? estilos.itemAbaAtiva : null,
                  ]}
                  onPress={() => setAbaAtiva('restaurar')}
                >
                  <Text
                    style={[
                      estilos.textoAba,
                      abaAtiva === 'restaurar' ? estilos.textoAbaAtiva : null,
                    ]}
                  >
                    Restaurar Backup
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={estilos.conteudoRolavel}
                showsVerticalScrollIndicator={false}
              >
                {/* Banner de Erro Geral */}
                {erro && (
                  <View style={estilos.bannerErro}>
                    <Text style={estilos.textoBannerErro}>{erro}</Text>
                  </View>
                )}

                {/* Banner de Sucesso */}
                {sucesso && (
                  <View style={estilos.bannerSucesso}>
                    <Text style={estilos.textoBannerSucesso}>{sucesso}</Text>
                  </View>
                )}

                {/* --- ABA 1: EXPORTAR DADOS --- */}
                {abaAtiva === 'exportar' && (
                  <View style={estilos.secaoAba}>
                    {/* Card de Resumo de Dados Locais */}
                    <View style={estilos.cardResumoLocal}>
                      <Text style={estilos.tituloResumo}>Dados Locais Prontos para Backup</Text>
                      <View style={estilos.gradeResumo}>
                        <View style={estilos.itemResumo}>
                          <Text style={estilos.valorResumo}>{resumoLocal.totalDisciplinas}</Text>
                          <Text style={estilos.rotuloResumo}>Disciplinas</Text>
                        </View>
                        <View style={estilos.itemResumo}>
                          <Text style={estilos.valorResumo}>{resumoLocal.totalHorarios}</Text>
                          <Text style={estilos.rotuloResumo}>Aulas</Text>
                        </View>
                        <View style={estilos.itemResumo}>
                          <Text style={estilos.valorResumo}>{resumoLocal.totalFaltas}</Text>
                          <Text style={estilos.rotuloResumo}>Faltas</Text>
                        </View>
                        <View style={estilos.itemResumo}>
                          <Text style={estilos.valorResumo}>{resumoLocal.totalAvaliacoes}</Text>
                          <Text style={estilos.rotuloResumo}>Avaliações</Text>
                        </View>
                        <View style={estilos.itemResumo}>
                          <Text style={estilos.valorResumo}>{resumoLocal.totalTarefas}</Text>
                          <Text style={estilos.rotuloResumo}>Tarefas</Text>
                        </View>
                        <View style={estilos.itemResumo}>
                          <Text style={estilos.valorResumo}>{resumoLocal.totalEventos}</Text>
                          <Text style={estilos.rotuloResumo}>Eventos</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={estilos.descricaoAjuda}>
                      Gera um arquivo estruturado (.json) contendo todas as disciplinas, notas,
                      histórico de faltas, tarefas e horários salvos no seu aparelho.
                    </Text>

                    {/* Botão Gerar Backup */}
                    {!jsonExportado ? (
                      <TouchableOpacity
                        style={estilos.botaoPrincipal}
                        onPress={handleGerarBackup}
                        disabled={carregando}
                        activeOpacity={0.8}
                      >
                        {carregando ? (
                          <ActivityIndicator color="#ffffff" />
                        ) : (
                          <Text style={estilos.textoBotaoPrincipal}>
                            Gerar Arquivo de Backup (.json)
                          </Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={estilos.areaExportado}>
                        <View style={estilos.barraAcoesExportado}>
                          <Text style={estilos.rotuloJson}>Arquivo de Backup Gerado:</Text>
                          <TouchableOpacity
                            style={estilos.botaoCompartilhar}
                            onPress={handleCompartilharOuCopiar}
                            activeOpacity={0.7}
                          >
                            <Text style={estilos.textoBotaoCompartilhar}>
                              {copiado ? 'Copiado' : 'Compartilhar / Salvar'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <TextInput
                          style={estilos.campoJsonExportado}
                          value={jsonExportado}
                          multiline
                          editable={false}
                          selectTextOnFocus
                          showsVerticalScrollIndicator
                        />

                        <TouchableOpacity
                          style={estilos.botaoSecundario}
                          onPress={() => {
                            setJsonExportado('');
                            setCopiado(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={estilos.textoBotaoSecundario}>Gerar Novamente</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* --- ABA 2: RESTAURAR BACKUP --- */}
                {abaAtiva === 'restaurar' && (
                  <View style={estilos.secaoAba}>
                    <Text style={estilos.descricaoAjuda}>
                      Cole o conteúdo do arquivo JSON de backup da Agenda do Estudante abaixo para restaurar
                      seus dados acadêmicos:
                    </Text>

                    {/* Campo de Entrada de JSON */}
                    <TextInput
                      style={estilos.campoJsonInput}
                      value={jsonParaRestaurar}
                      onChangeText={(texto) => {
                        setJsonParaRestaurar(texto);
                        setDiagnostico(null);
                      }}
                      placeholder='Cole o conteúdo do arquivo JSON aqui (ex: {"metadados": ...})'
                      placeholderTextColor={tema.cores.corTextoSecundario}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />

                    {/* Botão Validar */}
                    <TouchableOpacity
                      style={estilos.botaoValidar}
                      onPress={handleValidarTexto}
                      activeOpacity={0.7}
                    >
                      <Text style={estilos.textoBotaoValidar}>Validar Estrutura do Backup</Text>
                    </TouchableOpacity>

                    {/* Painel de Diagnóstico */}
                    {diagnostico && (
                      <View
                        style={[
                          estilos.cardDiagnostico,
                          diagnostico.valido
                            ? estilos.diagnosticoValido
                            : estilos.diagnosticoInvalido,
                        ]}
                      >
                        <Text
                          style={[
                            estilos.tituloDiagnostico,
                            {
                              color: diagnostico.valido
                                ? tema.cores.corStatusSeguro
                                : tema.cores.corStatusCritico,
                            },
                          ]}
                        >
                          {diagnostico.valido ? 'Arquivo Válido & Compatível' : 'Erros no Arquivo'}
                        </Text>

                        {diagnostico.valido && diagnostico.metadados && (
                          <View style={estilos.infoDiagnostico}>
                            <Text style={estilos.textoInfo}>
                              • Versão do Schema: {diagnostico.metadados.versaoSchema}
                            </Text>
                            <Text style={estilos.textoInfo}>
                              • Data do Backup:{' '}
                              {new Date(diagnostico.metadados.dataExportacao).toLocaleString()}
                            </Text>
                            {diagnostico.dados && (
                              <Text style={estilos.textoInfo}>
                                • Conteúdo: {diagnostico.dados.disciplinas.length} disciplinas,{' '}
                                {diagnostico.dados.faltas.length} faltas,{' '}
                                {diagnostico.dados.avaliacoes.length} avaliações,{' '}
                                {diagnostico.dados.tarefas.length} tarefas.
                              </Text>
                            )}
                          </View>
                        )}

                        {diagnostico.erros.map((erro, i) => (
                          <Text key={i} style={estilos.textoErroDiagnostico}>
                            • {erro}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Seletor de Modo de Restauração */}
                    <Text style={estilos.subtituloSecao}>Modo de Restauração:</Text>
                    <View style={estilos.containerModo}>
                      <TouchableOpacity
                        style={[
                          estilos.opcaoModo,
                          modoRestauracao === 'SUBSTITUIR' ? estilos.opcaoModoAtivo : null,
                        ]}
                        onPress={() => setModoRestauracao('SUBSTITUIR')}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            estilos.tituloModo,
                            modoRestauracao === 'SUBSTITUIR' ? estilos.tituloModoAtivo : null,
                          ]}
                        >
                          Substituição Total
                        </Text>
                        <Text style={estilos.descricaoModo}>
                          Limpa o banco atual e restaura exatamente o backup (Recomendado).
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          estilos.opcaoModo,
                          modoRestauracao === 'MESCLAR' ? estilos.opcaoModoAtivo : null,
                        ]}
                        onPress={() => setModoRestauracao('MESCLAR')}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            estilos.tituloModo,
                            modoRestauracao === 'MESCLAR' ? estilos.tituloModoAtivo : null,
                          ]}
                        >
                          Mesclagem (Merge)
                        </Text>
                        <Text style={estilos.descricaoModo}>
                          Adiciona dados do backup sem apagar os registros locais.
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Botão de Restauração */}
                    <TouchableOpacity
                      style={[
                        estilos.botaoRestaurar,
                        modoRestauracao === 'SUBSTITUIR'
                          ? estilos.botaoRestaurarSubstituir
                          : estilos.botaoRestaurarMesclar,
                      ]}
                      onPress={handleConfirmarRestauracao}
                      disabled={carregando}
                      activeOpacity={0.8}
                    >
                      {carregando ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={estilos.textoBotaoRestaurar}>
                          Confirmar & Restaurar Backup
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  containerModal: {
    backgroundColor: tema.cores.corFundoCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#30363d',
    padding: tema.espacamento.md,
    maxHeight: '90%',
    width: '100%',
  },
  cabecalhoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tema.espacamento.sm,
    paddingBottom: tema.espacamento.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  tituloModal: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  subtituloModal: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  botaoFechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tema.cores.corFundoElevado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoFechar: {
    color: tema.cores.corTextoSecundario,
    fontSize: 16,
    fontWeight: 'bold',
  },
  seletorAbas: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: 3,
    marginBottom: tema.espacamento.md,
  },
  itemAba: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: tema.raioBorda.padrao - 2,
  },
  itemAbaAtiva: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  textoAba: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  textoAbaAtiva: {
    color: '#ffffff',
  },
  conteudoRolavel: {
    paddingBottom: tema.espacamento.xl,
  },
  bannerErro: {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: tema.cores.corStatusCritico,
    marginBottom: tema.espacamento.md,
  },
  textoBannerErro: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  bannerSucesso: {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: tema.cores.corStatusSeguro,
    marginBottom: tema.espacamento.md,
  },
  textoBannerSucesso: {
    color: tema.cores.corStatusSeguro,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  secaoAba: {
    gap: tema.espacamento.md,
  },
  cardResumoLocal: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  tituloResumo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tema.espacamento.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  gradeResumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemResumo: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  valorResumo: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: 18,
    fontWeight: 'bold',
  },
  rotuloResumo: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 2,
  },
  descricaoAjuda: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro + 1,
    lineHeight: 18,
  },
  botaoPrincipal: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoPrincipal: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
  areaExportado: {
    gap: tema.espacamento.sm,
  },
  barraAcoesExportado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotuloJson: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoCompartilhar: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoBotaoCompartilhar: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: 12,
    fontWeight: 'bold',
  },
  campoJsonExportado: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    color: '#7ee787',
    fontFamily: 'monospace',
    fontSize: 11,
    height: 180,
  },
  botaoSecundario: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  textoBotaoSecundario: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  campoJsonInput: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    color: tema.cores.corTextoPrimario,
    fontSize: 12,
    minHeight: 120,
  },
  botaoValidar: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  textoBotaoValidar: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  cardDiagnostico: {
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    borderWidth: 1,
  },
  diagnosticoValido: {
    backgroundColor: 'rgba(46, 160, 67, 0.1)',
    borderColor: tema.cores.corStatusSeguro,
  },
  diagnosticoInvalido: {
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderColor: tema.cores.corStatusCritico,
  },
  tituloDiagnostico: {
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoDiagnostico: {
    gap: 2,
  },
  textoInfo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
  },
  textoErroDiagnostico: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  subtituloSecao: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
    marginTop: 4,
  },
  containerModo: {
    flexDirection: 'row',
    gap: tema.espacamento.sm,
  },
  opcaoModo: {
    flex: 1,
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  opcaoModoAtivo: {
    borderColor: tema.cores.corMarcaPrimaria,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  tituloModo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
  tituloModoAtivo: {
    color: tema.cores.corMarcaPrimaria,
  },
  descricaoModo: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  botaoRestaurar: {
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tema.espacamento.xs,
  },
  botaoRestaurarSubstituir: {
    backgroundColor: tema.cores.corStatusCritico,
  },
  botaoRestaurarMesclar: {
    backgroundColor: tema.cores.corStatusSeguro,
  },
  textoBotaoRestaurar: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
});
