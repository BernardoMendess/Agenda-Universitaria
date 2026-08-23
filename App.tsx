import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavegadorPrincipal } from './src/navegacao/NavegadorPrincipal';
import { tema } from './src/estilos/tema';
import { persistenciaService } from './src/servicos/PersistenciaService';

export default function App() {
  const [bancoPronto, setBancoPronto] = useState<boolean>(false);

  useEffect(() => {
    let montado = true;

    async function prepararBanco() {
      try {
        await persistenciaService.inicializarPersistencia();
      } catch (erro) {
        console.error('Erro ao inicializar persistência:', erro);
      } finally {
        if (montado) {
          setBancoPronto(true);
        }
      }
    }

    prepararBanco();

    return () => {
      montado = false;
    };
  }, []);

  if (!bancoPronto) {
    return (
      <View style={[estilos.container, estilos.carregando]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={tema.cores.corMarcaPrimaria} />
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <StatusBar style="light" />
      <NavegadorPrincipal />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tema.cores.corFundoPrincipal,
  },
  carregando: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

