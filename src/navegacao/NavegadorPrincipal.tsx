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

const ITENS_BARRA: { id: AbaAtiva; rotulo: string }[] = [
  { id: 'home', rotulo: 'Início' },
  { id: 'calendario', rotulo: 'Calendário' },
  { id: 'tarefas', rotulo: 'Tarefas' },
  { id: 'ajustes', rotulo: 'Ajustes' },
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
        <SafeAreaView style={estilos.barraAbas}>
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
              >
                <Text style={[estilos.textoAba, ativa && estilos.textoAbaAtiva]}>
                  {item.rotulo}
                </Text>
                {ativa && <View style={estilos.indicadorAtivo} />}
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
    borderTopColor: '#21262d',
    paddingTop: tema.espacamento.xs,
    paddingBottom: tema.espacamento.xs,
  },
  itemAba: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minHeight: 48,
    position: 'relative',
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
  indicadorAtivo: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: tema.cores.corMarcaPrimaria,
  },
});
