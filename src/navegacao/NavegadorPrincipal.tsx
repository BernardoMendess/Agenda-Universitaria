import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TelaHome } from '../telas/Home/TelaHome';
import { TelaCalendario } from '../telas/Calendario/TelaCalendario';
import { TelaDisciplinas } from '../telas/Disciplinas/TelaDisciplinas';
import { TelaGradeHoraria } from '../telas/GradeHoraria/TelaGradeHoraria';
import { TelaTarefas } from '../telas/Tarefas/TelaTarefas';
import { TelaAjustes } from '../telas/Ajustes/TelaAjustes';
import { TelaFormularioDisciplina } from '../telas/CriarDisciplina/TelaFormularioDisciplina';
import { TelaDetalhesDisciplina } from '../telas/DetalhesDisciplina/TelaDetalhesDisciplina';
import { Disciplina } from '../modelos/Disciplina';
import { tema } from '../estilos/tema';
import { useModalApoio } from '../hooks/useModalApoio';
import { ModalApoioProjeto } from '../componentes/ModalApoioProjeto';

type AbaAtiva =
  | 'home'
  | 'calendario'
  | 'tarefas'
  | 'grade'
  | 'disciplinas'
  | 'ajustes'
  | 'formulario'
  | 'detalhes';

interface Rota {
  aba: AbaAtiva;
  disciplinaEdicao?: Disciplina | null;
  disciplinaDetalhes?: Disciplina | null;
}

interface ItemNavegacao {
  id: AbaAtiva;
  rotulo: string;
  iconeAtivo: keyof typeof Ionicons.glyphMap;
  iconeInativo: keyof typeof Ionicons.glyphMap;
}

const ITENS_BARRA: ItemNavegacao[] = [
  { id: 'home', rotulo: 'Início', iconeAtivo: 'home', iconeInativo: 'home-outline' },
  { id: 'calendario', rotulo: 'Calendário', iconeAtivo: 'calendar', iconeInativo: 'calendar-outline' },
  { id: 'tarefas', rotulo: 'Tarefas', iconeAtivo: 'checkbox', iconeInativo: 'checkbox-outline' },
  { id: 'ajustes', rotulo: 'Ajustes', iconeAtivo: 'settings', iconeInativo: 'settings-outline' },
];

export const NavegadorPrincipal: React.FC = () => {
  const [historico, setHistorico] = useState<Rota[]>([{ aba: 'home' }]);
  const { modalVisivel: modalApoioVisivel, fecharModal: fecharModalApoio } = useModalApoio();

  const rotaAtual = historico[historico.length - 1] || { aba: 'home' };
  const abaAtiva = rotaAtual.aba;
  const disciplinaEdicao = rotaAtual.disciplinaEdicao || null;
  const disciplinaDetalhes = rotaAtual.disciplinaDetalhes || null;

  const navegar = useCallback((novaRota: Rota) => {
    setHistorico((prev) => {
      const atual = prev[prev.length - 1];
      if (
        atual &&
        atual.aba === novaRota.aba &&
        atual.disciplinaEdicao?.id === novaRota.disciplinaEdicao?.id &&
        atual.disciplinaDetalhes?.id === novaRota.disciplinaDetalhes?.id
      ) {
        return prev;
      }
      return [...prev, novaRota];
    });
  }, []);

  const voltar = useCallback(() => {
    setHistorico((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      }
      if (prev.length === 1 && prev[0].aba !== 'home') {
        return [{ aba: 'home' }];
      }
      return prev;
    });
  }, []);

  const irParaHome = useCallback(() => {
    setHistorico([{ aba: 'home' }]);
  }, []);

  const irParaCalendario = useCallback(() => {
    setHistorico((prev) => {
      const semMesmaAba = prev.filter((r) => r.aba !== 'calendario');
      return [...semMesmaAba, { aba: 'calendario' }];
    });
  }, []);

  const irParaTarefas = useCallback(() => {
    setHistorico((prev) => {
      const semMesmaAba = prev.filter((r) => r.aba !== 'tarefas');
      return [...semMesmaAba, { aba: 'tarefas' }];
    });
  }, []);

  const irParaAjustes = useCallback(() => {
    setHistorico((prev) => {
      const semMesmaAba = prev.filter((r) => r.aba !== 'ajustes');
      return [...semMesmaAba, { aba: 'ajustes' }];
    });
  }, []);

  const irParaDisciplinas = useCallback(() => {
    navegar({ aba: 'disciplinas' });
  }, [navegar]);

  const irParaGrade = useCallback(() => {
    navegar({ aba: 'grade' });
  }, [navegar]);

  const irParaCriarDisciplina = useCallback(() => {
    navegar({ aba: 'formulario', disciplinaEdicao: null });
  }, [navegar]);

  const irParaEditarDisciplina = useCallback(
    (disciplina: Disciplina) => {
      navegar({ aba: 'formulario', disciplinaEdicao: disciplina });
    },
    [navegar]
  );

  const irParaDetalhesDisciplina = useCallback(
    (disciplina: Disciplina) => {
      navegar({ aba: 'detalhes', disciplinaDetalhes: disciplina });
    },
    [navegar]
  );

  const aoSalvarDisciplinaSucesso = useCallback(() => {
    setHistorico((prev) => {
      const semFormulario = prev.filter((r) => r.aba !== 'formulario');
      const ultima = semFormulario[semFormulario.length - 1];
      if (ultima?.aba === 'disciplinas') {
        return semFormulario;
      }
      return [...semFormulario, { aba: 'disciplinas' }];
    });
  }, []);

  useEffect(() => {
    const aoPressionarVoltarNativo = () => {
      if (historico.length > 1) {
        voltar();
        return true;
      }
      if (historico.length === 1 && historico[0].aba !== 'home') {
        irParaHome();
        return true;
      }
      return false;
    };

    const inscricao = BackHandler.addEventListener(
      'hardwareBackPress',
      aoPressionarVoltarNativo
    );

    return () => {
      inscricao.remove();
    };
  }, [historico, voltar, irParaHome]);

  const mostrarBarraAbas = abaAtiva !== 'formulario' && abaAtiva !== 'detalhes';

  return (
    <View style={estilos.container}>
      <View style={estilos.areaConteudo}>
        {abaAtiva === 'home' && (
          <TelaHome
            aoIrParaDisciplinas={irParaDisciplinas}
            aoIrParaGrade={irParaGrade}
            aoIrParaTarefas={irParaTarefas}
            aoIrParaCalendario={irParaCalendario}
            aoCriarDisciplina={irParaCriarDisciplina}
            aoEditarDisciplina={irParaEditarDisciplina}
            aoVerDetalhesDisciplina={irParaDetalhesDisciplina}
          />
        )}
        {abaAtiva === 'calendario' && (
          <TelaCalendario />
        )}
        {abaAtiva === 'tarefas' && (
          <TelaTarefas />
        )}
        {abaAtiva === 'grade' && (
          <TelaGradeHoraria
            aoCriarDisciplina={irParaCriarDisciplina}
            aoVoltar={voltar}
          />
        )}
        {abaAtiva === 'disciplinas' && (
          <TelaDisciplinas
            aoCriarDisciplina={irParaCriarDisciplina}
            aoEditarDisciplina={irParaEditarDisciplina}
            aoSelecionarDisciplina={irParaDetalhesDisciplina}
            aoVoltar={voltar}
          />
        )}
        {abaAtiva === 'ajustes' && (
          <TelaAjustes />
        )}
        {abaAtiva === 'formulario' && (
          <TelaFormularioDisciplina
            disciplinaParaEditar={disciplinaEdicao}
            aoVoltar={voltar}
            aoSalvarSucesso={aoSalvarDisciplinaSucesso}
          />
        )}
        {abaAtiva === 'detalhes' && disciplinaDetalhes && (
          <TelaDetalhesDisciplina
            disciplina={disciplinaDetalhes}
            aoVoltar={voltar}
            aoEditar={irParaEditarDisciplina}
          />
        )}
      </View>

      {/* Barra de Abas Inferior */}
      {mostrarBarraAbas && (
        <SafeAreaView style={estilos.barraAbas} edges={['bottom']}>
          {ITENS_BARRA.map((item) => {
            const ativa = abaAtiva === item.id;
            const acaoMap: Record<string, () => void> = {
              home: irParaHome,
              calendario: irParaCalendario,
              tarefas: irParaTarefas,
              ajustes: irParaAjustes,
            };
            return (
              <TouchableOpacity
                key={item.id}
                style={estilos.itemAba}
                onPress={acaoMap[item.id]}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativa }}
                accessibilityLabel={item.rotulo}
              >
                <View style={[estilos.iconeContainer, ativa && estilos.iconeContainerAtivo]}>
                  <Ionicons
                    name={ativa ? item.iconeAtivo : item.iconeInativo}
                    size={22}
                    color={ativa ? tema.cores.corMarcaPrimaria : tema.cores.corTextoSecundario}
                  />
                </View>
                <Text style={[estilos.textoAba, ativa && estilos.textoAbaAtiva]}>
                  {item.rotulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </SafeAreaView>
      )}

      {/* Pop-up de Apoio ao Projeto (exibido apenas 1x após 10 minutos de uso) */}
      <ModalApoioProjeto
        visivel={modalApoioVisivel}
        aoFechar={fecharModalApoio}
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.cores.corFundoPrincipal,
  },
  areaConteudo: {
    flex: 1,
  },
  barraAbas: {
    flexDirection: 'row',
    backgroundColor: tema.cores.corFundoCard,
    borderTopWidth: 1,
    borderTopColor: tema.cores.bordaCard,
    paddingTop: tema.espacamento.xs,
    paddingBottom: tema.espacamento.xs,
  },
  itemAba: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tema.espacamento.sm,
    minHeight: 52,
  },
  iconeContainer: {
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: tema.raioBorda.redondo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconeContainerAtivo: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  textoAba: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    fontWeight: '500',
  },
  textoAbaAtiva: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
});

