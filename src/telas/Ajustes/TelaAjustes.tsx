import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { useBackup } from '../../hooks/useBackup';
import { Cabecalho } from '../../componentes/Cabecalho';
import { ModalBackup } from '../../componentes/ModalBackup';
import { tema } from '../../estilos/tema';
import { CHAVE_PIX_DOACAO } from '../../constantes/apoio';

const CHAVE_PIX = CHAVE_PIX_DOACAO;

const OPCOES_ANTECEDENCIA_AULA = [
  { rotulo: '10 min', valor: 10 },
  { rotulo: '15 min', valor: 15 },
  { rotulo: '30 min', valor: 30 },
  { rotulo: '45 min', valor: 45 },
  { rotulo: '1 hora', valor: 60 },
];

const OPCOES_ANTECEDENCIA_HORAS = [
  { rotulo: '48h antes', valor: 48 },
  { rotulo: '24h antes', valor: 24 },
  { rotulo: '12h antes', valor: 12 },
  { rotulo: '2h antes', valor: 2 },
  { rotulo: '1h antes', valor: 1 },
];

export const TelaAjustes: React.FC = () => {
  const {
    configuracao,
    estatisticas,
    permissaoConcedida,
    atualizarConfiguracao,
    restaurarPadrao,
    testarAlerta,
    solicitarPermissao,
    carregarConfiguracoes,
  } = useNotificacoes();

  const { resumoLocal, carregarResumo: recarregarBackupResumo } = useBackup();

  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [modalBackupVisivel, setModalBackupVisivel] = useState<boolean>(false);
  const [testandoNotificacao, setTestandoNotificacao] = useState<boolean>(false);

  const exibirFeedback = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 2800);
  };

  const alternarAntecedenciaHoras = async (
    campo: 'antecedenciaAvaliacoesHoras' | 'antecedenciaTarefasHoras',
    horas: number
  ) => {
    try {
      const listaOriginal = Array.isArray(configuracao[campo])
        ? configuracao[campo]
        : [24, 2];
      const listaAtual = listaOriginal.map(Number);
      let novaLista: number[];

      if (listaAtual.includes(horas)) {
        if (listaAtual.length === 1) {
          Alert.alert(
            'Atenção',
            'Mantenha ao menos uma opção de antecedência selecionada.'
          );
          return;
        }
        novaLista = listaAtual.filter((h) => h !== horas);
      } else {
        novaLista = [...listaAtual, horas].sort((a, b) => b - a);
      }

      await atualizarConfiguracao({ [campo]: novaLista });
      exibirFeedback('Preferência de antecedência salva e reagendada!');
    } catch (e) {
      console.warn('Erro ao alternar antecedência de horas:', e);
    }
  };

  const handleTestarNotificacao = async () => {
    setTestandoNotificacao(true);
    try {
      if (!permissaoConcedida) {
        const permitiu = await solicitarPermissao();
        if (!permitiu) {
          Alert.alert(
            'Permissão Necessária',
            'Para exibir notificações na barra do celular, autorize as notificações nas configurações do sistema.'
          );
          setTestandoNotificacao(false);
          return;
        }
      }

      await testarAlerta();
      exibirFeedback('Notificação enviada para a barra do celular!');
    } catch {
      Alert.alert('Erro', 'Não foi possível disparar a notificação de teste.');
    } finally {
      setTestandoNotificacao(false);
    }
  };

  const handleRestaurarPadrao = () => {
    Alert.alert(
      'Restaurar Padrão',
      'Deseja redefinir todas as configurações de notificações para os valores recomendados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            await restaurarPadrao();
            exibirFeedback('Configurações restauradas com sucesso!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={estilos.container} edges={['top']}>
      <Cabecalho
        titulo="Ajustes & Notificações"
        subtitulo="Alertas no celular e configurações locais"
      />

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {mensagemSucesso && (
          <View style={estilos.bannerSucesso}>
            <Ionicons name="checkmark-circle" size={18} color={tema.cores.corStatusSeguro} />
            <Text style={estilos.textoBannerSucesso}>{mensagemSucesso}</Text>
          </View>
        )}

        {/* Banner de Permissão do Sistema Operacional caso desativada */}
        {!permissaoConcedida && (
          <View style={estilos.cardAvisoPermissao}>
            <View style={estilos.linhaTopoAvisoPermissao}>
              <Ionicons name="notifications-off" size={22} color={tema.cores.corStatusAlerta} />
              <View style={estilos.textosAvisoPermissao}>
                <Text style={estilos.tituloAvisoPermissao}>
                  Notificações do celular desativadas
                </Text>
                <Text style={estilos.descricaoAvisoPermissao}>
                  Permita o acesso para receber avisos de aulas, provas e tarefas na barra de notificações do seu celular.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={estilos.botaoAtivarPermissao}
              onPress={solicitarPermissao}
              activeOpacity={0.8}
            >
              <Text style={estilos.textoBotaoAtivarPermissao}>
                Autorizar Notificações
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card Resumo de Alarmes Locais Ativos */}
        <View style={estilos.cardResumo}>
          <Text style={estilos.tituloCardResumo}>Alarmes Programados no Celular</Text>
          <View style={estilos.linhaEstatisticas}>
            <View style={estilos.itemEstatistica}>
              <View style={[estilos.iconeResumoContainer, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                <Ionicons name="book-outline" size={16} color={tema.cores.corMarcaPrimaria} />
              </View>
              <Text style={estilos.numeroEstatistica}>
                {estatisticas.totalAulas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Aulas</Text>
            </View>

            <View style={estilos.divisorVertical} />

            <View style={estilos.itemEstatistica}>
              <View style={[estilos.iconeResumoContainer, { backgroundColor: 'rgba(210, 153, 34, 0.12)' }]}>
                <Ionicons name="calendar-outline" size={16} color={tema.cores.corStatusAlerta} />
              </View>
              <Text style={estilos.numeroEstatistica}>
                {estatisticas.totalAvaliacoes}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Avaliações</Text>
            </View>

            <View style={estilos.divisorVertical} />

            <View style={estilos.itemEstatistica}>
              <View style={[estilos.iconeResumoContainer, { backgroundColor: 'rgba(46, 160, 67, 0.12)' }]}>
                <Ionicons name="checkbox-outline" size={16} color={tema.cores.corStatusSeguro} />
              </View>
              <Text style={estilos.numeroEstatistica}>
                {estatisticas.totalTarefas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Tarefas</Text>
            </View>

            <View style={estilos.divisorVertical} />

            <View style={estilos.itemEstatistica}>
              <View style={[estilos.iconeResumoContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                <Ionicons name="notifications" size={16} color={tema.cores.corMarcaPrimaria} />
              </View>
              <Text
                style={[
                  estilos.numeroEstatistica,
                  { color: tema.cores.corMarcaPrimaria },
                ]}
              >
                {estatisticas.totalAgendadas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Total Ativo</Text>
            </View>
          </View>
        </View>

        {/* Seção 1: Lembretes de Aulas */}
        <View style={estilos.secao}>
          <View style={estilos.secaoCabecalho}>
            <View style={estilos.secaoIconeTitulo}>
              <View style={[estilos.iconeSecao, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                <Ionicons name="time-outline" size={18} color={tema.cores.corMarcaPrimaria} />
              </View>
              <View style={estilos.secaoTextos}>
                <Text style={estilos.secaoTitulo}>Lembretes de Aulas</Text>
                <Text style={estilos.secaoDescricao}>
                  Avisos na barra de notificações antes de cada aula semanal começar.
                </Text>
              </View>
            </View>
            <Switch
              value={configuracao.aulasAtivas}
              onValueChange={async (valor) => {
                await atualizarConfiguracao({ aulasAtivas: valor });
                exibirFeedback(`Lembretes de aula ${valor ? 'ativados' : 'desativados'}.`);
              }}
              trackColor={{
                false: tema.cores.corFundoElevado,
                true: tema.cores.corMarcaPrimaria,
              }}
              thumbColor="#ffffff"
            />
          </View>

          {configuracao.aulasAtivas && (
            <View style={estilos.subsecao}>
              <Text style={estilos.subsecaoTitulo}>Antecedência do aviso na barra:</Text>
              <View style={estilos.gradePills}>
                {OPCOES_ANTECEDENCIA_AULA.map((opcao) => {
                  const ativo =
                    Number(configuracao.antecedenciaAulaMinutos) === opcao.valor;
                  return (
                    <TouchableOpacity
                      key={opcao.valor}
                      style={[estilos.pill, ativo ? estilos.pillAtivo : null]}
                      onPress={async () => {
                        try {
                          await atualizarConfiguracao({
                            antecedenciaAulaMinutos: opcao.valor,
                          });
                          exibirFeedback(`Avisos de aula ajustados para ${opcao.rotulo} antes.`);
                        } catch (e) {
                          console.warn('Erro ao atualizar antecedência de aulas:', e);
                        }
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    >
                      <Text
                        style={[
                          estilos.textoPill,
                          ativo ? estilos.textoPillAtivo : null,
                        ]}
                      >
                        {opcao.rotulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Seção 2: Lembretes de Avaliações */}
        <View style={estilos.secao}>
          <View style={estilos.secaoCabecalho}>
            <View style={estilos.secaoIconeTitulo}>
              <View style={[estilos.iconeSecao, { backgroundColor: 'rgba(210, 153, 34, 0.12)' }]}>
                <Ionicons name="document-text-outline" size={18} color={tema.cores.corStatusAlerta} />
              </View>
              <View style={estilos.secaoTextos}>
                <Text style={estilos.secaoTitulo}>Lembretes de Provas & Trabalhos</Text>
                <Text style={estilos.secaoDescricao}>
                  Notificações automáticas na barra de status antes das avaliações agendadas.
                </Text>
              </View>
            </View>
            <Switch
              value={configuracao.avaliacoesAtivas}
              onValueChange={async (valor) => {
                await atualizarConfiguracao({ avaliacoesAtivas: valor });
                exibirFeedback(`Lembretes de avaliação ${valor ? 'ativados' : 'desativados'}.`);
              }}
              trackColor={{
                false: tema.cores.corFundoElevado,
                true: tema.cores.corMarcaPrimaria,
              }}
              thumbColor="#ffffff"
            />
          </View>

          {configuracao.avaliacoesAtivas && (
            <View style={estilos.subsecao}>
              <Text style={estilos.subsecaoTitulo}>
                Disparar alertas com antecedência de (múltipla escolha):
              </Text>
              <View style={estilos.gradePills}>
                {OPCOES_ANTECEDENCIA_HORAS.map((opcao) => {
                  const listaAvaliacoes = Array.isArray(configuracao.antecedenciaAvaliacoesHoras)
                    ? configuracao.antecedenciaAvaliacoesHoras
                    : [24, 2];
                  const ativo = listaAvaliacoes.map(Number).includes(opcao.valor);
                  return (
                    <TouchableOpacity
                      key={opcao.valor}
                      style={[estilos.pill, ativo ? estilos.pillAtivo : null]}
                      onPress={() =>
                        alternarAntecedenciaHoras(
                          'antecedenciaAvaliacoesHoras',
                          opcao.valor
                        )
                      }
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    >
                      <Text
                        style={[
                          estilos.textoPill,
                          ativo ? estilos.textoPillAtivo : null,
                        ]}
                      >
                        {opcao.rotulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Seção 3: Lembretes de Tarefas */}
        <View style={estilos.secao}>
          <View style={estilos.secaoCabecalho}>
            <View style={estilos.secaoIconeTitulo}>
              <View style={[estilos.iconeSecao, { backgroundColor: 'rgba(46, 160, 67, 0.12)' }]}>
                <Ionicons name="checkmark-done-outline" size={18} color={tema.cores.corStatusSeguro} />
              </View>
              <View style={estilos.secaoTextos}>
                <Text style={estilos.secaoTitulo}>Lembretes de Tarefas (To-Do)</Text>
                <Text style={estilos.secaoDescricao}>
                  Avisos na barra do celular para entregas antes do encerramento do prazo.
                </Text>
              </View>
            </View>
            <Switch
              value={configuracao.tarefasAtivas}
              onValueChange={async (valor) => {
                await atualizarConfiguracao({ tarefasAtivas: valor });
                exibirFeedback(`Lembretes de tarefas ${valor ? 'ativados' : 'desativados'}.`);
              }}
              trackColor={{
                false: tema.cores.corFundoElevado,
                true: tema.cores.corMarcaPrimaria,
              }}
              thumbColor="#ffffff"
            />
          </View>

          {configuracao.tarefasAtivas && (
            <View style={estilos.subsecao}>
              <Text style={estilos.subsecaoTitulo}>
                Disparar avisos de tarefas com antecedência de:
              </Text>
              <View style={estilos.gradePills}>
                {OPCOES_ANTECEDENCIA_HORAS.map((opcao) => {
                  const listaTarefas = Array.isArray(configuracao.antecedenciaTarefasHoras)
                    ? configuracao.antecedenciaTarefasHoras
                    : [24, 2];
                  const ativo = listaTarefas.map(Number).includes(opcao.valor);
                  return (
                    <TouchableOpacity
                      key={opcao.valor}
                      style={[estilos.pill, ativo ? estilos.pillAtivo : null]}
                      onPress={() =>
                        alternarAntecedenciaHoras(
                          'antecedenciaTarefasHoras',
                          opcao.valor
                        )
                      }
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    >
                      <Text
                        style={[
                          estilos.textoPill,
                          ativo ? estilos.textoPillAtivo : null,
                        ]}
                      >
                        {opcao.rotulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Seção 4: Alertas de Faltas & Efeitos */}
        <View style={estilos.secao}>
          <View style={estilos.secaoIconeTitulo}>
            <View style={[estilos.iconeSecao, { backgroundColor: 'rgba(248, 81, 73, 0.12)' }]}>
              <Ionicons name="warning-outline" size={18} color={tema.cores.corStatusCritico} />
            </View>
            <View style={estilos.secaoTextos}>
              <Text style={estilos.secaoTitulo}>Alertas de Limite de Faltas</Text>
              <Text style={estilos.secaoDescricao}>
                Notificação direta na barra do celular ao zerar o saldo de faltas ou ultrapassar o limite.
              </Text>
            </View>
          </View>

          {/* Switch Alerta Faltas */}
          <View style={estilos.linhaOpcao}>
            <View style={estilos.secaoTextos}>
              <Text style={estilos.rotuloOpcao}>
                Notificação de Limite de Faltas no Celular
              </Text>
              <Text style={estilos.secaoDescricao}>
                Envia notificação prioritária na barra sem travar o aplicativo com modal.
              </Text>
            </View>
            <Switch
              value={configuracao.alertaFaltasAtivo}
              onValueChange={async (valor) => {
                await atualizarConfiguracao({ alertaFaltasAtivo: valor });
                exibirFeedback(`Alerta de limite de faltas ${valor ? 'ativado' : 'desativado'}.`);
              }}
              trackColor={{
                false: tema.cores.corFundoElevado,
                true: tema.cores.corStatusCritico,
              }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Switch Som */}
          <View style={estilos.linhaOpcao}>
            <View style={estilos.secaoTextos}>
              <Text style={estilos.rotuloOpcao}>Som da Notificação</Text>
              <Text style={estilos.secaoDescricao}>
                Tocar som padrão do aparelho ao disparar lembretes (sem vibração).
              </Text>
            </View>
            <Switch
              value={configuracao.somHabilitado}
              onValueChange={async (valor) => {
                await atualizarConfiguracao({ somHabilitado: valor });
                exibirFeedback(`Som de notificação ${valor ? 'ativado' : 'desativado'}.`);
              }}
              trackColor={{
                false: tema.cores.corFundoElevado,
                true: tema.cores.corMarcaPrimaria,
              }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Botão de Teste Direto na Barra do Celular */}
          <TouchableOpacity
            style={estilos.botaoTeste}
            onPress={handleTestarNotificacao}
            disabled={testandoNotificacao}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={18} color={tema.cores.corMarcaPrimaria} style={estilos.iconeBotaoTeste} />
            <Text style={estilos.textoBotaoTeste}>
              {testandoNotificacao ? 'Disparando...' : 'Disparar Notificação de Teste no Celular'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção 5: Backup de dados */}
        <View style={estilos.secao}>
          <View style={estilos.secaoIconeTitulo}>
            <View style={[estilos.iconeSecao, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
              <Ionicons name="server-outline" size={18} color={tema.cores.corMarcaPrimaria} />
            </View>
            <View style={estilos.secaoTextos}>
              <Text style={estilos.secaoTitulo}>Portabilidade & Backup de Dados</Text>
              <Text style={estilos.secaoDescricao}>
                Exporte ou restaure todos os seus dados acadêmicos com total segurança.
              </Text>
            </View>
          </View>

          <View style={estilos.cardResumoBackup}>
            <View style={estilos.linhaResumoBackup}>
              <Text style={estilos.textoItemResumoBackup}>
                <Text style={estilos.destaqueNumero}>{resumoLocal.totalDisciplinas}</Text> Disciplinas
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                <Text style={estilos.destaqueNumero}>{resumoLocal.totalHorarios}</Text> Aulas
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                <Text style={estilos.destaqueNumero}>{resumoLocal.totalFaltas}</Text> Faltas
              </Text>
            </View>
            <View style={estilos.linhaResumoBackup}>
              <Text style={estilos.textoItemResumoBackup}>
                <Text style={estilos.destaqueNumero}>{resumoLocal.totalAvaliacoes}</Text> Avaliações
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                <Text style={estilos.destaqueNumero}>{resumoLocal.totalTarefas}</Text> Tarefas
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                <Text style={estilos.destaqueNumero}>{resumoLocal.totalEventos}</Text> Eventos
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={estilos.botaoGerenciarBackup}
            onPress={() => setModalBackupVisivel(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="save-outline" size={18} color="#ffffff" style={estilos.iconeBotaoBackup} />
            <Text style={estilos.textoBotaoGerenciarBackup}>
              Gerenciar Backup
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção 6: Apoie o Projeto */}
        <View style={estilos.secaoApoie}>
          <View style={estilos.secaoIconeTitulo}>
            <View style={[estilos.iconeSecao, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <Ionicons name="cafe-outline" size={18} color="#eab308" />
            </View>
            <View style={estilos.secaoTextos}>
              <Text style={estilos.secaoTitulo}>Apoie o Projeto ☕</Text>
              <Text style={estilos.secaoDescricao}>
                O app é 100% gratuito e sempre será. Se ele te ajudou, um cafézinho é bem-vindo!
              </Text>
            </View>
          </View>

          <View style={estilos.cardChavePix}>
            <Text style={estilos.labelChavePix}>Chave Pix (Aleatória)</Text>
            <Text style={estilos.textoChavePix} selectable>{CHAVE_PIX}</Text>
          </View>

          <TouchableOpacity
            style={estilos.botaoCopiarPix}
            onPress={async () => {
              await Clipboard.setStringAsync(CHAVE_PIX);
              exibirFeedback('Chave Pix copiada! Obrigado pelo apoio 💜');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={16} color="#0d1117" style={estilos.iconeBotaoPix} />
            <Text style={estilos.textoBotaoCopiarPix}>Copiar Chave Pix</Text>
          </TouchableOpacity>

          <Text style={estilos.rodapeApoie}>Feito com 💜 por um universitário</Text>
        </View>

        {/* Botão Restaurar Padrão */}
        <TouchableOpacity
          style={estilos.botaoRestaurar}
          onPress={handleRestaurarPadrao}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={16} color={tema.cores.corStatusCritico} style={estilos.iconeBotaoRestaurar} />
          <Text style={estilos.textoBotaoRestaurar}>
            Restaurar Configurações Padrão
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Backup */}
      <ModalBackup
        visivel={modalBackupVisivel}
        aoFechar={() => setModalBackupVisivel(false)}
        aoRestaurarSucesso={async () => {
          await carregarConfiguracoes();
          await recarregarBackupResumo();
          exibirFeedback('Backup restaurado e notificações recalculadas!');
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
  conteudo: {
    paddingHorizontal: tema.espacamento.md,
    paddingTop: tema.espacamento.sm,
    paddingBottom: tema.espacamento.xl + 40,
  },
  bannerSucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(46, 160, 67, 0.35)',
    marginBottom: tema.espacamento.md,
    gap: 8,
  },
  textoBannerSucesso: {
    color: tema.cores.corStatusSeguro,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
    flex: 1,
  },
  cardAvisoPermissao: {
    backgroundColor: 'rgba(210, 153, 34, 0.12)',
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: 'rgba(210, 153, 34, 0.35)',
    marginBottom: tema.espacamento.md,
  },
  linhaTopoAvisoPermissao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textosAvisoPermissao: {
    flex: 1,
  },
  tituloAvisoPermissao: {
    color: tema.cores.corStatusAlerta,
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
  descricaoAvisoPermissao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 4,
    lineHeight: 16,
  },
  botaoAtivarPermissao: {
    backgroundColor: tema.cores.corStatusAlerta,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tema.espacamento.sm + 4,
  },
  textoBotaoAtivarPermissao: {
    color: '#0d1117',
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  cardResumo: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
    marginBottom: tema.espacamento.md,
  },
  tituloCardResumo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tema.espacamento.sm + 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  linhaEstatisticas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  itemEstatistica: {
    alignItems: 'center',
    flex: 1,
  },
  iconeResumoContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  numeroEstatistica: {
    color: tema.cores.corTextoPrimario,
    fontSize: 18,
    fontWeight: 'bold',
  },
  rotuloEstatistica: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  divisorVertical: {
    width: 1,
    height: 36,
    backgroundColor: tema.cores.bordaPadrao,
  },
  secao: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
    marginBottom: tema.espacamento.md,
  },
  secaoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secaoIconeTitulo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  iconeSecao: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  secaoTextos: {
    flex: 1,
    paddingRight: tema.espacamento.sm,
  },
  secaoTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: 'bold',
  },
  secaoDescricao: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
    lineHeight: 16,
  },
  subsecao: {
    marginTop: tema.espacamento.md,
    paddingTop: tema.espacamento.sm + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  subsecaoTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro + 1,
    fontWeight: '600',
    marginBottom: tema.espacamento.sm,
  },
  gradePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
    borderRadius: tema.raioBorda.redondo,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillAtivo: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}25`,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoPill: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '500',
  },
  textoPillAtivo: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
  linhaOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tema.espacamento.md,
    paddingTop: tema.espacamento.sm + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  rotuloOpcao: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  botaoTeste: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
    marginTop: tema.espacamento.md,
  },
  iconeBotaoTeste: {
    marginRight: 8,
  },
  textoBotaoTeste: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  botaoRestaurar: {
    flexDirection: 'row',
    paddingVertical: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tema.raioBorda.padrao,
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.3)',
    marginTop: tema.espacamento.xs,
  },
  iconeBotaoRestaurar: {
    marginRight: 6,
  },
  textoBotaoRestaurar: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  cardResumoBackup: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm + 2,
    marginTop: tema.espacamento.sm + 4,
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
  },
  linhaResumoBackup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 4,
  },
  textoItemResumoBackup: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
  },
  destaqueNumero: {
    color: tema.cores.corTextoPrimario,
    fontWeight: 'bold',
  },
  botaoGerenciarBackup: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tema.espacamento.md,
  },
  iconeBotaoBackup: {
    marginRight: 8,
  },
  textoBotaoGerenciarBackup: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
  // ── Seção Apoie o Projeto ─────────────────────────────────────────────────
  secaoApoie: {
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
    marginBottom: tema.espacamento.md,
  },
  cardChavePix: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm + 2,
    marginTop: tema.espacamento.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  labelChavePix: {
    color: '#eab308',
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textoChavePix: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontFamily: 'monospace' as const,
    letterSpacing: 0.3,
  },
  botaoCopiarPix: {
    backgroundColor: '#eab308',
    borderRadius: tema.raioBorda.padrao,
    paddingVertical: 12,
    minHeight: 46,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: tema.espacamento.sm + 4,
  },
  iconeBotaoPix: {
    marginRight: 8,
  },
  textoBotaoCopiarPix: {
    color: '#0d1117',
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700' as const,
  },
  rodapeApoie: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textAlign: 'center' as const,
    marginTop: tema.espacamento.md,
    fontStyle: 'italic' as const,
  },
});
