import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCalendario } from '../../hooks/useCalendario';
import { GridCalendarioMensal } from '../../componentes/GridCalendarioMensal';
import { VisaoSemanalCalendario } from '../../componentes/VisaoSemanalCalendario';
import { CardItemCalendario } from '../../componentes/CardItemCalendario';
import { ModalFormularioEvento } from '../../componentes/ModalFormularioEvento';
import { ModalConfirmacao } from '../../componentes/ModalConfirmacao';
import {
  CategoriaFiltroCalendario,
  CATEGORIA_FILTRO_LABELS,
  ItemCalendario,
} from '../../modelos/Calendario';
import { calendarioService } from '../../servicos/CalendarioService';
import { Ionicons } from '@expo/vector-icons';
import { tema } from '../../estilos/tema';

const FILTROS_CATEGORIA: CategoriaFiltroCalendario[] = [
  'TODOS',
  'PROVAS',
  'ENTREGAS',
  'AULAS',
  'EVENTOS',
];

export const TelaCalendario: React.FC = () => {
  const {
    disciplinas,
    dataSelecionada,
    modoVisao,
    filtroCategoria,
    filtroDisciplinaId,
    carregando,
    tituloPeriodo,
    matrizMes,
    semanaAtual,
    eventosDoDiaSelecionado,
    estatisticasPeriodo,
    avancarMes,
    voltarMes,
    avancarSemana,
    voltarSemana,
    irParaHoje,
    selecionarData,
    setModoVisao,
    setFiltroCategoria,
    setFiltroDisciplinaId,
    criarEventoAcademico,
    excluirEventoAcademico,
    alternarConclusao,
  } = useCalendario();

  const [modalNovoEventoVisivel, setModalNovoEventoVisivel] = useState(false);
  const [eventoParaExcluirId, setEventoParaExcluirId] = useState<string | null>(
    null
  );
  const [excluindoEvento, setExcluindoEvento] = useState(false);

  const navegarAnterior = () => {
    if (modoVisao === 'MENSAL') voltarMes();
    else voltarSemana();
  };

  const navegarProximo = () => {
    if (modoVisao === 'MENSAL') avancarMes();
    else avancarSemana();
  };

  const confirmarExclusaoEvento = async () => {
    if (!eventoParaExcluirId) return;
    try {
      setExcluindoEvento(true);
      await excluirEventoAcademico(eventoParaExcluirId);
      setEventoParaExcluirId(null);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao excluir evento.');
    } finally {
      setExcluindoEvento(false);
    }
  };

  return (
    <SafeAreaView style={estilos.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho Principal */}
        <View style={estilos.cabecalho}>
          <View style={estilos.cabecalhoTextos}>
            <Text style={estilos.titulo}>Calendário</Text>
            <Text style={estilos.subtitulo}>
              {estatisticasPeriodo.totalItens} item(ns) no período •{' '}
              {estatisticasPeriodo.totalProvas} provas •{' '}
              {estatisticasPeriodo.totalEntregas} tarefas
            </Text>
          </View>

          <TouchableOpacity
            style={estilos.botaoNovoEvento}
            onPress={() => setModalNovoEventoVisivel(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={estilos.textoBotaoNovoEvento}>Evento</Text>
          </TouchableOpacity>
        </View>

        {/* Barra de Navegação do Período (Mês / Semana) */}
        <View style={estilos.barraNavegacao}>
          <TouchableOpacity
            style={estilos.botaoNavegacaoSeta}
            onPress={navegarAnterior}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Período anterior"
          >
            <Ionicons name="chevron-back" size={20} color={tema.cores.corTextoPrimario} />
          </TouchableOpacity>

          <TouchableOpacity style={estilos.centroNavegacao} onPress={irParaHoje}>
            <Text style={estilos.textoTituloPeriodo}>{tituloPeriodo}</Text>
            <View style={estilos.badgeHoje}>
              <Text style={estilos.textoBadgeHoje}>Hoje</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.botaoNavegacaoSeta}
            onPress={navegarProximo}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Próximo período"
          >
            <Ionicons name="chevron-forward" size={20} color={tema.cores.corTextoPrimario} />
          </TouchableOpacity>
        </View>

        {/* Alternador de Visão: Mensal / Semanal */}
        <View style={estilos.alternadorVisao}>
          <TouchableOpacity
            style={[
              estilos.botaoAlternador,
              modoVisao === 'MENSAL' ? estilos.botaoAlternadorAtivo : null,
            ]}
            onPress={() => setModoVisao('MENSAL')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                estilos.textoAlternador,
                modoVisao === 'MENSAL' ? estilos.textoAlternadorAtivo : null,
              ]}
            >
              Visão Mensal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.botaoAlternador,
              modoVisao === 'SEMANAL' ? estilos.botaoAlternadorAtivo : null,
            ]}
            onPress={() => setModoVisao('SEMANAL')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                estilos.textoAlternador,
                modoVisao === 'SEMANAL' ? estilos.textoAlternadorAtivo : null,
              ]}
            >
              Visão Semanal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barra de Filtros por Categoria */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.scrollFiltros}
        >
          {FILTROS_CATEGORIA.map((cat) => {
            const ativa = filtroCategoria === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  estilos.chipFiltro,
                  ativa ? estilos.chipFiltroAtivo : null,
                ]}
                onPress={() => setFiltroCategoria(cat)}
              >
                <Text
                  style={[
                    estilos.textoChipFiltro,
                    ativa ? estilos.textoChipFiltroAtivo : null,
                  ]}
                >
                  {CATEGORIA_FILTRO_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Barra de Filtros por Disciplina */}
        {disciplinas.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[estilos.scrollFiltros, { marginTop: 4 }]}
          >
            <TouchableOpacity
              style={[
                estilos.chipDisciplina,
                !filtroDisciplinaId ? estilos.chipDisciplinaAtivo : null,
              ]}
              onPress={() => setFiltroDisciplinaId(undefined)}
            >
              <Text
                style={[
                  estilos.textoChipDisciplina,
                  !filtroDisciplinaId ? estilos.textoChipDisciplinaAtivo : null,
                ]}
              >
                Todas Matérias
              </Text>
            </TouchableOpacity>

            {disciplinas.map((disc) => {
              const selecionada = filtroDisciplinaId === disc.id;
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
                  onPress={() =>
                    setFiltroDisciplinaId(selecionada ? undefined : disc.id)
                  }
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
        )}

        {/* Conteúdo Principal do Calendário */}
        {carregando ? (
          <View style={estilos.containerCarregando}>
            <ActivityIndicator size="large" color={tema.cores.corMarcaPrimaria} />
          </View>
        ) : modoVisao === 'MENSAL' ? (
          <View style={estilos.secaoMensal}>
            {/* Grid Mensal */}
            <GridCalendarioMensal
              matrizMes={matrizMes}
              dataSelecionada={dataSelecionada}
              aoSelecionarData={selecionarData}
            />

            {/* Lista Detalhada do Dia Selecionado */}
            <View style={estilos.secaoDiaSelecionado}>
              <View style={estilos.cabecalhoDiaSelecionado}>
                <View>
                  <Text style={estilos.tituloDiaSelecionado}>
                    {calendarioService.formatarDataExtenso(dataSelecionada)}
                  </Text>
                  <Text style={estilos.subtituloDiaSelecionado}>
                    {eventosDoDiaSelecionado.length} compromisso(s) no dia
                  </Text>
                </View>
              </View>

              {eventosDoDiaSelecionado.length === 0 ? (
                <View style={estilos.cardVazio}>
                  <Text style={estilos.textoVazio}>
                    Nenhum evento, prova, aula ou entrega nesta data.
                  </Text>
                  <TouchableOpacity
                    style={estilos.botaoAdicionarVazio}
                    onPress={() => setModalNovoEventoVisivel(true)}
                  >
                    <Text style={estilos.textoBotaoAdicionarVazio}>
                      + Agendar Evento
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                eventosDoDiaSelecionado.map((item) => (
                  <CardItemCalendario
                    key={item.id}
                    item={item}
                    aoAlternarConclusaoTarefa={alternarConclusao}
                    aoExcluirEvento={(id) => setEventoParaExcluirId(id)}
                  />
                ))
              )}
            </View>
          </View>
        ) : (
          /* Visão Semanal */
          <View style={estilos.secaoSemanal}>
            <VisaoSemanalCalendario
              semana={semanaAtual}
              aoAlternarConclusaoTarefa={alternarConclusao}
              aoExcluirEvento={(id) => setEventoParaExcluirId(id)}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal de Criação de Evento Acadêmico */}
      <ModalFormularioEvento
        visivel={modalNovoEventoVisivel}
        dataPreSelecionada={dataSelecionada}
        disciplinas={disciplinas}
        aoFechar={() => setModalNovoEventoVisivel(false)}
        aoSalvar={async (dados) => {
          await criarEventoAcademico(dados as any);
        }}
      />

      {/* Modal de Confirmação de Exclusão de Evento */}
      <ModalConfirmacao
        visivel={!!eventoParaExcluirId}
        titulo="Excluir Evento"
        mensagem="Tem certeza que deseja excluir este evento acadêmico?"
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        aoConfirmar={confirmarExclusaoEvento}
        aoCancelar={() => setEventoParaExcluirId(null)}
        carregando={excluindoEvento}
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
    paddingBottom: 100,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tema.espacamento.sm,
    marginBottom: tema.espacamento.md,
  },
  cabecalhoTextos: {
    flex: 1,
    marginRight: 12,
  },
  titulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.destaque,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  botaoNovoEvento: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: 8,
    borderRadius: tema.raioBorda.padrao,
    minHeight: 40,
  },
  textoBotaoNovoEvento: {
    color: '#ffffff',
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
  barraNavegacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.padrao,
    paddingHorizontal: tema.espacamento.sm,
    paddingVertical: 6,
    marginBottom: tema.espacamento.sm,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
  },
  botaoNavegacaoSeta: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centroNavegacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoTituloPeriodo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal,
    fontWeight: '700',
  },
  badgeHoje: {
    backgroundColor: tema.cores.corFundoElevado,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  textoBadgeHoje: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: 11,
    fontWeight: '700',
  },
  alternadorVisao: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoElevado,
    borderRadius: tema.raioBorda.padrao,
    padding: 4,
    gap: 4,
    marginBottom: tema.espacamento.sm,
  },
  botaoAlternador: {
    flex: 1,
    paddingVertical: 10,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tema.raioBorda.pequeno,
  },
  botaoAlternadorAtivo: {
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
  textoAlternador: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  textoAlternadorAtivo: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  scrollFiltros: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  chipFiltro: {
    backgroundColor: tema.cores.corFundoCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipFiltroAtivo: {
    backgroundColor: `${tema.cores.corMarcaPrimaria}25`,
    borderColor: tema.cores.corMarcaPrimaria,
  },
  textoChipFiltro: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
  },
  textoChipFiltroAtivo: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
  chipDisciplina: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tema.cores.corFundoCard,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: tema.raioBorda.redondo,
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipDisciplinaAtivo: {
    backgroundColor: tema.cores.corFundoElevado,
    borderColor: tema.cores.bordaPadrao,
  },
  pontoCor: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  textoChipDisciplina: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
  },
  textoChipDisciplinaAtivo: {
    color: tema.cores.corTextoPrimario,
    fontWeight: '600',
  },
  containerCarregando: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  secaoMensal: {
    marginTop: 4,
  },
  secaoDiaSelecionado: {
    marginTop: tema.espacamento.sm,
  },
  cabecalhoDiaSelecionado: {
    marginBottom: tema.espacamento.sm,
  },
  tituloDiaSelecionado: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.normal + 1,
    fontWeight: 'bold',
  },
  subtituloDiaSelecionado: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 1,
  },
  secaoSemanal: {
    marginTop: 4,
  },
  cardVazio: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tema.cores.bordaCard,
  },
  textoVazio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginBottom: tema.espacamento.sm,
    textAlign: 'center',
  },
  botaoAdicionarVazio: {
    backgroundColor: tema.cores.corFundoElevado,
    borderWidth: 1,
    borderColor: tema.cores.bordaPadrao,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: tema.raioBorda.pequeno,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoAdicionarVazio: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.micro,
    fontWeight: '600',
  },
});
