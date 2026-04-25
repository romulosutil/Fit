import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../services/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { ArrowLeft, Scale, Ruler, Activity } from 'lucide-react-native';

export default function AvaliacaoFisicaScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [bf, setBf] = useState('');
  const [objetivo, setObjetivo] = useState('');
  
  // Novos estados para Perímetros
  const [braco, setBraco] = useState('');
  const [cintura, setCintura] = useState('');
  const [quadril, setQuadril] = useState('');
  const [coxa, setCoxa] = useState('');

  async function handleSalvar() {
    if (!peso || !altura) return Alert.alert('Erro', 'Peso e Altura são obrigatórios');

    setLoading(true);
    try {
      // 1. Criar a Avaliação Física base
      const { data: aval, error: avalError } = await supabase
        .from('avaliacoes_fisicas')
        .insert({
          aluno_id: id,
          personal_id: profile?.id,
          peso_kg: parseFloat(peso),
          altura_cm: parseFloat(altura),
          bf_pct: bf ? parseFloat(bf) : null,
        })
        .select()
        .single();

      if (avalError) throw avalError;

      // 2. Criar os Perímetros vinculados
      if (braco || cintura || quadril || coxa) {
        const { error: perError } = await supabase
          .from('perimetros')
          .insert({
            avaliacao_id: aval.id,
            braco_cm: braco ? parseFloat(braco) : null,
            cintura_cm: cintura ? parseFloat(cintura) : null,
            quadril_cm: quadril ? parseFloat(quadril) : null,
            coxa_cm: coxa ? parseFloat(coxa) : null,
          });
        
        if (perError) throw perError;
      }

      Alert.alert('Sucesso', 'Avaliação registrada com sucesso!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a avaliação');
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
          <Text className="text-2xl font-bold text-gray-900">Nova Avaliação</Text>
        </View>

        {/* Composição Corporal */}
        <Card className="mb-6">
          <View className="flex-row items-center mb-4">
            <Activity size={20} color="#2563eb" className="mr-2" />
            <Text className="text-lg font-bold text-gray-800">Composição Corporal</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-600 mb-1">Peso (kg)</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 font-bold"
                  placeholder="00.0"
                  keyboardType="numeric"
                  value={peso}
                  onChangeText={setPeso}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-600 mb-1">Altura (cm)</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 font-bold"
                  placeholder="000"
                  keyboardType="numeric"
                  value={altura}
                  onChangeText={setAltura}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">% Gordura (BF)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 font-bold"
                placeholder="00.0"
                keyboardType="numeric"
                value={bf}
                onChangeText={setBf}
              />
            </View>
          </View>
        </Card>

        {/* Perímetros */}
        <Card className="mb-6">
          <View className="flex-row items-center mb-4">
            <Ruler size={20} color="#f59e0b" className="mr-2" />
            <Text className="text-lg font-bold text-gray-800">Perímetros (cm)</Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
             <View className="w-[48%] mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Braço</Text>
                <TextInput 
                  className="bg-gray-50 p-4 rounded-xl font-bold text-gray-700"
                  keyboardType="numeric"
                  placeholder="00.0"
                  value={braco}
                  onChangeText={setBraco}
                />
             </View>
             <View className="w-[48%] mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Cintura</Text>
                <TextInput 
                  className="bg-gray-50 p-4 rounded-xl font-bold text-gray-700"
                  keyboardType="numeric"
                  placeholder="00.0"
                  value={cintura}
                  onChangeText={setCintura}
                />
             </View>
             <View className="w-[48%] mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Quadril</Text>
                <TextInput 
                  className="bg-gray-50 p-4 rounded-xl font-bold text-gray-700"
                  keyboardType="numeric"
                  placeholder="00.0"
                  value={quadril}
                  onChangeText={setQuadril}
                />
             </View>
             <View className="w-[48%] mb-4">
                <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Coxa</Text>
                <TextInput 
                  className="bg-gray-50 p-4 rounded-xl font-bold text-gray-700"
                  keyboardType="numeric"
                  placeholder="00.0"
                  value={coxa}
                  onChangeText={setCoxa}
                />
             </View>
          </View>
        </Card>

        <Card className="mb-10">
          <Text className="text-lg font-bold text-gray-800 mb-4">Notas da Anamnese</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-32 text-gray-900"
            placeholder="Lesões, restrições médicas ou observações..."
            multiline
            textAlignVertical="top"
            value={objetivo}
            onChangeText={setObjetivo}
          />
        </Card>

        <Button 
          title="Finalizar Avaliação" 
          loading={loading}
          onPress={handleSalvar}
          className="mb-20 bg-orange-500"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
