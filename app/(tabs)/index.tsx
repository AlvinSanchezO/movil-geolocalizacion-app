import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store'; // IMPORTANTE: Para leer el token
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [cargando, setCargando] = useState(false);

  // 1. Función para obtener la ubicación del GPS
  const obtenerUbicacionGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos permiso para acceder al GPS");
      return;
    }

    setCargando(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      setLatitud(location.coords.latitude.toString());
      setLongitud(location.coords.longitude.toString());
      Alert.alert("Éxito", "Coordenadas obtenidas del GPS");
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación");
    } finally {
      setCargando(false);
    }
  };

  // 2. Función para enviar al backend con SEGURIDAD JWT
  const enviarUbicacion = async () => {
    if (!latitud || !longitud) {
      Alert.alert("Error", "Primero obtén o escribe las coordenadas");
      return;
    }

    setCargando(true);
    try {
      // RECUPERAMOS EL TOKEN GUARDADO EN EL LOGIN
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert("Error de sesión", "No se encontró un token válido. Por favor inicia sesión de nuevo.");
        return;
      }

      const response = await fetch('http://192.168.100.12:8000/api-cesar/direccion/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- AQUÍ ENVIAMOS LA LLAVE
        },
        body: JSON.stringify({
          // Asegúrate de que el ID del empleado exista en tu BD
          empleado: "http://192.168.100.12:8000/api-cesar/empleados/1/", 
          latitud: latitud,
          longitud: longitud,
        }),
      });

      if (response.ok) {
        Alert.alert("¡Enviado!", "Ubicación guardada de forma segura en el servidor");
        setLatitud('');
        setLongitud('');
      } else if (response.status === 401) {
        Alert.alert("Sesión expirada", "Tu sesión ha caducado. Vuelve a loguearte.");
      } else {
        Alert.alert("Error", "El servidor rechazó los datos (Verifica el ID del empleado)");
      }
    } catch (error) {
      Alert.alert("Error de Conexión", "No se pudo contactar con Django. Revisa tu IP.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Módulo Direcciones</Text>
      <Text style={styles.subtitulo}>Seguridad JWT Activa</Text>

      <TouchableOpacity style={styles.botonGPS} onPress={obtenerUbicacionGPS}>
        <Text style={styles.textoBoton}>Obtener Ubicación Real</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Latitud</Text>
        <TextInput
          style={styles.input}
          placeholder="Esperando GPS..."
          value={latitud}
          onChangeText={setLatitud}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Longitud</Text>
        <TextInput
          style={styles.input}
          placeholder="Esperando GPS..."
          value={longitud}
          onChangeText={setLongitud}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        style={[styles.boton, cargando && { backgroundColor: '#ccc' }]} 
        onPress={enviarUbicacion} 
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Enviar a Backend Seguro</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8f9fa', alignItems: 'center', justifyContent: 'center', padding: 25 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#212529', marginBottom: 5 },
  subtitulo: { fontSize: 14, color: '#28a745', marginBottom: 30, fontWeight: '600' },
  inputContainer: { width: '100%', marginBottom: 20 },
  label: { fontSize: 14, color: '#6c757d', marginBottom: 5, marginLeft: 5 },
  input: { width: '100%', height: 55, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#dee2e6', fontSize: 16 },
  botonGPS: { width: '100%', height: 55, backgroundColor: '#28a745', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20, elevation: 3 },
  boton: { width: '100%', height: 55, backgroundColor: '#007bff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  textoBoton: { color: '#fff', fontSize: 17, fontWeight: 'bold' }
});