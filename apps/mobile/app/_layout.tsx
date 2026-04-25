import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import '../global.css';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
}
