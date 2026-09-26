import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
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

type AbaAtiva =
  | 'home'
  | 'calendario'
  | 'tarefas'
  | 'grade'
  | 'disciplinas'
  | 'ajustes'
  | 'formulario'
  | 'detalhes';

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
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('home');
  const [disciplinaEdicao, setDisciplinaEdicao] = useState<Disciplina | null>(null);
  const [disciplinaDetalhes, setDisciplinaDetalhes] = useState<Disciplina | null>(null);

  const irParaCriarDisciplina = () => {
    setDisciplinaEdicao(null);
    setAbaAtiva('formulario');
  };

  const irParaEditarDisciplina = (disciplina: Disciplina) => {
    setDisciplinaEdicao(disciplina);
    setAbaAtiva('formulario');
  };

  const irParaDisciplinas = () => {
    setDisciplinaEdicao(null);
    setDisciplinaDetalhes(null);
    setAbaAtiva('disciplinas');
  };

  const irParaGrade = () => {
    setDisciplinaEdicao(null);
    setDisciplinaDetalhes(null);
    setAbaAtiva('grade');
  };

  const irParaTarefas = () => {
    setDisciplinaEdicao(null);
    setDisciplinaDetalhes(null);
    setAbaAtiva('tarefas');
  };

  const irParaCalendario = () => {
    setDisciplinaEdicao(null);
    setDisciplinaDetalhes(null);
    setAbaAtiva('calendario');
  };

  const irParaHome = () => {
    setDisciplinaEdicao(null);
    setDisciplinaDetalhes(null);
    setAbaAtiva('home');
  };

  const irParaAjustes = () => {
    setDisciplinaEdicao(null);
    setDisciplinaDetalhes(null);
    setAbaAtiva('ajustes');
  };

  const irParaDetalhesDisciplina = (disciplina: Disciplina) => {
    setDisciplinaDetalhes(disciplina);
    setAbaAtiva('detalhes');
  };

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
          />
        )}
        {abaAtiva === 'disciplinas' && (
          <TelaDisciplinas
            aoCriarDisciplina={irParaCriarDisciplina}
            aoEditarDisciplina={irParaEditarDisciplina}
            aoSelecionarDisciplina={irParaDetalhesDisciplina}
          />
        )}
        {abaAtiva === 'ajustes' && (
          <TelaAjustes />
        )}
        {abaAtiva === 'formulario' && (
          <TelaFormularioDisciplina
            disciplinaParaEditar={disciplinaEdicao}
            aoVoltar={irParaDisciplinas}
            aoSalvarSucesso={irParaDisciplinas}
          />
        )}
        {abaAtiva === 'detalhes' && disciplinaDetalhes && (
          <TelaDetalhesDisciplina
            disciplina={disciplinaDetalhes}
            aoVoltar={irParaDisciplinas}
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

