import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../../services/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { AlimentoSelector } from '../../../../components/personal/AlimentoSelector';
import { ArrowLeft, Plus, Trash2, Apple, Zap, Target, ChevronDown } from 'lucide-react-native';

interface ItemRefeicao {
  alimento_nome: string;
  quantidade_g: string;
  kcal: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

interface Refeicao {
  nome: string;
  itens: ItemRefeicao[];
}

export default function CriarDietaScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const router = useRouter();

  const [metaKcal, setMetaKcal] = useState('2000');
  const [metaPtn, setMetaPtn] = useState('160');
  const [metaCho, setMetaCho] = useState('200');
  const [metaLip, setMetaLip] = useState('60');

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([
    { nome: 'Café da Manhã', itens: [] },
    { nome: 'Almoço', itens: [] },
    { nome: 'Jantar', itens: [] },
  ]);

  const [activeRefeicaoIndex, setActiveRefeicaoIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const addRefeicao = () => {
    setRefeicoes([...refeicoes, { nome: `Refeição ${refeicoes.length + 1}`, itens: [] }]);
  };

  const removeRefeicao = (index: number) => {
    const newRef = [...refeicoes];
    newRef.splice(index, 1);
    setRefeicoes(newRef);
  };

  const addAlimento = (alimento: any) => {
    if (activeRefeicaoIndex === null) return;
    
    const newRef = [...refeicoes];
    newRef[activeRefeicaoIndex].itens.push({
      alimento_nome: alimento.nome,
      quantidade_g: '100',
      kcal: alimento.kcal,
      ptn_g: alimento.ptn_g,
      cho_g: alimento.cho_g,
      lip_g: alimento.lip_g,
    });
    setRefeicoes(newRef);
  };

  const updateItemQuantidade = (refIdx: number, itemIdx: number, qty: string) => {
    const newRef = [...refeicoes];
    newRef[refIdx].itens[itemIdx].quantidade_g = qty;
    setRefeicoes(newRef);
  };

  const removeItem = (refIdx: number, itemIdx: number) => {
    const newRef = [...refeicoes];
    newRef[refIdx].itens.splice(itemIdx, 1);
    setRefeicoes(newRef);
  };

  // Cálculos de Totais
  const totais = useMemo(() => {
    let kcal = 0, ptn = 0, cho = 0, lip = 0;
    refeicoes.forEach(ref => {
      ref.itens.forEach(item => {
        const fator = parseFloat(item.quantidade_g || '0') / 100;
        kcal += item.kcal * fator;
        ptn += item.ptn_g * fator;
        cho += item.cho_g * fator;
        lip += item.lip_g * fator;
      });
    });
    return { kcal, ptn, cho, lip };
  }, [refeicoes]);

  async function handleSalvar() {
    setLoading(true);
    try {
      // 1. Criar Dieta
      const { data: dieta, error: dietaError } = await supabase
        .from('dietas')
        .insert({
          aluno_id: id,
          personal_id: profile?.id,
          calorias_meta: parseInt(metaKcal),
          proteina_g: parseInt(metaPtn),
          carbo_g: parseInt(metaCho),
          gordura_g: parseInt(metaLip),
        })
        .select()
        .single();

      if (dietaError) throw dietaError;

      // 2. Criar Refeições e Itens (Serialmente para o MVP simplificado)
      for (let i = 0; i < refeicoes.length; i++) {
        const ref = refeicoes[i];
        const { data: dbRef, error: refError } = await supabase
          .from('refeicoes')
          .insert({
            dieta_id: dieta.id,
            nome: ref.nome,
            ordem: i
          })
          .select()
          .single();

        if (refError) throw refError;

        const itensToInsert = ref.itens.map(item => {
          const fator = parseFloat(item.quantidade_g || '0') / 100;
          return {
            refeicao_id: dbRef.id,
            alimento_nome: item.alimento_nome,
            quantidade_g: parseFloat(item.quantidade_g),
            calorias: item.kcal * fator,
            proteina_g: item.ptn_g * fator,
            carbo_g: item.cho_g * fator,
            gordura_g: item.lip_g * fator
          };
        });

        if (itensToInsert.length > 0) {
          const { error: itensError } = await supabase
            .from('itens_refeicao')
            .insert(itensToInsert);
          if (itensError) throw itensError;
        }
      }

      Alert.alert('Sucesso', 'Plano alimentar salvo com sucesso!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a dieta');
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
          <Text className="text-2xl font-bold text-gray-900">Prescrever Dieta</Text>
        </View>

        {/* Metas Nutricionais */}
        <Card className="mb-6">
          <View className="flex-row items-center mb-4">
            <Target size={20} color="#2563eb" className="mr-2" />
            <Text className="text-lg font-bold text-gray-800">Metas Diárias</Text>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%] mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Calorias (kcal)</Text>
              <TextInput 
                className="bg-gray-50 p-3 rounded-xl font-bold text-blue-600"
                keyboardType="numeric"
                value={metaKcal}
                onChangeText={setMetaKcal}
              />
            </View>
            <View className="w-[48%] mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Proteínas (g)</Text>
              <TextInput 
                className="bg-gray-50 p-3 rounded-xl font-bold text-red-500"
                keyboardType="numeric"
                value={metaPtn}
                onChangeText={setMetaPtn}
              />
            </View>
            <View className="w-[48%] mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Carbos (g)</Text>
              <TextInput 
                className="bg-gray-50 p-3 rounded-xl font-bold text-orange-500"
                keyboardType="numeric"
                value={metaCho}
                onChangeText={setMetaCho}
              />
            </View>
            <View className="w-[48%] mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Gorduras (g)</Text>
              <TextInput 
                className="bg-gray-50 p-3 rounded-xl font-bold text-yellow-600"
                keyboardType="numeric"
                value={metaLip}
                onChangeText={setMetaLip}
              />
            </View>
          </View>
        </Card>

        {/* Resumo do que está sendo montado */}
        <Card className="mb-6 bg-blue-600">
           <View className="flex-row justify-between items-center mb-3">
             <Text className="text-white font-bold">Resumo Prescrito</Text>
             <Text className="text-blue-200 text-xs">Ajuste as quantidades para bater a meta</Text>
           </View>
           <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{Math.round(totais.kcal)}</Text>
                <Text className="text-blue-200 text-[10px] uppercase">kcal</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{Math.round(totais.ptn)}g</Text>
                <Text className="text-blue-200 text-[10px] uppercase">PTN</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{Math.round(totais.cho)}g</Text>
                <Text className="text-blue-200 text-[10px] uppercase">CHO</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">{Math.round(totais.lip)}g</Text>
                <Text className="text-blue-200 text-[10px] uppercase">LIP</Text>
              </View>
           </View>
        </Card>

        {/* Refeições */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Cardápio</Text>
          <Pressable onPress={addRefeicao} className="flex-row items-center">
            <Plus size={18} color="#2563eb" className="mr-1" />
            <Text className="text-blue-600 font-bold">Nova Refeição</Text>
          </Pressable>
        </View>

        {refeicoes.map((ref, refIdx) => (
          <View key={refIdx} className="mb-6">
            <View className="flex-row justify-between items-center mb-2 px-1">
               <TextInput 
                 className="text-base font-bold text-gray-700 flex-1"
                 value={ref.nome}
                 onChangeText={(v) => {
                   const newRef = [...refeicoes];
                   newRef[refIdx].nome = v;
                   setRefeicoes(newRef);
                 }}
               />
               <Pressable onPress={() => removeRefeicao(refIdx)} className="ml-2">
                 <Trash2 size={18} color="#9ca3af" />
               </Pressable>
            </View>

            <Card className="p-0 overflow-hidden">
               {ref.itens.map((item, itemIdx) => (
                 <View key={itemIdx} className="flex-row items-center p-4 border-b border-gray-50">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium" numberOfLines={1}>{item.alimento_nome}</Text>
                      <Text className="text-[10px] text-gray-400">
                        {Math.round(item.kcal * (parseFloat(item.quantidade_g)/100))} kcal | {Math.round(item.ptn_g * (parseFloat(item.quantidade_g)/100))}g P
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-gray-100 rounded-lg px-2 mr-3">
                      <TextInput 
                        className="p-1 font-bold text-gray-700 w-12 text-center"
                        keyboardType="numeric"
                        value={item.quantidade_g}
                        onChangeText={(v) => updateItemQuantidade(refIdx, itemIdx, v)}
                      />
                      <Text className="text-gray-400 text-xs">g</Text>
                    </View>
                    <Pressable onPress={() => removeItem(refIdx, itemIdx)}>
                      <Trash2 size={16} color="#ef4444" />
                    </Pressable>
                 </View>
               ))}
               <Pressable 
                 className="p-4 items-center flex-row justify-center bg-gray-50"
                 onPress={() => {
                   setActiveRefeicaoIndex(refIdx);
                   setModalVisible(true);
                 }}
               >
                 <Plus size={16} color="#2563eb" className="mr-2" />
                 <Text className="text-blue-600 font-bold text-xs uppercase">Adicionar Alimento</Text>
               </Pressable>
            </Card>
          </View>
        ))}

        <Button 
          title="Finalizar Dieta" 
          loading={loading}
          onPress={handleSalvar}
          className="mb-20"
        />
      </ScrollView>

      <AlimentoSelector 
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setActiveRefeicaoIndex(null);
        }}
        onSelect={addAlimento}
      />
    </KeyboardAvoidingView>
  );
}
