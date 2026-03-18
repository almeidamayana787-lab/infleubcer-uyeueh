import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NubankScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nubank Clone</Text>
      <Text style={styles.subtitle}>Teste de Inicialização</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#820ad1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
  },
});
