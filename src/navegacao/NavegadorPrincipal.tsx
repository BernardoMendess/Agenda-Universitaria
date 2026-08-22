import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
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
        <SafeAreaView style={estilos.barraAbas}>
          <TouchableOpacity
            style={[estilos.itemAba, abaAtiva === 'home' ? estilos.itemAbaAtiva : null]}
            onPress={irParaHome}
          >
            <Text style={[estilos.textoAba, abaAtiva === 'home' ? estilos.textoAbaAtiva : null]}>
              Início
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.itemAba,
              abaAtiva === 'calendario' ? estilos.itemAbaAtiva : null,
            ]}
            onPress={irParaCalendario}
          >
            <Text
              style={[
                estilos.textoAba,
                abaAtiva === 'calendario' ? estilos.textoAbaAtiva : null,
              ]}
            >
              Calendário
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.itemAba,
              abaAtiva === 'tarefas' ? estilos.itemAbaAtiva : null,
            ]}
            onPress={irParaTarefas}
          >
            <Text
              style={[
                estilos.textoAba,
                abaAtiva === 'tarefas' ? estilos.textoAbaAtiva : null,
              ]}
            >
              Tarefas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.itemAba,
              abaAtiva === 'grade' ? estilos.itemAbaAtiva : null,
            ]}
            onPress={irParaGrade}
          >
            <Text
              style={[
                estilos.textoAba,
                abaAtiva === 'grade' ? estilos.textoAbaAtiva : null,
              ]}
            >
              Grade
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.itemAba,
              abaAtiva === 'disciplinas' ? estilos.itemAbaAtiva : null,
            ]}
            onPress={irParaDisciplinas}
          >
            <Text
              style={[
                estilos.textoAba,
                abaAtiva === 'disciplinas' ? estilos.textoAbaAtiva : null,
              ]}
            >
              Disciplinas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.itemAba,
              abaAtiva === 'ajustes' ? estilos.itemAbaAtiva : null,
            ]}
            onPress={irParaAjustes}
          >
            <Text
              style={[
                estilos.textoAba,
                abaAtiva === 'ajustes' ? estilos.textoAbaAtiva : null,
              ]}
            >
              Ajustes
            </Text>
          </TouchableOpacity>
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
    borderTopColor: '#21262d',
    paddingVertical: tema.espacamento.xs,
  },
  itemAba: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  itemAbaAtiva: {
    borderTopWidth: 2,
    borderTopColor: tema.cores.corMarcaPrimaria,
  },
  textoAba: {
    color: tema.cores.corTextoSecundario,
    fontSize: 11,
    fontWeight: '500',
  },
  textoAbaAtiva: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
});
