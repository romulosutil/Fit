import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../services/supabase';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { 
  ArrowLeft, 
  Dumbbell, 
  Apple, 
  ClipboardList, 
  TrendingUp, 
  Calendar,
  User
} from 'lucide-react-native';

interface AlunoProfile {
  nome: string;
  email: string;
}

export default function AlunoDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [aluno, setAluno] = useState<AlunoProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAluno() {
      const { data, error } = await supabase
        .from('profiles')
        .select('nome, email')
        .eq('id', id)
        .single();

      if (!error) setAluno(data);
      setLoading(false);
    }
    fetchAluno();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const menuItems = [
    { 
      title: 'Avaliação Física', 
      subtitle: 'Medidas e Anamnese', 
      icon: ClipboardList, 
      color: 'bg-orange-50', 
      iconColor: '#f97316',
      route: `/(personal)/alunos/${id}/avaliacao` 
    },
    { 
      title: 'Plano de Treino', 
      subtitle: 'Prescrever exercícios', 
      icon: Dumbbell, 
      color: 'bg-blue-50', 
      iconColor: '#2563eb',
      route: `/(personal)/alunos/${id}/treino` 
    },
    { 
      title: 'Plano Alimentar', 
      subtitle: 'Dieta e Macros', 
      icon: Apple, 
      color: 'bg-green-50', 
      iconColor: '#22c55e',
      route: `/(personal)/alunos/${id}/dieta` 
    },
    { 
      title: 'Evolução', 
      subtitle: 'Gráficos de progresso', 
      icon: TrendingUp, 
      color: 'bg-purple-50', 
      iconColor: '#a855f7',
      route: `/(personal)/alunos/${id}/evolucao` 
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-8 rounded-b-[40px] shadow-sm">
        <Pressable onPress={() => router.back()} className="mb-6 w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
          <ArrowLeft size={24} color="#374151" />
        </Pressable>

        <View className="flex-row items-center">
          <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mr-4">
            <User size={40} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">{aluno?.nome}</Text>
            <Text className="text-gray-500">{aluno?.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-lg font-bold text-gray-800 mb-4">Gestão do Aluno</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              className="w-[48%] mb-4"
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Card className="p-4 items-start h-40 justify-between">
                <View className={`w-12 h-12 ${item.color} rounded-2xl items-center justify-center`}>
                  <item.icon size={24} color={item.iconColor} />
                </View>
                <View>
                  <Text className="font-bold text-gray-900 text-base">{item.title}</Text>
                  <Text className="text-gray-500 text-xs mt-1">{item.subtitle}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>

        <Card className="mt-2 mb-10 flex-row items-center p-4">
          <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center mr-4">
            <Calendar size={24} color="#4b5563" />
          </View>
          <View>
            <Text className="font-bold text-gray-900">Histórico de Atividades</Text>
            <Text className="text-gray-500 text-sm">Ver logs diários do aluno</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
