import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, CheckCircle2, Circle, Apple, Target, Zap } from 'lucide-react-native';

export default function AlunoDietaScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dieta, setDieta] = useState<any>(null);
  const [refeicoes, setRefeicoes] = useState<any[]>([]);
  const [concluidas, setConcluidos] = useState<Record<string, boolean>>({});

  async function fetchDieta() {
    try {
      const { data: dietaData, error: dError } = await supabase
        .from('dietas')
        .select('*')
        .eq('aluno_id', profile?.id)
        .eq('ativa', true)
        .single();

      if (dError) throw dError;
      setDieta(dietaData);

      const { data: refData, error: rError } = await supabase
        .from('refeicoes')
        .select(`
          *,
          itens:itens_refeicao (*)
        `)
        .eq('dieta_id', dietaData.id)
        .order('ordem', { ascending: true });

      if (rError) throw rError;
      setRefeicoes(refData);

      // Buscar checks de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const { data: checks } = await supabase
        .from('checks_refeicao')
        .select('refeicao_id')
        .eq('aluno_id', profile?.id)
        .eq('data', hoje)
        .eq('concluida', true);

      if (checks) {
        const map: Record<string, boolean> = {};
        checks.forEach(c => map[c.refeicao_id] = true);
        setConcluidos(map);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (profile?.id) fetchDieta();
  }, [profile?.id]);

  const toggleRefeicao = async (refId: string) => {
    const isConcluida = !concluidas[refId];
    setConcluidos(prev => ({ ...prev, [refId]: isConcluida }));

    const hoje = new Date().toISOString().split('T')[0];
    await supabase.from('checks_refeicao').upsert({
      aluno_id: profile?.id,
      refeicao_id: refId,
      data: hoje,
      concluida: isConcluida
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-8 shadow-sm">
        <Pressable onPress={() => router.back()} className="mb-6 w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Text className="text-2xl font-bold text-gray-900">Plano Alimentar</Text>
        <Text className="text-gray-500">Siga as orientações do seu Personal</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Metas do Dia */}
        <Card className="bg-blue-600 mb-8 p-6 flex-row justify-between">
           <View className="items-center">
              <Text className="text-white font-bold text-xl">{dieta?.calorias_meta}</Text>
              <Text className="text-blue-100 text-[10px] uppercase">kcal</Text>
           </View>
           <View className="items-center">
              <Text className="text-white font-bold text-xl">{dieta?.proteina_g}g</Text>
              <Text className="text-blue-100 text-[10px] uppercase">PTN</Text>
           </View>
           <View className="items-center">
              <Text className="text-white font-bold text-xl">{dieta?.carbo_g}g</Text>
              <Text className="text-blue-100 text-[10px] uppercase">CHO</Text>
           </View>
           <View className="items-center">
              <Text className="text-white font-bold text-xl">{dieta?.gordura_g}g</Text>
              <Text className="text-blue-100 text-[10px] uppercase">LIP</Text>
           </View>
        </Card>

        {refeicoes.map((ref) => (
          <Pressable key={ref.id} onPress={() => toggleRefeicao(ref.id)}>
            <Card className={`mb-6 p-0 overflow-hidden border-2 ${concluidas[ref.id] ? 'border-green-500 bg-green-50/30' : 'border-transparent'}`}>
              <View className="p-4 flex-row justify-between items-center bg-white/50">
                 <View className="flex-row items-center">
                    <Apple size={20} color="#22c55e" className="mr-2" />
                    <Text className="font-bold text-gray-900 text-lg">{ref.nome}</Text>
                 </View>
                 {concluidas[ref.id] ? (
                    <CheckCircle2 size={24} color="#22c55e" />
                  ) : (
                    <Circle size={24} color="#e5e7eb" />
                  )}
              </View>
              
              <View className="p-4 bg-white/30">
                 {ref.itens.map((item: any, idx: number) => (
                   <View key={idx} className="flex-row justify-between mb-2">
                      <Text className="text-gray-700 flex-1">{item.alimento_nome}</Text>
                      <Text className="text-gray-500 font-bold ml-2">{item.quantidade_g}g</Text>
                   </View>
                 ))}
              </View>
            </Card>
          </Pressable>
        ))}

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
