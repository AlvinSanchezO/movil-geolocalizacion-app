import * as Location from 'expo-location'; // 1. Importamos la librería
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [cargando, setCargando] = useState(false);

  // 2. Función para obtener la ubicación del GPS
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

  const enviarUbicacion = async () => {
    if (!latitud || !longitud) {
      Alert.alert("Error", "Primero obtén o escribe las coordenadas");
      return;
    }

    setCargando(true);
    try {
      const response = await fetch('http://192.168.100.12:8000/api-cesar/direccion/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado: "http://192.168.100.12:8000/api-cesar/empleados/1/", 
          latitud: latitud,
          longitud: longitud,
        }),
      });

      if (response.ok) {
        Alert.alert("¡Éxito!", "Ubicación real guardada en el servidor");
        setLatitud('');
        setLongitud('');
      } else {
        Alert.alert("Error", "El servidor rechazó los datos");
      }
    } catch (error) {
      Alert.alert("Error de Conexión", "Verifica tu servidor Django");
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Módulo Direcciones</Text>

      <TouchableOpacity style={styles.botonGPS} onPress={obtenerUbicacionGPS}>
        <Text style={styles.textoBoton}>Obtener Ubicación Real</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Latitud"
        value={latitud}
        onChangeText={setLatitud}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Longitud"
        value={longitud}
        onChangeText={setLongitud}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.boton} onPress={enviarUbicacion} disabled={cargando}>
        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>Enviar a Backend</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 30 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  botonGPS: { width: '100%', height: 50, backgroundColor: '#28a745', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  boton: { width: '100%', height: 50, backgroundColor: '#007bff', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});