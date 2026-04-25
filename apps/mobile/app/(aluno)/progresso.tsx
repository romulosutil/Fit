import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { 
  ArrowLeft, 
  Award, 
  Flame, 
  Zap, 
  Trophy, 
  Target, 
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react-native';

export default function AlunoProgressoScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);

  async function fetchProgresso() {
    try {
      // 1. Buscar XP Total dos logs
      const { data: logs } = await supabase
        .from('logs_diarios')
        .select('xp_ganho, data')
        .eq('aluno_id', profile?.id);

      let totalXp = 0;
      if (logs) {
        totalXp = logs.reduce((acc, curr) => acc + (curr.xp_ganho || 0), 0);
      }

      // 2. Buscar Avaliações
      const { data: avals } = await supabase
        .from('avaliacoes_fisicas')
        .select('*')
        .eq('aluno_id', profile?.id)
        .order('data', { ascending: false });

      setStats({ xp: totalXp, streak: 5 }); // Streak fixo por enquanto no MVP
      setAvaliacoes(avals || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (profile?.id) fetchProgresso();
  }, [profile?.id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const conquistas = [
    { title: 'Iniciante Focado', desc: 'Completou o primeiro treino', icon: Trophy, color: '#f59e0b', unlocked: true },
    { title: 'Hidratado', desc: 'Bateu a meta de água 3 dias seguidos', icon: Zap, color: '#3b82f6', unlocked: true },
    { title: 'Guerreiro', desc: 'Treinou por 7 dias consecutivos', icon: Flame, color: '#ef4444', unlocked: false },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-8 shadow-sm">
        <Pressable onPress={() => router.back()} className="mb-6 w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text className="text-2xl font-bold text-gray-900">Seu Progresso</Text>
        <Text className="text-gray-500">Acompanhe sua evolução e conquistas</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* Stats Principais */}
        <View className="flex-row gap-4 mb-8">
           <Card className="flex-1 items-center p-6 bg-orange-500 border-0">
              <Flame size={32} color="white" className="mb-2" />
              <Text className="text-white text-2xl font-bold">{stats.streak}</Text>
              <Text className="text-orange-100 text-[10px] font-bold uppercase">Dias Seguidos</Text>
           </Card>
           <Card className="flex-1 items-center p-6 bg-blue-600 border-0">
              <Award size={32} color="white" className="mb-2" />
              <Text className="text-white text-2xl font-bold">{stats.xp}</Text>
              <Text className="text-blue-100 text-[10px] font-bold uppercase">XP Total</Text>
           </Card>
        </View>

        <Text className="text-lg font-bold text-gray-800 mb-4">Suas Conquistas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
           {conquistas.map((conq, idx) => (
             <Card key={idx} className={`w-40 mr-4 items-center p-4 ${conq.unlocked ? 'opacity-100' : 'opacity-40'}`}>
                <View className="w-12 h-12 rounded-full items-center justify-center mb-3" style={{ backgroundColor: conq.color + '20' }}>
                   <conq.icon size={24} color={conq.color} />
                </View>
                <Text className="font-bold text-gray-900 text-center text-sm">{conq.title}</Text>
                <Text className="text-[10px] text-gray-500 text-center mt-1">{conq.desc}</Text>
             </Card>
           ))}
        </ScrollView>

        <Text className="text-lg font-bold text-gray-800 mb-4">Histórico de Peso</Text>
        {avaliacoes.length === 0 ? (
          <Card className="p-10 items-center">
             <TrendingUp size={40} color="#e5e7eb" className="mb-2" />
             <Text className="text-gray-400">Nenhuma avaliação registrada.</Text>
          </Card>
        ) : (
          avaliacoes.map((aval, idx) => (
            <Card key={aval.id} className="mb-3 flex-row items-center justify-between p-4">
               <View>
                  <Text className="text-gray-500 text-xs font-bold">{new Date(aval.data).toLocaleDateString('pt-BR')}</Text>
                  <Text className="text-lg font-bold text-gray-900">{aval.peso_kg} kg</Text>
               </View>
               <View className="items-end">
                  <Text className="text-gray-400 text-xs uppercase font-bold">Gordura</Text>
                  <Text className="text-gray-900 font-bold">{aval.bf_pct || '--'}%</Text>
               </View>
            </Card>
          ))
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
