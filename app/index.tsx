import { Redirect } from 'expo-router';

export default function RootIndex() {
  // Aquí es donde en el futuro verificaremos si ya tienes un token guardado.
  // Por ahora, forzamos el envío al Login.
  return <Redirect href="/login" />;
}