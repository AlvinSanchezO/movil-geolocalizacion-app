import { Ionicons } from '@expo/vector-icons'; // Iconos que ya vienen con Expo
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir del sistema?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, salir", 
          style: "destructive",
          onPress: async () => {
            try {
              // 1. BORRAMOS EL TOKEN DE LA MEMORIA SEGURA
              await SecureStore.deleteItemAsync('userToken');
              
              console.log("Token eliminado. Sesión cerrada.");
              
              // 2. REGRESAMOS AL LOGIN
              // Usamos replace para que no pueda volver atrás a las tabs
              router.replace('/login');
            } catch (error) {
              Alert.alert("Error", "No se pudo cerrar la sesión correctamente.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
      <Text style={styles.title}>Configuración de Usuario</Text>
      <Text style={styles.subtitle}>Gestiona tu sesión en CESUN Geocesar</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Sesión activa con seguridad JWT</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
      
      <Text style={styles.footer}>v1.0.0 - Ingenieria en Desarrollo de Software</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#e7f1ff',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#b6d4fe',
  },
  infoText: {
    color: '#084298',
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545', // Rojo de peligro/salida
    width: '100%',
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 50,
    color: '#adb5bd',
    fontSize: 12,
  }
});