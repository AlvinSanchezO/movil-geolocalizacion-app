import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ListaEmpleadosScreen() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMonitoreo = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch('http://192.168.100.12:8000/api-cesar/monitoreo/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      if (response.ok) {
        setEmpleados(data);
      }
    } catch (error) {
      console.error("Error al cargar monitoreo:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoreo();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name="person" size={24} color="#007AFF" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.nombre}>{item.nombre_completo}</Text>
          <Text style={styles.puesto}>{item.puesto}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.ultima_ubicacion ? '#d1e7dd' : '#f8d7da' }]}>
          <Text style={{ color: item.ultima_ubicacion ? '#0f5132' : '#842029', fontSize: 10, fontWeight: 'bold' }}>
            {item.ultima_ubicacion ? 'ACTIVO' : 'SIN DATOS'}
          </Text>
        </View>
      </View>

      {item.ultima_ubicacion ? (
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="location-sharp" size={16} color="#dc3545" />
            <Text style={styles.direccion} numberOfLines={2}>
              {item.ultima_ubicacion.direccion_texto}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#6c757d" />
            <Text style={styles.fecha}>Último reporte: {item.ultima_ubicacion.fecha}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noData}>El empleado aún no ha registrado ubicaciones.</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Cargando equipo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel de Monitoreo</Text>
      </View>

      <FlatList
        data={empleados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMonitoreo(); }} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#212529' },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#e7f1ff', justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 12 },
  nombre: { fontSize: 17, fontWeight: 'bold', color: '#212529' },
  puesto: { fontSize: 13, color: '#6c757d' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  cardBody: { borderTopWidth: 1, borderTopColor: '#f1f3f5', paddingTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  direccion: { flex: 1, marginLeft: 8, fontSize: 13, color: '#495057' },
  fecha: { marginLeft: 8, fontSize: 12, color: '#adb5bd' },
  noData: { textAlign: 'center', color: '#adb5bd', fontStyle: 'italic', marginTop: 5, fontSize: 13 }
});