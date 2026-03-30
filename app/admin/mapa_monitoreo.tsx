import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapaMonitoreoScreen() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Coordenadas iniciales centradas en Tijuana (Cerca de CESUN / Cerro Colorado)
  const initialRegion = {
    latitude: 32.5027,
    longitude: -116.9233,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const fetchUbicaciones = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch('http://192.168.100.12:8000/api-cesar/monitoreo/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        // Filtramos solo los empleados que tengan una ubicación registrada
        setEmpleados(data.filter((emp: any) => emp.ultima_ubicacion !== null));
      }
    } catch (error) {
      console.error("Error al cargar mapa:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
    // Actualización automática cada 30 segundos (Monitoreo Real-Time)
    const interval = setInterval(fetchUbicaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Localizando equipo en Tijuana...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {empleados.map((emp) => (
          <Marker
            key={emp.id}
            coordinate={{
              latitude: parseFloat(emp.ultima_ubicacion.latitud),
              longitude: parseFloat(emp.ultima_ubicacion.longitud),
            }}
          >
            {/* --- DISEÑO DE MARCADOR CON NOMBRE FLOTANTE --- */}
            <View style={styles.customMarkerContainer}>
              <View style={[
                styles.markerLabel, 
                { borderColor: emp.is_staff ? "#007AFF" : "#dc3545" }
              ]}>
                {/* Mostramos solo el primer nombre para no saturar el mapa */}
                <Text style={styles.markerLabelText}>
                  {emp.nombre_completo.split(' ')[0]}
                </Text>
              </View>
              
              <Ionicons 
                name="location" 
                size={38} 
                color={emp.is_staff ? "#007AFF" : "#dc3545"} 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Botón flotante para regresar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#212529" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'flex-end', 
    alignItems: 'center' 
  },
  map: { 
    ...StyleSheet.absoluteFillObject 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontWeight: '600'
  },
  backButton: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 30, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // --- ESTILOS DEL MARCADOR PERSONALIZADO ---
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: -2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#212529',
    textAlign: 'center'
  },
});