import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../services/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { ExercicioSelector } from '../../../../components/personal/ExercicioSelector';
import { Exercicio } from '../../../../constants/exercicios';
import { ArrowLeft, Plus, Trash2, Dumbbell, Clock, Hash } from 'lucide-react-native';

interface ExercicioNoTreino {
  nome: string;
  grupo: string;
  series: string;
  reps: string;
  descanso: string;
}

export default function CriarTreinoScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const router = useRouter();

  const [nomeTreino, setNomeTreino] = useState('');
  const [descricao, setDescricao] = useState('');
  const [exercicios, setExercicios] = useState<ExercicioNoTreino[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const addExercicio = (ex: Exercicio) => {
    setExercicios([...exercicios, {
      nome: ex.nome,
      grupo: ex.grupo,
      series: '3',
      reps: '12',
      descanso: '60'
    }]);
  };

  const removeExercicio = (index: number) => {
    const newEx = [...exercicios];
    newEx.splice(index, 1);
    setExercicios(newEx);
  };

  const updateExercicio = (index: number, field: keyof ExercicioNoTreino, value: string) => {
    const newEx = [...exercicios];
    newEx[index] = { ...newEx[index], [field]: value };
    setExercicios(newEx);
  };

  async function handleSalvar() {
    if (!nomeTreino) return Alert.alert('Erro', 'Dê um nome ao treino (ex: Treino A)');
    if (exercicios.length === 0) return Alert.alert('Erro', 'Adicione pelo menos um exercício');

    setLoading(true);
    try {
      // 1. Criar o Treino
      const { data: treino, error: treinoError } = await supabase
        .from('treinos')
        .insert({
          aluno_id: id,
          personal_id: profile?.id,
          nome: nomeTreino,
          descricao: descricao
        })
        .select()
        .single();

      if (treinoError) throw treinoError;

      // 2. Criar os Exercícios do Treino
      const exerciciosToInsert = exercicios.map((ex, index) => ({
        treino_id: treino.id,
        nome: ex.nome,
        grupo_muscular: ex.grupo,
        series: parseInt(ex.series),
        reps: ex.reps,
        descanso_seg: parseInt(ex.descanso),
        ordem: index
      }));

      const { error: exError } = await supabase
        .from('exercicios_treino')
        .insert(exerciciosToInsert);

      if (exError) throw exError;

      Alert.alert('Sucesso', 'Treino prescrito com sucesso!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o treino');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1 px-6 pt-14">
        <View className="flex-row items-center mb-8">
          <Pressable onPress={() => router.back()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm mr-4">
            <ArrowLeft size={24} color="#374151" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900">Prescrever Treino</Text>
        </View>

        <Card className="mb-6">
          <Text className="text-sm font-medium text-gray-600 mb-1">Nome do Treino</Text>
          <TextInput
            className="w-full py-4 text-gray-900 text-lg font-bold"
            placeholder="Ex: Treino A - Superior"
            value={nomeTreino}
            onChangeText={setNomeTreino}
          />
          <TextInput
            className="w-full py-2 text-gray-500"
            placeholder="Breve descrição ou objetivo..."
            value={descricao}
            onChangeText={setDescricao}
          />
        </Card>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Exercícios ({exercicios.length})</Text>
          <Pressable 
            onPress={() => setModalVisible(true)}
            className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Plus size={18} color="white" className="mr-1" />
            <Text className="text-white font-bold">Adicionar</Text>
          </Pressable>
        </View>

        {exercicios.map((ex, index) => (
          <Card key={index} className="mb-4 p-4">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">{ex.nome}</Text>
                <Text className="text-gray-500 text-xs uppercase">{ex.grupo}</Text>
              </View>
              <Pressable onPress={() => removeExercicio(index)} className="p-2 bg-red-50 rounded-lg">
                <Trash2 size={18} color="#ef4444" />
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1">Séries</Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-2">
                  <Hash size={14} color="#9ca3af" />
                  <TextInput
                    className="flex-1 py-2 ml-1 text-gray-900 font-bold"
                    keyboardType="numeric"
                    value={ex.series}
                    onChangeText={(v) => updateExercicio(index, 'series', v)}
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reps</Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-2">
                  <Dumbbell size={14} color="#9ca3af" />
                  <TextInput
                    className="flex-1 py-2 ml-1 text-gray-900 font-bold"
                    value={ex.reps}
                    onChangeText={(v) => updateExercicio(index, 'reps', v)}
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pausa (s)</Text>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-2">
                  <Clock size={14} color="#9ca3af" />
                  <TextInput
                    className="flex-1 py-2 ml-1 text-gray-900 font-bold"
                    keyboardType="numeric"
                    value={ex.descanso}
                    onChangeText={(v) => updateExercicio(index, 'descanso', v)}
                  />
                </View>
              </View>
            </View>
          </Card>
        ))}

        {exercicios.length === 0 && (
          <View className="items-center py-10 bg-white rounded-3xl border border-dashed border-gray-300 mb-6">
            <Text className="text-gray-400">Nenhum exercício adicionado.</Text>
          </Pressable>
        )}

        <Button 
          title="Finalizar Treino" 
          loading={loading}
          onPress={handleSalvar}
          className="mb-20"
        />
      </ScrollView>

      <ExercicioSelector 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={addExercicio}
      />
    </KeyboardAvoidingView>
  );
}
