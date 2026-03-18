import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do canal de notificação
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NubankScreen() {
  const [connectionStatus, setConnectionStatus] = useState('Aguardando Token...');
  const [token, setToken] = useState('');
  const [isLogged, setIsLogged] = useState(false);

  const CASINO_URL = 'https://398.win.mooo.com';

  useEffect(() => {
    // Carregar token salvo
    async function loadToken() {
      try {
        const savedToken = await AsyncStorage.getItem('influencer_token');
        if (savedToken) {
          setToken(savedToken);
          setIsLogged(true);
        }
      } catch (e) {
        console.error('Erro ao carregar token:', e);
      }
    }
    loadToken();

    // Permissões
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permita as notificações para receber os avisos de Pix!');
      }
    }
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!isLogged || !token) return;

    const pollNotifications = setInterval(async () => {
      try {
        const response = await fetch(`${CASINO_URL}/api/demo/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
          setConnectionStatus('Token Inválido');
          setIsLogged(false);
          return;
        }

        const data = await response.json();
        setConnectionStatus('Conectado ao Cassino');

        if (data && data.new_pix) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Pix recebido!",
              body: `Você recebeu um Pix de R$ ${data.new_pix.amount}.00 de Cash On Pay LTDA.`,
              sound: 'default',
            },
            trigger: null,
          });

          // Marca como lida
          await fetch(`${CASINO_URL}/api/demo/notifications/${data.new_pix.id}/viewed`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (error) {
        setConnectionStatus('Erro de Conexão');
      }
    }, 2000);

    return () => clearInterval(pollNotifications);
  }, [isLogged, token]);

  const handleLogin = async () => {
    if (!token) return alert('Insira o Token do Cassino');
    try {
      await AsyncStorage.setItem('influencer_token', token);
      setIsLogged(true);
    } catch (e) {
      alert('Erro ao salvar token');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('influencer_token');
      setIsLogged(false);
      setConnectionStatus('Aguardando Token...');
    } catch (e) {
      alert('Erro ao sair');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nubank</Text>

      {!isLogged ? (
        <View style={styles.loginBox}>
          <Text style={styles.label}>Token do Influencer:</Text>
          <TextInput
            style={styles.input}
            placeholder="Cole seu token aqui"
            placeholderTextColor="#aaa"
            value={token}
            onChangeText={setToken}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>CONECTAR DISPOSITIVO</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusBox}>
          <View style={styles.ledContainer}>
            <View style={[styles.led, { backgroundColor: connectionStatus.includes('Conectado') ? '#00ff00' : '#ff0000' }]} />
            <Text style={styles.status}>{connectionStatus}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Desconectar e trocar token</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#820ad1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  loginBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 20,
  },
  label: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 14,
    color: 'black',
  },
  button: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#820ad1',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBox: {
    alignItems: 'center',
  },
  ledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  led: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  status: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  logoutBtn: {
    marginTop: 30,
  },
  logoutText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textDecorationLine: 'underline',
  }
});
