import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useDisciplinas } from '../../hooks/useDisciplinas';
import { CardDisciplina } from '../../componentes/CardDisciplina';
import { Disciplina } from '../../modelos/Disciplina';
import { tema } from '../../estilos/tema';

interface TelaHomeProps {
  aoIrParaDisciplinas: () => void;
  aoCriarDisciplina: () => void;
  aoEditarDisciplina: (disciplina: Disciplina) => void;
}

export const TelaHome: React.FC<TelaHomeProps> = ({
  aoIrParaDisciplinas,
  aoCriarDisciplina,
  aoEditarDisciplina,
}) => {
  const { disciplinas } = useDisciplinas();

  return (
    <SafeAreaView style={estilos.container}>
      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        {/* Boas-vindas */}
        <View style={estilos.cabecalho}>
          <Text style={estilos.saudacao}>CampusFlow</Text>
          <Text style={estilos.subtitulo}>Gestão Acadêmica Offline</Text>
        </View>

        {/* Resumo Rápido */}
        <View style={estilos.cardResumo}>
          <View style={estilos.linhaResumo}>
            <View style={estilos.itemEstatistica}>
              <Text style={estilos.numeroEstatistica}>{disciplinas.length}</Text>
              <Text style={estilos.rotuloEstatistica}>Disciplinas</Text>
            </View>
            <View style={estilos.separador} />
            <View style={estilos.itemEstatistica}>
              <Text style={[estilos.numeroEstatistica, { color: tema.cores.corStatusSeguro }]}>100%</Text>
              <Text style={estilos.rotuloEstatistica}>Offline</Text>
            </View>
          </View>
        </View>

        {/* Seção Minhas Disciplinas */}
        <View style={estilos.secaoCabecalho}>
          <Text style={estilos.secaoTitulo}>Minhas Matérias</Text>
          <TouchableOpacity onPress={aoIrParaDisciplinas}>
            <Text style={estilos.linkVerTodas}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {disciplinas.length === 0 ? (
          <View style={estilos.cardVazio}>
            <Text style={estilos.textoVazio}>Nenhuma matéria cadastrada ainda.</Text>
            <TouchableOpacity style={estilos.botaoAdicionar} onPress={aoCriarDisciplina}>
              <Text style={estilos.textoBotaoAdicionar}>+ Cadastrar Disciplina</Text>
            </TouchableOpacity>
          </View>
        ) : (
          disciplinas.slice(0, 3).map((disc) => (
            <CardDisciplina
              key={disc.id}
              disciplina={disc}
              aoPressionar={() => {}}
              aoEditar={aoEditarDisciplina}
              aoExcluir={() => {}}
            />
          ))
        )}
      </ScrollView>
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
  },
  cabecalho: {
    marginTop: tema.espacamento.lg,
    marginBottom: tema.espacamento.md,
  },
  saudacao: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.destaque,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitulo: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginTop: 2,
  },
  cardResumo: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.md,
    marginBottom: tema.espacamento.lg,
    borderWidth: 1,
    borderColor: '#21262d',
  },
  linhaResumo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  itemEstatistica: {
    alignItems: 'center',
  },
  numeroEstatistica: {
    color: tema.cores.corTextoPrimario,
    fontSize: 24,
    fontWeight: 'bold',
  },
  rotuloEstatistica: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.micro,
    marginTop: 2,
  },
  separador: {
    width: 1,
    height: 30,
    backgroundColor: tema.cores.corFundoElevado,
  },
  secaoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tema.espacamento.md,
  },
  secaoTitulo: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.subtitulo,
    fontWeight: 'bold',
  },
  linkVerTodas: {
    color: tema.cores.corMarcaPrimaria,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '600',
  },
  cardVazio: {
    backgroundColor: tema.cores.corFundoCard,
    borderRadius: tema.raioBorda.card,
    padding: tema.espacamento.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21262d',
  },
  textoVazio: {
    color: tema.cores.corTextoSecundario,
    fontSize: tema.tipografia.pequeno,
    marginBottom: tema.espacamento.md,
  },
  botaoAdicionar: {
    backgroundColor: tema.cores.corMarcaPrimaria,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.sm,
    borderRadius: tema.raioBorda.padrao,
  },
  textoBotaoAdicionar: {
    color: tema.cores.corTextoPrimario,
    fontSize: tema.tipografia.pequeno,
    fontWeight: '700',
  },
});
