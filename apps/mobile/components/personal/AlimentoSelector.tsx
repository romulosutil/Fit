import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Modal } from 'react-native';
import TACO_DATA from '../../assets/taco.json';
import { Search, X, Check, Plus } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface Alimento {
  id: number;
  nome: string;
  kcal: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

interface AlimentoSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (alimento: Alimento) => void;
}

export function AlimentoSelector({ visible, onClose, onSelect }: AlimentoSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = (TACO_DATA as Alimento[]).filter(al => 
    al.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-gray-50 pt-14 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">Buscar Alimento</Text>
          <Pressable onPress={onClose} className="p-2 bg-gray-200 rounded-full">
            <X size={20} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-6">
          <Search size={20} color="#9ca3af" className="mr-2" />
          <TextInput
            className="flex-1 py-4 text-gray-900"
            placeholder="Arroz, frango, ovo..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Card className="flex-row items-center justify-between mb-3 p-4">
                <View className="flex-1 mr-2">
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{item.nome}</Text>
                  <Text className="text-gray-500 text-xs uppercase">
                    {item.kcal} kcal | P: {item.ptn_g}g | C: {item.cho_g}g | G: {item.lip_g}g
                  </Text>
                  <Text className="text-gray-400 text-[10px] mt-1">* Valores para 100g</Text>
                </View>
                <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center">
                  <Plus size={16} color="#22c55e" />
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-gray-500">Nenhum alimento encontrado.</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}
