import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { AlunoCard } from '../../components/personal/AlunoCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Users, Plus, LogOut, Bell } from 'lucide-react-native';

interface Aluno {
  aluno_id: string;
  status: string;
  profiles: {
    nome: string;
    email: string;
  };
}

export default function PersonalDashboard() {
  const { profile, signOut } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Simulação de dados financeiros (no futuro virá do profile)
  const isTrial = profile?.subscription_status === 'trial';
  const trialDaysLeft = 25; // mock

  async function fetchAlunos() {
    try {
      // 1. Buscar alunos vinculados
      const { data, error } = await supabase
        .from('personal_alunos')
        .select(`
          aluno_id,
          status,
          profiles:aluno_id (id, nome, email)
        `)
        .eq('personal_id', profile?.id);

      if (error) throw error;

      // 2. Buscar última atividade de cada aluno (melhoria para alertas)
      const alunosComAtividade = await Promise.all((data as any[]).map(async (al) => {
        const { data: log } = await supabase
          .from('logs_diarios')
          .select('data')
          .eq('aluno_id', al.aluno_id)
          .order('data', { ascending: false })
          .limit(1)
          .single();
        
        return { ...al, ultima_atividade: log?.data || null };
      }));

      setAlunos(alunosComAtividade);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (profile?.id) fetchAlunos();
  }, [profile?.id]);

  const filteredAlunos = alunos.filter(al => 
    al.profiles.nome.toLowerCase().includes(search.toLowerCase())
  );

  const alunosInativos = alunos.filter(al => {
    if (!al.ultima_atividade) return true;
    const diffDays = (new Date().getTime() - new Date(al.ultima_atividade).getTime()) / (1000 * 3600 * 24);
    return diffDays > 3;
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlunos();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-6 rounded-b-[40px] shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-500 text-sm font-medium">Bom dia, Coach</Text>
            <Text className="text-2xl font-bold text-gray-900">{profile?.nome}</Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
              <Bell size={20} color="#374151" />
            </Pressable>
            <Pressable 
              className="w-10 h-10 bg-red-50 rounded-full items-center justify-center"
              onPress={signOut}
            >
              <LogOut size={20} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        <View className="flex-row gap-4 mt-2">
          <View className="flex-1 bg-blue-600 p-4 rounded-3xl">
            <Text className="text-blue-100 text-[10px] font-bold uppercase mb-1">Alunos Ativos</Text>
            <Text className="text-white text-3xl font-bold">{alunos.length}</Text>
          </View>
          <View className="flex-1 bg-orange-500 p-4 rounded-3xl">
            <Text className="text-orange-100 text-[10px] font-bold uppercase mb-1">Inativos (3d+)</Text>
            <Text className="text-white text-3xl font-bold">{alunosInativos.length}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
      >
        {/* Banner de Trial/Upgrade */}
        {isTrial && (
          <Card className="bg-blue-600 mb-6 border-0">
             <View className="flex-row justify-between items-center mb-4">
                <View>
                   <Text className="text-white font-bold text-lg">Plano Free Trial</Text>
                   <Text className="text-blue-100 text-xs">Você tem {trialDaysLeft} dias restantes</Text>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                   <Text className="text-white font-bold text-[10px]">UPGRADE</Text>
                </View>
             </View>
             <Text className="text-blue-50 text-xs mb-4">No plano gratuito você pode gerenciar até 1 aluno. Assine para alunos ilimitados.</Text>
             <Button 
               title="Assinar Agora" 
               variant="secondary" 
               className="py-2 rounded-xl"
               onPress={() => Alert.alert('Upgrade', 'Redirecionando para checkout...')}
             />
          </Card>
        )}

        {/* Alerta de Inatividade */}
        {alunosInativos.length > 0 && (
          <Card className="bg-red-50 border-red-100 mb-8 flex-row items-center">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <Bell size={20} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="text-red-900 font-bold">Atenção!</Text>
              <Text className="text-red-700 text-xs">Existem alunos que não treinam há mais de 3 dias.</Text>
            </View>
          </Card>
        )}

        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold text-gray-900">Meus Alunos</Text>
        </View>

        {/* Busca */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 mb-6 shadow-sm">
          <Search size={20} color="#9ca3af" className="mr-2" />
          <TextInput
            className="flex-1 py-4 text-gray-900"
            placeholder="Buscar aluno por nome..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
        ) : filteredAlunos.length === 0 ? (
          <Card className="items-center py-10">
            <Users size={40} color="#9ca3af" className="mb-4" />
            <Text className="text-gray-500 text-center px-4">Nenhum aluno encontrado.</Text>
          </Card>
        ) : (
          filteredAlunos.map((aluno) => (
            <AlunoCard 
              key={aluno.aluno_id}
              id={aluno.aluno_id}
              nome={aluno.profiles.nome}
              email={aluno.profiles.email}
              status={aluno.status}
            />
          ))
        )}
      </ScrollView>

      {/* Botão Flutuante de Adicionar */}
      <View className="absolute bottom-8 right-6">
        <Pressable 
          className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-300"
          onPress={() => {}}
        >
          <Plus size={32} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
