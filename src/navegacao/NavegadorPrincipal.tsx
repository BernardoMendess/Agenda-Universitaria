import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { TelaHome } from '../telas/Home/TelaHome';
import { TelaDisciplinas } from '../telas/Disciplinas/TelaDisciplinas';
import { TelaGradeHoraria } from '../telas/GradeHoraria/TelaGradeHoraria';
import { TelaFormularioDisciplina } from '../telas/CriarDisciplina/TelaFormularioDisciplina';
import { TelaDetalhesDisciplina } from '../telas/DetalhesDisciplina/TelaDetalhesDisciplina';
import { Disciplina } from '../modelos/Disciplina';
import { tema } from '../estilos/tema';

type AbaAtiva = 'home' | 'disciplinas' | 'grade' | 'formulario' | 'detalhes';

export const NavegadorPrincipal: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('disciplinas');
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

  const irParaHome = () => {
    setDisciplinaEdicao(null);
    setDisciplinaDetalhes(null);
    setAbaAtiva('home');
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
            aoCriarDisciplina={irParaCriarDisciplina}
            aoEditarDisciplina={irParaEditarDisciplina}
            aoVerDetalhesDisciplina={irParaDetalhesDisciplina}
          />
        )}
        {abaAtiva === 'disciplinas' && (
          <TelaDisciplinas
            aoCriarDisciplina={irParaCriarDisciplina}
            aoEditarDisciplina={irParaEditarDisciplina}
            aoSelecionarDisciplina={irParaDetalhesDisciplina}
          />
        )}
        {abaAtiva === 'grade' && (
          <TelaGradeHoraria
            aoCriarDisciplina={irParaCriarDisciplina}
          />
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
              Grade Horária
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
    paddingVertical: 12,
  },
  itemAbaAtiva: {
    borderTopWidth: 2,
    borderTopColor: tema.cores.corMarcaPrimaria,
  },
  textoAba: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '500',
  },
  textoAbaAtiva: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
});
