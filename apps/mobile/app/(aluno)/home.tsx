import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { Card } from '../../components/ui/Card';
import { 
  Droplets, 
  Dumbbell, 
  Apple, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AlunoHome() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados do dia
  const [aguaConsumida, setAguaConsumida] = useState(0);
  const [metaAgua] = useState(3000); // vindo do perfil/plano no futuro
  const [treinoDoDia, setTreinoDoDia] = useState<any>(null);
  const [dietaResumo, setDietaResumo] = useState<any>(null);

  async function fetchDadosDoDia() {
    try {
      // 1. Buscar log diário (água e status)
      const hoje = new Date().toISOString().split('T')[0];
      const { data: log } = await supabase
        .from('logs_diarios')
        .select('*')
        .eq('aluno_id', profile?.id)
        .eq('data', hoje)
        .single();

      if (log) {
        setAguaConsumida(log.agua_ml);
      }

      // 2. Buscar treino ativo
      const { data: treino } = await supabase
        .from('treinos')
        .select('*')
        .eq('aluno_id', profile?.id)
        .eq('ativo', true)
        .limit(1)
        .single();
      
      setTreinoDoDia(treino);

      // 3. Buscar resumo da dieta
      const { data: dieta } = await supabase
        .from('dietas')
        .select('*, refeicoes(count)')
        .eq('aluno_id', profile?.id)
        .eq('ativa', true)
        .single();

      setDietaResumo(dieta);

    } catch (error) {
      console.log('Dados iniciais carregados parcialmente');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (profile?.id) fetchDadosDoDia();
  }, [profile?.id]);

  const addAgua = async (quantidade: number) => {
    const novaQtde = aguaConsumida + quantidade;
    setAguaConsumida(novaQtde);
    
    const hoje = new Date().toISOString().split('T')[0];
    await supabase.from('logs_diarios').upsert({
      aluno_id: profile?.id,
      data: hoje,
      agua_ml: novaQtde
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const progressoAgua = Math.min((aguaConsumida / metaAgua) * 100, 100);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDadosDoDia(); }} />}
      >
        {/* Header Aluno */}
        <View className="bg-blue-600 px-6 pt-16 pb-10 rounded-b-[40px] shadow-lg">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-blue-100 text-sm font-medium">Bora treinar,</Text>
              <Text className="text-2xl font-bold text-white">{profile?.nome.split(' ')[0]}! 🔥</Text>
            </View>
            <Pressable className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
              <Award size={24} color="white" />
            </Pressable>
          </View>

          <View className="flex-row gap-4">
             <View className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/10">
                <Text className="text-blue-100 text-[10px] font-bold uppercase">Streak</Text>
                <Text className="text-white text-xl font-bold">5 dias</Text>
             </View>
             <View className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/10">
                <Text className="text-blue-100 text-[10px] font-bold uppercase">XP Total</Text>
                <Text className="text-white text-xl font-bold">1.250</Text>
             </View>
          </View>
        </View>

        <View className="px-6 -mt-6">
          {/* Card de Água */}
          <Card className="p-6 shadow-md border-0">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                  <Droplets size={22} color="#3b82f6" />
                </View>
                <View>
                  <Text className="font-bold text-gray-900 text-base">Hidratação</Text>
                  <Text className="text-gray-500 text-xs">{aguaConsumida}ml de {metaAgua}ml</Text>
                </View>
              </View>
              <Text className="font-bold text-blue-600">{Math.round(progressoAgua)}%</Text>
            </View>
            
            {/* Barra de Progresso */}
            <View className="w-full h-3 bg-blue-50 rounded-full overflow-hidden mb-6">
               <View className="h-full bg-blue-500" style={{ width: `${progressoAgua}%` }} />
            </View>

            <View className="flex-row gap-3">
               <Pressable 
                 onPress={() => addAgua(250)}
                 className="flex-1 bg-gray-50 p-3 rounded-2xl items-center border border-gray-100"
               >
                 <Text className="text-blue-600 font-bold">+ 250ml</Text>
               </Pressable>
               <Pressable 
                 onPress={() => addAgua(500)}
                 className="flex-1 bg-gray-50 p-3 rounded-2xl items-center border border-gray-100"
               >
                 <Text className="text-blue-600 font-bold">+ 500ml</Text>
               </Pressable>
            </View>
          </Card>

          <Text className="text-lg font-bold text-gray-800 mt-8 mb-4">Atividades de Hoje</Text>

          {/* Card de Treino */}
          <Pressable onPress={() => treinoDoDia && router.push(`/(aluno)/treino/${treinoDoDia.id}`)}>
            <Card className="flex-row items-center mb-4 p-4">
              <View className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center mr-4">
                <Dumbbell size={28} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">
                  {treinoDoDia ? treinoDoDia.nome : 'Sem treino prescrito'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {treinoDoDia ? 'Clique para iniciar' : 'Fale com seu personal'}
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Card>
          </Pressable>

          {/* Card de Dieta */}
          <Pressable onPress={() => dietaResumo && router.push('/(aluno)/dieta')}>
            <Card className="flex-row items-center mb-4 p-4">
              <View className="w-14 h-14 bg-green-50 rounded-2xl items-center justify-center mr-4">
                <Apple size={28} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">Plano Alimentar</Text>
                <Text className="text-gray-500 text-sm">
                  {dietaResumo ? `${dietaResumo.calorias_meta} kcal planejadas` : 'Aguardando dieta'}
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Card>
          </Pressable>

          {/* Card de Progresso */}
          <Pressable onPress={() => router.push('/(aluno)/progresso')}>
            <Card className="bg-purple-600 flex-row items-center p-5 mt-4">
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Ver sua Evolução</Text>
                <Text className="text-purple-100 text-sm">Fotos, peso e medidas</Text>
              </View>
              <TrendingUp size={24} color="white" />
            </Card>
          </Pressable>
        </View>

        <Pressable 
          onPress={signOut}
          className="mt-10 mx-6 p-4 rounded-2xl bg-gray-100 items-center"
        >
          <Text className="text-gray-500 font-bold">Sair do App</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
