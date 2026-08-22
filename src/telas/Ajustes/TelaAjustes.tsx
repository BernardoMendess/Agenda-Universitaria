import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { useBackup } from '../../hooks/useBackup';
import { usePrivacidadeEEficiencia } from '../../hooks/usePrivacidadeEEficiencia';
import { Cabecalho } from '../../componentes/Cabecalho';
import { ModalBackup } from '../../componentes/ModalBackup';
import { CardEficienciaEnergetica } from '../../componentes/CardEficienciaEnergetica';
import { CardPrivacidadeTotal } from '../../componentes/CardPrivacidadeTotal';
import { ModalCertificadoPrivacidade } from '../../componentes/ModalCertificadoPrivacidade';
import { BadgeStatusOffline } from '../../componentes/BadgeStatusOffline';
import { tema } from '../../estilos/tema';

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
    atualizarConfiguracao,
    restaurarPadrao,
    testarAlerta,
    carregarConfiguracoes,
  } = useNotificacoes();

  const { resumoLocal, carregarResumo: recarregarBackupResumo } = useBackup();
  const {
    diagnosticoEficiencia,
    relatorioPrivacidade,
    modalCertificadoVisivel,
    carregarAuditorias,
    abrirModalCertificado,
    fecharModalCertificado,
  } = usePrivacidadeEEficiencia();

  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [modalBackupVisivel, setModalBackupVisivel] = useState<boolean>(false);

  const exibirFeedback = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 2500);
  };

  const alternarAntecedenciaHoras = async (
    campo: 'antecedenciaAvaliacoesHoras' | 'antecedenciaTarefasHoras',
    horas: number
  ) => {
    const listaAtual = configuracao[campo];
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
    exibirFeedback('Preferência de antecedência salva!');
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
    <SafeAreaView style={estilos.container}>
      <Cabecalho
        titulo="Ajustes & Notificações"
        subtitulo="Gestão de lembretes e alarmes locais (RF10)"
      />

      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {mensagemSucesso && (
          <View style={estilos.bannerSucesso}>
            <Text style={estilos.textoBannerSucesso}>✓ {mensagemSucesso}</Text>
          </View>
        )}

        {/* Card Resumo de Alarmes Locais Ativos */}
        <View style={estilos.cardResumo}>
          <Text style={estilos.tituloCardResumo}>Alarmes Locais Programados</Text>
          <View style={estilos.linhaEstatisticas}>
            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>
                {estatisticas.totalAulas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Aulas</Text>
            </View>

            <View style={estilos.divisorVertical} />

            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>
                {estatisticas.totalAvaliacoes}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Avaliações</Text>
            </View>

            <View style={estilos.divisorVertical} />

            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>
                {estatisticas.totalTarefas}
              </Text>
              <Text style={estilos.rotuloEstatistica}>Tarefas</Text>
            </View>

            <View style={estilos.divisorVertical} />

            <View style={estilos.itemEstatistica}>
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
            <View style={estilos.secaoTextos}>
              <Text style={estilos.secaoTitulo}>Lembretes de Aulas</Text>
              <Text style={estilos.secaoDescricao}>
                Avisos locais antes do início de cada matéria na grade semanal.
              </Text>
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
              <Text style={estilos.subsecaoTitulo}>Antecedência do aviso:</Text>
              <View style={estilos.gradePills}>
                {OPCOES_ANTECEDENCIA_AULA.map((opcao) => {
                  const ativo =
                    configuracao.antecedenciaAulaMinutos === opcao.valor;
                  return (
                    <TouchableOpacity
                      key={opcao.valor}
                      style={[estilos.pill, ativo ? estilos.pillAtivo : null]}
                      onPress={async () => {
                        await atualizarConfiguracao({
                          antecedenciaAulaMinutos: opcao.valor,
                        });
                        exibirFeedback(`Avisos de aula ajustados para ${opcao.rotulo} antes.`);
                      }}
                      activeOpacity={0.7}
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
            <View style={estilos.secaoTextos}>
              <Text style={estilos.secaoTitulo}>Lembretes de Provas & Trabalhos</Text>
              <Text style={estilos.secaoDescricao}>
                Alertas automáticos para avaliações e testes agendados.
              </Text>
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
                Disparar alertas com antecedência de (selecione múltiplos):
              </Text>
              <View style={estilos.gradePills}>
                {OPCOES_ANTECEDENCIA_HORAS.map((opcao) => {
                  const ativo =
                    configuracao.antecedenciaAvaliacoesHoras.includes(
                      opcao.valor
                    );
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
            <View style={estilos.secaoTextos}>
              <Text style={estilos.secaoTitulo}>Lembretes de Tarefas (To-Do)</Text>
              <Text style={estilos.secaoDescricao}>
                Avisos locais para tarefas pendentes antes do prazo final.
              </Text>
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
                  const ativo =
                    configuracao.antecedenciaTarefasHoras.includes(opcao.valor);
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
          <Text style={estilos.secaoTitulo}>Alertas Críticos & Efeitos</Text>

          {/* Switch Alerta Faltas */}
          <View style={estilos.linhaOpcao}>
            <View style={estilos.secaoTextos}>
              <Text style={estilos.rotuloOpcao}>
                Alerta Imediato de Limite de Faltas
              </Text>
              <Text style={estilos.secaoDescricao}>
                Modal de emergência e vibração ao atingir o saldo zero de faltas.
              </Text>
            </View>
            <Switch
              value={configuracao.alertaFaltasAtivo}
              onValueChange={async (valor) => {
                await atualizarConfiguracao({ alertaFaltasAtivo: valor });
                exibirFeedback(`Alerta crítico de faltas ${valor ? 'ativado' : 'desativado'}.`);
              }}
              trackColor={{
                false: tema.cores.corFundoElevado,
                true: tema.cores.corStatusCritico,
              }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Switch Vibração */}
          <View style={estilos.linhaOpcao}>
            <View style={estilos.secaoTextos}>
              <Text style={estilos.rotuloOpcao}>Feedback Tátil (Vibração)</Text>
              <Text style={estilos.secaoDescricao}>
                Vibrações do aparelho para confirmação e avisos críticos.
              </Text>
            </View>
            <Switch
              value={configuracao.vibracaoHabilitada}
              onValueChange={async (valor) => {
                await atualizarConfiguracao({ vibracaoHabilitada: valor });
              }}
              trackColor={{
                false: tema.cores.corFundoElevado,
                true: tema.cores.corMarcaPrimaria,
              }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Botão de Teste Sonoro / Tátil */}
          <TouchableOpacity
            style={estilos.botaoTeste}
            onPress={async () => {
              await testarAlerta();
              Alert.alert(
                'Teste de Alerta',
                'O padrão sonoro e tátil de alerta do CampusFlow foi executado no dispositivo.'
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={estilos.textoBotaoTeste}>
              🔔 Testar Alerta Sonoro & Vibração
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção 5: Gerenciamento e Portabilidade de Dados (RF11) */}
        <View style={estilos.secao}>
          <View style={estilos.secaoTextos}>
            <Text style={estilos.secaoTitulo}>Portabilidade & Backup de Dados</Text>
            <Text style={estilos.secaoDescricao}>
              Exporte todos os seus dados locais em arquivo JSON estruturado ou restaure um backup salvo no aparelho (RF11).
            </Text>
          </View>

          <View style={estilos.cardResumoBackup}>
            <View style={estilos.linhaResumoBackup}>
              <Text style={estilos.textoItemResumoBackup}>
                📚 <Text style={estilos.destaqueNumero}>{resumoLocal.totalDisciplinas}</Text> Disciplinas
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                ⏱️ <Text style={estilos.destaqueNumero}>{resumoLocal.totalHorarios}</Text> Aulas
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                ❌ <Text style={estilos.destaqueNumero}>{resumoLocal.totalFaltas}</Text> Faltas
              </Text>
            </View>
            <View style={estilos.linhaResumoBackup}>
              <Text style={estilos.textoItemResumoBackup}>
                📝 <Text style={estilos.destaqueNumero}>{resumoLocal.totalAvaliacoes}</Text> Avaliações
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                ✅ <Text style={estilos.destaqueNumero}>{resumoLocal.totalTarefas}</Text> Tarefas
              </Text>
              <Text style={estilos.textoItemResumoBackup}>
                📅 <Text style={estilos.destaqueNumero}>{resumoLocal.totalEventos}</Text> Eventos
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={estilos.botaoGerenciarBackup}
            onPress={() => setModalBackupVisivel(true)}
            activeOpacity={0.7}
          >
            <Text style={estilos.textoBotaoGerenciarBackup}>
              📦 Exportar / Restaurar Backup Manual (.json)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção 6: Eficiência Energética (RNF04) */}
        <CardEficienciaEnergetica diagnostico={diagnosticoEficiencia} />

        {/* Seção 7: Privacidade Total & Isolamento (RNF05) */}
        <CardPrivacidadeTotal
          relatorio={relatorioPrivacidade}
          aoPressionarVerCertificado={abrirModalCertificado}
        />

        {/* Botão Restaurar Padrão */}
        <TouchableOpacity
          style={estilos.botaoRestaurar}
          onPress={handleRestaurarPadrao}
          activeOpacity={0.7}
        >
          <Text style={estilos.textoBotaoRestaurar}>
            Restaurar Configurações Padrão
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Backup & Portabilidade */}
      <ModalBackup
        visivel={modalBackupVisivel}
        aoFechar={() => setModalBackupVisivel(false)}
        aoRestaurarSucesso={async () => {
          await carregarConfiguracoes();
          await recarregarBackupResumo();
          await carregarAuditorias();
          exibirFeedback('Backup restaurado e dados sincronizados com sucesso!');
        }}
      />

      {/* Modal de Certificado de Privacidade Total (RNF05) */}
      <ModalCertificadoPrivacidade
        visivel={modalCertificadoVisivel}
        certificado={relatorioPrivacidade?.certificado}
        aoFechar={fecharModalCertificado}
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
    padding: tema.espacamento.md,
    paddingBottom: tema.espacamento.xl + 30,
  },
  bannerSucesso: {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: tema.cores.corStatusSeguro,
    marginBottom: tema.espacamento.md,
    alignItems: 'center',
  },
  textoBannerSucesso: {
    color: tema.cores.corStatusSeguro,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  cardResumo: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#21262d',
    marginBottom: tema.espacamento.md,
  },
  tituloCardResumo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: tema.espacamento.sm,
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
  numeroEstatistica: {
    color: tema.cores.corTextoPrimario,
    fontSize: 20,
    fontWeight: 'bold',
  },
  rotuloEstatistica: {
    color: tema.cores.corTextoSecundario,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  divisorVertical: {
    width: 1,
    height: 24,
    backgroundColor: '#30363d',
  },
  secao: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: '#21262d',
    marginBottom: tema.espacamento.md,
  },
  secaoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingTop: tema.espacamento.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  subsecaoTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro + 1,
    fontWeight: '600',
    marginBottom: tema.espacamento.xs + 2,
  },
  gradePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: tema.raioBorda.redondo,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    paddingTop: tema.espacamento.sm,
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
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
    marginTop: tema.espacamento.md,
  },
  textoBotaoTeste: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  cardPrivacidade: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: tema.espacamento.md,
  },
  linhaTopoPrivacidade: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tema.espacamento.xs + 2,
  },
  tituloPrivacidade: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textoPrivacidade: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    lineHeight: 17,
  },
  textoNegrito: {
    color: tema.cores.corTextoPrimario,
    fontWeight: 'bold',
  },
  caixaStatusSQLite: {
    marginTop: tema.espacamento.sm,
    paddingTop: tema.espacamento.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.2)',
    gap: 4,
  },
  itemInfoSQLite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotuloInfoSQLite: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
  },
  valorInfoSQLite: {
    color: tema.cores.corTextoPrimario,
    fontSize: 11,
    fontWeight: '600',
  },
  botaoRestaurar: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tema.raioBorda.padrao,
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 73, 0.3)',
  },
  textoBotaoRestaurar: {
    color: tema.cores.corStatusCritico,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  cardResumoBackup: {
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: tema.espacamento.sm,
    marginTop: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: '#30363d',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tema.espacamento.md,
  },
  textoBotaoGerenciarBackup: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: 'bold',
  },
});
