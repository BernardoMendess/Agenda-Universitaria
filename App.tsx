import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavegadorPrincipal } from './src/navegacao/NavegadorPrincipal';
import { tema } from './src/estilos/tema';

export default function App() {
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
});
