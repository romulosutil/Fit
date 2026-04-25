import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, Modal } from 'react-native';
import { BANCO_EXERCICIOS, Exercicio } from '../../constants/exercicios';
import { Search, X, Check } from 'lucide-react-native';
import { Card } from '../ui/Card';

interface ExercicioSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercicio: Exercicio) => void;
}

export function ExercicioSelector({ visible, onClose, onSelect }: ExercicioSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = BANCO_EXERCICIOS.filter(ex => 
    ex.nome.toLowerCase().includes(search.toLowerCase()) || 
    ex.grupo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-gray-50 pt-14 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">Selecionar Exercício</Text>
          <Pressable onPress={onClose} className="p-2 bg-gray-200 rounded-full">
            <X size={20} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-6">
          <Search size={20} color="#9ca3af" className="mr-2" />
          <TextInput
            className="flex-1 py-4 text-gray-900"
            placeholder="Buscar por nome ou grupo..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.nome}
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Card className="flex-row items-center justify-between mb-3 p-4">
                <View>
                  <Text className="text-base font-bold text-gray-900">{item.nome}</Text>
                  <Text className="text-gray-500 text-xs uppercase">{item.grupo}</Text>
                </View>
                <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center">
                  <Check size={16} color="#2563eb" />
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-gray-500">Nenhum exercício encontrado.</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}
