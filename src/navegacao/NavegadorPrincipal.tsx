import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { TelaHome } from '../telas/Home/TelaHome';
import { TelaDisciplinas } from '../telas/Disciplinas/TelaDisciplinas';
import { TelaGradeHoraria } from '../telas/GradeHoraria/TelaGradeHoraria';
import { TelaFormularioDisciplina } from '../telas/CriarDisciplina/TelaFormularioDisciplina';
import { Disciplina } from '../modelos/Disciplina';
import { tema } from '../estilos/tema';

type AbaAtiva = 'home' | 'disciplinas' | 'grade' | 'formulario';

export const NavegadorPrincipal: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('disciplinas');
  const [disciplinaEdicao, setDisciplinaEdicao] = useState<Disciplina | null>(null);

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
    setAbaAtiva('disciplinas');
  };

  const irParaGrade = () => {
    setDisciplinaEdicao(null);
    setAbaAtiva('grade');
  };

  const irParaHome = () => {
    setDisciplinaEdicao(null);
    setAbaAtiva('home');
  };

  return (
    <View style={estilos.container}>
      <View style={estilos.areaConteudo}>
        {abaAtiva === 'home' && (
          <TelaHome
            aoIrParaDisciplinas={irParaDisciplinas}
            aoIrParaGrade={irParaGrade}
            aoCriarDisciplina={irParaCriarDisciplina}
            aoEditarDisciplina={irParaEditarDisciplina}
          />
        )}
        {abaAtiva === 'disciplinas' && (
          <TelaDisciplinas
            aoCriarDisciplina={irParaCriarDisciplina}
            aoEditarDisciplina={irParaEditarDisciplina}
            aoSelecionarDisciplina={irParaEditarDisciplina}
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
      </View>

      {/* Barra de Abas Inferior */}
      {abaAtiva !== 'formulario' && (
        <SafeAreaView style={estilos.barraAbas}>
          <TouchableOpacity
            style={[estilos.itemAba, abaAtiva === 'home' ? estilos.itemAbaAtiva : null]}
            onPress={irParaHome}
          >
            <Text style={[estilos.iconeAba, abaAtiva === 'home' ? estilos.iconeAbaAtiva : null]}>
              🏠
            </Text>
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
                estilos.iconeAba,
                abaAtiva === 'grade' ? estilos.iconeAbaAtiva : null,
              ]}
            >
              📅
            </Text>
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
                estilos.iconeAba,
                abaAtiva === 'disciplinas' ? estilos.iconeAbaAtiva : null,
              ]}
            >
              📚
            </Text>
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
    paddingVertical: 6,
  },
  itemAbaAtiva: {
    borderTopWidth: 2,
    borderTopColor: tema.cores.corMarcaPrimaria,
  },
  iconeAba: {
    fontSize: 18,
    opacity: 0.6,
  },
  iconeAbaAtiva: {
    opacity: 1,
  },
  textoAba: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  textoAbaAtiva: {
    color: tema.cores.corMarcaPrimaria,
    fontWeight: '700',
  },
});
