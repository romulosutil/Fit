import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (profile?.role === 'personal') {
    return <Redirect href="/(personal)/dashboard" />;
  }

  if (profile?.role === 'aluno') {
    return <Redirect href="/(aluno)/home" />;
  }

  // Fallback caso o perfil ainda não tenha carregado ou role seja inválida
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
