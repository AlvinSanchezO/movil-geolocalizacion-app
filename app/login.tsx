import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    // 1. Validación de campos locales
    if (!username || !password) {
      Alert.alert("Campos requeridos", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      // 2. Petición al Backend de Django (Usando tu IPv4 de Tijuana)
      // Nota: Asegúrate de que Django corra con: python manage.py runserver 0.0.0.0:8000
      const response = await fetch('http://192.168.100.12:8000/api/token/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          username: username, 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. PERSISTENCIA: Guardamos el token JWT en el almacenamiento seguro
        // Esto es lo que nos permitirá enviar coordenadas después
        await SecureStore.setItemAsync('userToken', data.access);
        
        console.log("Login exitoso. Token JWT persistido en el dispositivo.");
        
        Alert.alert("¡Éxito!", `Bienvenido al sistema, ${username}`);
        
        // 4. NAVEGACIÓN: Reemplazamos la pantalla actual por el Módulo de Direcciones
        // Usamos replace para que el usuario no pueda "regresar" al login con el botón físico de atrás
        router.replace('/(tabs)'); 
      } else {
        // Error 401 o credenciales inválidas
        Alert.alert("Error de acceso", "Usuario o contraseña incorrectos. Verifica tus credenciales de Django.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      Alert.alert(
        "Sin conexión", 
        "No se pudo conectar con el servidor Django.\n\n1. Revisa que tu PC y Celular estén en el mismo Wi-Fi.\n2. Verifica que ALLOWED_HOSTS incluya tu IP en settings.py."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.brandTitle}>CESUN</Text>
            <Text style={styles.appTitle}>Geocesar Mobile</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar Sesión</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: alvinsanchez"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#adb5bd"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#adb5bd"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar al Sistema</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Ingeniería en Desarrollo de Software</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#212529',
    marginTop: 5,
  },
  divider: {
    width: 50,
    height: 4,
    backgroundColor: '#007AFF',
    marginTop: 10,
    borderRadius: 2,
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f3f5',
    padding: 16,
    borderRadius: 15,
    fontSize: 16,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a2c8f5',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  footer: {
    textAlign: 'center',
    color: '#adb5bd',
    fontSize: 12,
    marginTop: 40,
    fontWeight: '500'
  }
});