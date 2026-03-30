import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // 1. Importamos el Mapa

export default function HomeScreen() {
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [cargando, setCargando] = useState(false);
  
  // Estado para controlar la región del mapa
  const [region, setRegion] = useState({
    latitude: 32.5149, // Coordenadas iniciales (Tijuana)
    longitude: -117.0382,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const obtenerUbicacionGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Necesitamos permiso para acceder al GPS");
      return;
    }

    setCargando(true);
    try {
      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      setLatitud(lat.toString());
      setLongitud(lon.toString());

      // 2. Actualizamos el mapa para que se mueva a tu ubicación
      setRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      Alert.alert("Éxito", "Ubicación detectada visualmente");
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación");
    } finally {
      setCargando(false);
    }
  };

  const enviarUbicacion = async () => {
    if (!latitud || !longitud) {
      Alert.alert("Error", "Primero obtén las coordenadas con el GPS");
      return;
    }

    setCargando(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert("Sesión inválida", "Por favor vuelve a loguearte.");
        return;
      }

      const response = await fetch('http://192.168.100.12:8000/api-cesar/direccion/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          empleado: "http://192.168.100.12:8000/api-cesar/empleados/1/", 
          latitud: latitud,
          longitud: longitud,
        }),
      });

      if (response.ok) {
        Alert.alert("¡Enviado!", "Coordenadas guardadas en la base de datos.");
        setLatitud('');
        setLongitud('');
      } else {
        Alert.alert("Error", "El servidor no pudo procesar la solicitud.");
      }
    } catch (error) {
      Alert.alert("Error de Conexión", "Verifica que Django esté encendido.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Módulo Direcciones</Text>

      {/* 3. VISTA DEL MAPA */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          region={region}
          showsUserLocation={true}
        >
          {latitud !== '' && (
            <Marker 
              coordinate={{ latitude: parseFloat(latitud), longitude: parseFloat(longitud) }}
              title="Tu ubicación actual"
              description="Aquí se enviarán los datos"
            />
          )}
        </MapView>
      </View>

      <TouchableOpacity style={styles.botonGPS} onPress={obtenerUbicacionGPS}>
        <Text style={styles.textoBoton}>📍 Localizar en el Mapa</Text>
      </TouchableOpacity>

      <View style={styles.coordsBox}>
        <Text style={styles.coordText}>Lat: {latitud || '---'}</Text>
        <Text style={styles.coordText}>Lon: {longitud || '---'}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.boton, cargando && { backgroundColor: '#ccc' }]} 
        onPress={enviarUbicacion} 
        disabled={cargando}
      >
        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.textoBoton}>Enviar Ubicación Confirmada</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f8f9fa', padding: 20, alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 40 },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  coordsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  coordText: { fontSize: 14, fontWeight: '600', color: '#555' },
  botonGPS: { width: '100%', height: 55, backgroundColor: '#28a745', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  boton: { width: '100%', height: 55, backgroundColor: '#007bff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});