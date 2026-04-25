import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'personal' | 'aluno'>('personal');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (!nome) return Alert.alert('Aviso', 'Preencha seu nome');
    
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          role,
        },
      },
    });

    if (error) {
      Alert.alert('Erro no Cadastro', error.message);
    } else {
      // O Supabase tem um trigger que cria o perfil na tabela 'profiles' automaticamente?
      // Se não, vamos criar aqui. (Assumindo que configuramos o trigger ou que vamos criar agora)
      
      // Criar perfil manualmente se o trigger não estiver configurado
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            nome,
            email,
            role,
          });
          
        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        }
      }

      Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar o cadastro!');
      router.replace('/login');
    }
    setLoading(false);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
      <View className="mb-10">
        <Text className="text-3xl font-bold text-gray-900">Crie sua conta</Text>
        <Text className="text-gray-500 mt-2">Escolha seu perfil e comece agora</Text>
      </View>

      <View className="space-y-4">
        <View className="flex-row bg-gray-100 p-1 rounded-xl mb-4">
          <Pressable
            className={`flex-1 p-3 rounded-lg items-center ${role === 'personal' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setRole('personal')}
          >
            <Text className={`font-bold ${role === 'personal' ? 'text-blue-600' : 'text-gray-500'}`}>Sou Personal</Text>
          </Pressable>
          <Pressable
            className={`flex-1 p-3 rounded-lg items-center ${role === 'aluno' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setRole('aluno')}
          >
            <Text className={`font-bold ${role === 'aluno' ? 'text-blue-600' : 'text-gray-500'}`}>Sou Aluno</Text>
          </Pressable>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Nome Completo</Text>
          <TextInput
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl"
            placeholder="Como quer ser chamado?"
            value={nome}
            onChangeText={setNome}
          />
        </View>

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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          className={`w-full p-4 bg-blue-600 rounded-xl items-center mt-4 ${loading ? 'opacity-70' : ''}`}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Criar Conta</Text>
          )}
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Já tem uma conta? </Text>
        <Link href="/login" asChild>
          <Pressable>
            <Text className="text-blue-600 font-bold">Faça login</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
