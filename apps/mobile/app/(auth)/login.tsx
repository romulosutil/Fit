import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro no Login', error.message);
    } else {
      router.replace('/');
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <View className="mb-10">
        <Text className="text-3xl font-bold text-gray-900">Bem-vindo ao FitOS</Text>
        <Text className="text-gray-500 mt-2">Faça login para continuar sua jornada</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">E-mail</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Senha</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          className={`w-full p-4 bg-blue-600 rounded-xl items-center mt-4 ${loading ? 'opacity-70' : ''}`}
          onPress={signInWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Entrar</Text>
          )}
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Não tem uma conta? </Text>
        <Link href="/register" asChild>
          <Pressable>
            <Text className="text-blue-600 font-bold">Cadastre-se</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
