import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    const cargarDatosSesion = async () => {
      const adminStatus = await SecureStore.getItemAsync('isAdmin');
      const nombre = await SecureStore.getItemAsync('userName');
      
      setIsAdmin(adminStatus === 'true');
      setNombreUsuario(nombre || 'Usuario');
    };
    cargarDatosSesion();
  }, []);

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
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('isAdmin');
              await SecureStore.deleteItemAsync('userName');
              
              router.replace('/login');
            } catch (error) {
              // Usamos 'error' en el log para que ESLint esté feliz
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar la sesión correctamente.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Ionicons 
        name="person-circle-outline" 
        size={80} 
        color={isAdmin ? "#28a745" : "#007AFF"} 
      />
      <Text style={styles.title}>{nombreUsuario}</Text>
      <Text style={styles.subtitle}>
        {isAdmin ? "Panel de Administración" : "Perfil de Empleado"}
      </Text>

      {/* --- SECCIÓN DINÁMICA: AHORA TE LLEVA A LA LISTA --- */}
      {isAdmin && (
        <View style={styles.adminCard}>
          <View style={styles.adminHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#084298" />
            <Text style={styles.adminTitle}>Funciones de Control</Text>
          </View>
          <TouchableOpacity 
            style={styles.adminButton} 
            onPress={() => router.push('/admin/lista_empleados')}
          >
            <Ionicons name="people" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>Ver Lista de Empleados</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          {isAdmin 
            ? "Tienes acceso total a los registros de red." 
            : "Sesión protegida con cifrado JWT."}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
      
      <Text style={styles.footer}>v1.1.0 - Ingeniería en Desarrollo de Software (CESUN)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#212529', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#6c757d', marginBottom: 30 },
  adminCard: {
    backgroundColor: '#cfe2ff',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#b6d4fe',
  },
  adminHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  adminTitle: { fontSize: 18, fontWeight: 'bold', color: '#084298', marginLeft: 10 },
  adminButton: {
    flexDirection: 'row',
    backgroundColor: '#0d6efd',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, width: '100%', marginBottom: 30, borderWidth: 1, borderColor: '#dee2e6' },
  infoText: { color: '#495057', textAlign: 'center', fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545',
    width: '100%',
    height: 55,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { marginTop: 40, color: '#adb5bd', fontSize: 12 }
});