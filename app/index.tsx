import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import NotificationPopup from '../components/NotificationPopup';

const API_URL = 'http://161.132.36.191:8000'; // Replace with actual VPS IP/URL

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NubankScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [balance, setBalance] = useState('1.452,00');
  const [notification, setNotification] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    checkToken();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  };

  useEffect(() => {
    let interval: any;
    if (token) {
      interval = setInterval(pollNotifications, 2000);
    }
    return () => clearInterval(interval);
  }, [token]);

  const checkToken = async () => {
    const savedToken = await AsyncStorage.getItem('casino_token');
    if (savedToken) setToken(savedToken);
    else setShowTokenInput(true);
  };

  const saveToken = async () => {
    if (!inputToken) return;
    await AsyncStorage.setItem('casino_token', inputToken);
    setToken(inputToken);
    setShowTokenInput(false);
  };

  const pollNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/demo/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.new_pix) {
          // 1. Show In-App Overlay (For custom Nubank look in video)
          setNotification({
            visible: true,
            title: data.new_pix.title,
            message: data.new_pix.message
          });

          // 2. Schedule Local Notification (For real iOS badge/sound)
          await Notifications.scheduleNotificationAsync({
            content: {
              title: data.new_pix.title,
              body: data.new_pix.message,
              sound: true,
            },
            trigger: null,
          });

          // Mark as viewed immediately
          fetch(`${API_URL}/api/demo/notifications/${data.new_pix.id}/viewed`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileCircle}
            onLongPress={() => setShowTokenInput(true)}
          >
            <Ionicons name="person-outline" size={20} color="white" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="eye-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="help-circle-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="mail-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.greeting}>Olá, Almeida</Text>

        {/* Account Section */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Conta</Text>
            <Ionicons name="chevron-forward" size={16} color="#757575" />
          </View>
          <Text style={styles.balance}>R$ {balance}</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsContainer}>
          <QuickAction icon="qr-code-outline" label="Área Pix" />
          <QuickAction icon="barcode-outline" label="Pagar" />
          <QuickAction icon="trending-up-outline" label="Pegar emprestado" />
          <QuickAction icon="paper-plane-outline" label="Transferir" />
          <QuickAction icon="phone-portrait-outline" label="Recarga de celular" />
        </ScrollView>

        {/* Cards Section */}
        <View style={styles.myCards}>
          <Ionicons name="card-outline" size={20} color="black" />
          <Text style={styles.myCardsText}>Meus cartões</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.purpleText}>Você tem R$ 50.000,00</Text> de limite disponível no cartão de crédito.
          </Text>
        </View>

        {/* Credit Card Section */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cartão de Crédito</Text>
            <Ionicons name="chevron-forward" size={16} color="#757575" />
          </View>
          <Text style={styles.cardSubtitle}>Fatura atual</Text>
          <Text style={styles.balance}>R$ 0,00</Text>
          <Text style={styles.limitInfo}>Limite disponível R$ 50.000,00</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Token Input Overlay */}
      {showTokenInput && (
        <View style={styles.tokenOverlay}>
          <View style={styles.tokenBox}>
            <Text style={styles.tokenTitle}>Configuração de Token</Text>
            <Text style={styles.tokenDesc}>Insira o token de segurança para receber notificações do painel.</Text>
            <TextInput
              style={styles.tokenInput}
              value={inputToken}
              onChangeText={setInputToken}
              placeholder="Cole seu token aqui"
              placeholderTextColor="#999"
              secureTextEntry
            />
            <TouchableOpacity style={styles.tokenButton} onPress={saveToken}>
              <Text style={styles.tokenButtonText}>Salvar e Conectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* iOS Push Notification Mockup */}
      <NotificationPopup
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        onHide={() => setNotification({ ...notification, visible: false })}
      />
    </SafeAreaView>
  );
}

function QuickAction({ icon, label }: { icon: any, label: string }) {
  return (
    <View style={styles.actionItem}>
      <View style={styles.actionCircle}>
        <Ionicons name={icon} size={24} color="black" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#820ad1',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
  },
  greeting: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 0,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  balance: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  cardSubtitle: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
  },
  limitInfo: {
    color: '#757575',
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingLeft: 20,
  },
  actionItem: {
    alignItems: 'center',
    width: 80,
    marginRight: 10,
  },
  actionCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f1f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  myCards: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f1f5',
    marginHorizontal: 24,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
  },
  myCardsText: {
    marginLeft: 12,
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#f0f1f5',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  purpleText: {
    color: '#820ad1',
    fontWeight: '600',
  },
  tokenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  tokenBox: {
    width: '80%',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
  },
  tokenTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  tokenDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  tokenInput: {
    backgroundColor: '#f0f1f5',
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  tokenButton: {
    backgroundColor: '#820ad1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tokenButtonText: {
    color: 'white',
    fontWeight: '700',
  }
});
