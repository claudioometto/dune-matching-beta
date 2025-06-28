import React, { useState, useEffect } from 'react';
import { Users, Target, Crown, UserCheck, AlertTriangle } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useAuth } from '../auth/AuthProvider';
import type { ActiveGroup } from '../../types/notification';

export const MyGroup: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmClose, setShowConfirmClose] = useState<string | null>(null);
  const { user } = useAuth();

  // Carregar grupos do usuário
  useEffect(() => {
    const loadUserGroups = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await groupService.getUserGroups(user.id);
        
        if (error) {
          console.error('Erro ao carregar grupos:', error);
          return;
        }

        setGroups(data || []);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserGroups();
  }, [user]);

  const handleCloseGroup = async (groupId: string) => {
    try {
      const { error } = await groupService.updateGroupStatus(groupId, 'closed');
      
      if (error) {
        console.error('Erro ao encerrar grupo:', error);
        alert('❌ Erro ao encerrar grupo: ' + error.message);
        return;
      }

      // Atualizar lista local
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, status: 'closed' }
            : group
        )
      );
      
      setShowConfirmClose(null);
      alert('✅ Grupo encerrado com sucesso!');
    } catch (error) {
      console.error('Erro ao encerrar grupo:', error);
      alert('❌ Erro inesperado ao encerrar grupo.');
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Carregando seus grupos...</p>
        </div>
      </div>
    );
  }

  const activeGroups = groups.filter(group => group.status === 'open');

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            MINHAS ALIANÇAS
          </h1>
          <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
            Gerencie suas expedições ativas e recrute guerreiros para suas missões no Deep Desert.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeGroups.length > 0 ? (
            <div className="space-y-8">
              {activeGroups.map(group => (
                <div key={group.id} className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
                  
                  <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-500/40">
                    {/* Group Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Crown className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-orange-200">{group.title}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-400" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          group.resource_target === 'PvP' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
                        }`}>
                          {group.resource_target}
                        </span>
                      </div>
                    </div>

                    {/* Group Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-500/30">
                        <div className="text-2xl font-bold text-amber-300">4</div>
                        <div className="text-sm text-amber-200">Slots Totais</div>
                      </div>
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                        <div className="text-2xl font-bold text-blue-300">0</div>
                        <div className="text-sm text-blue-200">Interessados</div>
                      </div>
                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                        <div className="text-2xl font-bold text-green-300">4</div>
                        <div className="text-sm text-green-200">Vagas Disponíveis</div>
                      </div>
                    </div>

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {group.roles_needed.map((role: string, index: number) => (
                        <div key={index} className={`p-4 rounded-lg border-2 ${
                          index === 0 ? 'bg-amber-900/30 border-amber-500/50' : 'bg-gray-900/30 border-gray-500/30'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-orange-200">Slot {index + 1}</span>
                            {index === 0 && <Crown className="w-4 h-4 text-amber-400" />}
                          </div>
                          <div className="text-sm text-orange-300 mb-1">Função: {role}</div>
                          <div className="text-sm font-medium">
                            {index === 0 ? (
                              <span className="text-amber-300">Você (Líder)</span>
                            ) : (
                              <span className="text-gray-400">Vago</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Group Actions */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-orange-300">
                        Criado em: {formatDate(group.created_at)}
                      </div>
                      
                      <button
                        onClick={() => setShowConfirmClose(group.id)}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Encerrar Aliança
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-400/50">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-4 tracking-wide">
                  NENHUMA ALIANÇA ATIVA
                </h3>
                <p className="text-orange-100/80 mb-8 text-lg">
                  Você ainda não criou nenhuma expedição. Forme uma aliança para recrutar guerreiros!
                </p>
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30">
                  <p className="text-sm text-orange-200 tracking-wide">
                    ⚔️ <strong>Dica:</strong> Vá para a aba "Criar Anúncio" para formar sua primeira aliança no Deep Desert.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmClose && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative max-w-md mx-4">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900 via-red-900/20 to-orange-900/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-red-500/30">
                <div className="text-center mb-6">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-200 mb-2">Encerrar Aliança</h3>
                  <p className="text-red-300/80">
                    Tem certeza que deseja encerrar esta expedição? Esta ação não pode ser desfeita.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmClose(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleCloseGroup(showConfirmClose)}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Encerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};