import { View, Text, Pressable } from 'react-native';
import { Card } from '../ui/Card';
import { ChevronRight, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface AlunoCardProps {
  id: string;
  nome: string;
  email: string;
  status: string;
}

export function AlunoCard({ id, nome, email, status }: AlunoCardProps) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/(personal)/alunos/${id}`)}>
      <Card className="flex-row items-center mb-3">
        <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
          <User size={24} color="#2563eb" />
        </View>
        
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">{nome}</Text>
          <Text className="text-gray-500 text-sm">{email}</Text>
        </View>

        <View className="items-end">
          <View className={`px-2 py-1 rounded-md mb-1 ${status === 'ativo' ? 'bg-green-50' : 'bg-red-50'}`}>
            <Text className={`text-[10px] font-bold ${status === 'ativo' ? 'text-green-600' : 'text-red-600'}`}>
              {status.toUpperCase()}
            </Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </View>
      </Card>
    </Pressable>
  );
}
