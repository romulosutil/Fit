import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../services/supabase';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, CheckCircle2, Circle, Clock, Info } from 'lucide-react-native';

interface Exercicio {
  id: string;
  nome: string;
  grupo_muscular: string;
  series: number;
  reps: string;
  descanso_seg: number;
  concluido?: boolean;
}

export default function ExecutarTreinoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [treino, setTreino] = useState<any>(null);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [concluidos, setConcluidos] = useState<Record<string, boolean>>({});

  async function fetchTreino() {
    try {
      const { data: treinoData, error: tError } = await supabase
        .from('treinos')
        .select('*')
        .eq('id', id)
        .single();

      if (tError) throw tError;
      setTreino(treinoData);

      const { data: exData, error: exError } = await supabase
        .from('exercicios_treino')
        .select('*')
        .eq('treino_id', id)
        .order('ordem', { ascending: true });

      if (exError) throw exError;
      setExercicios(exData);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar o treino');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTreino();
  }, [id]);

  const toggleExercicio = (exId: string) => {
    setConcluidos(prev => ({
      ...prev,
      [exId]: !prev[exId]
    }));
  };

  const totalConcluidos = Object.values(concluidos).filter(v => v).length;
  const progresso = exercicios.length > 0 ? (totalConcluidos / exercicios.length) * 100 : 0;

  async function handleFinalizarTreino() {
    if (totalConcluidos === 0) {
      return Alert.alert('Aviso', 'Marque pelo menos um exercício concluído');
    }

    setLoading(true);
    try {
      // Registrar no log diário
      const hoje = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('logs_diarios').upsert({
        aluno_id: treino.aluno_id,
        data: hoje,
        treino_concluido: true,
        xp_ganho: 100 // XP fixo por treino no MVP
      });

      if (error) throw error;

      Alert.alert('Parabéns!', 'Treino finalizado com sucesso. +100 XP!');
      router.replace('/(aluno)/home');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o progresso');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Fixo */}
      <View className="bg-white px-6 pt-14 pb-6 shadow-sm z-10">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-gray-500 text-xs font-bold uppercase">Treinando agora</Text>
            <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>{treino?.nome}</Text>
          </View>
        </View>

        {/* Barra de Progresso do Treino */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-600 text-sm font-bold">Seu progresso</Text>
          <Text className="text-blue-600 text-sm font-bold">{totalConcluidos}/{exercicios.length}</Text>
        </View>
        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <View className="h-full bg-blue-600" style={{ width: `${progresso}%` }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {exercicios.map((ex, index) => (
          <Pressable key={ex.id} onPress={() => toggleExercicio(ex.id)}>
            <Card className={`mb-4 p-4 border-2 ${concluidos[ex.id] ? 'border-green-500 bg-green-50/30' : 'border-transparent'}`}>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-gray-400 font-bold text-xs mr-2">#0{index + 1}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold uppercase">{ex.grupo_muscular}</Text>
                  </View>
                  <Text className="text-lg font-bold text-gray-900 mb-3">{ex.nome}</Text>
                  
                  <View className="flex-row gap-4">
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 bg-gray-100 rounded-md items-center justify-center mr-1">
                        <Text className="text-gray-700 font-bold text-xs">{ex.series}</Text>
                      </View>
                      <Text className="text-gray-500 text-xs">Séries</Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 bg-gray-100 rounded-md items-center justify-center mr-1">
                        <Text className="text-gray-700 font-bold text-xs">x</Text>
                      </View>
                      <Text className="text-gray-500 text-xs">{ex.reps} reps</Text>
                    </View>

                    <View className="flex-row items-center">
                      <Clock size={14} color="#9ca3af" className="mr-1" />
                      <Text className="text-gray-500 text-xs">{ex.descanso_seg}s</Text>
                    </View>
                  </View>
                </View>

                <View className="ml-4">
                  {concluidos[ex.id] ? (
                    <CheckCircle2 size={32} color="#22c55e" />
                  ) : (
                    <Circle size={32} color="#e5e7eb" />
                  )}
                </View>
              </View>
            </Card>
          </Pressable>
        ))}

        <View className="h-10" />
        
        <Button 
          title="Finalizar Treino" 
          loading={loading}
          onPress={handleFinalizarTreino}
          className="mb-20 bg-green-600"
        />
      </ScrollView>
    </View>
  );
}
