import React, { useState, useEffect } from 'react';
import { Users, Target, Crown, UserCheck, AlertTriangle, UserX, Clock, Star, LogOut, Shield } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useAuth } from '../auth/AuthProvider';

interface GroupMember {
  id: string;
  status: 'invited' | 'accepted' | 'declined';
  created_at: string;
  players: {
    id: string;
    nickname: string;
    name: string;
    game_level: number;
  };
}

interface UserGroupInfo {
  isLeader: boolean;
  isActiveMember: boolean;
  groupData: any;
  membershipId?: string;
}

export const MyGroup: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<{ [groupId: string]: GroupMember[] }>({});
  const [userGroupInfo, setUserGroupInfo] = useState<UserGroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmClose, setShowConfirmClose] = useState<string | null>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const { user } = useAuth();

  // Carregar grupos do usuário e verificar participação
  useEffect(() => {
    const loadUserGroups = async () => {
      if (!user?.id) return;

      try {
        console.log('🔄 Carregando grupos do usuário:', user.id);
        
        // 1. Buscar grupos criados pelo usuário
        const { data: ownedGroups, error: ownedError } = await groupService.getUserGroups(user.id);
        
        if (ownedError) {
          console.error('❌ Erro ao carregar grupos próprios:', ownedError);
        }

        // 2. Buscar grupos onde o usuário é membro aceito
        const { data: memberGroups, error: memberError } = await groupService.getGroupsAsMember(user.id);
        
        if (memberError) {
          console.error('❌ Erro ao carregar grupos como membro:', memberError);
        }

        // 3. Processar dados
        const ownedActiveGroups = (ownedGroups || []).filter(group => group.status === 'open');
        const memberActiveGroups = (memberGroups || []).filter(match => 
          match.status === 'accepted' && match.group_ads?.status === 'open'
        );

        console.log('✅ Grupos próprios ativos:', ownedActiveGroups.length);
        console.log('✅ Grupos como membro:', memberActiveGroups.length);

        // 4. Determinar status do usuário
        if (ownedActiveGroups.length > 0) {
          // Usuário é líder de um grupo
          setUserGroupInfo({
            isLeader: true,
            isActiveMember: false,
            groupData: ownedActiveGroups[0]
          });
          setGroups(ownedActiveGroups);
          
          // Carregar membros para grupos próprios
          for (const group of ownedActiveGroups) {
            const { data: members, error: membersError } = await groupService.getGroupMembers(group.id);
            if (!membersError) {
              setGroupMembers(prev => ({
                ...prev,
                [group.id]: members || []
              }));
            }
          }
        } else if (memberActiveGroups.length > 0) {
          // Usuário é membro de um grupo
          const memberGroup = memberActiveGroups[0];
          setUserGroupInfo({
            isLeader: false,
            isActiveMember: true,
            groupData: memberGroup.group_ads,
            membershipId: memberGroup.id
          });
          setGroups([memberGroup.group_ads]);
          
          // Carregar membros do grupo
          const { data: members, error: membersError } = await groupService.getGroupMembers(memberGroup.group_ads.id);
          if (!membersError) {
            setGroupMembers(prev => ({
              ...prev,
              [memberGroup.group_ads.id]: members || []
            }));
          }
        } else {
          // Usuário não tem grupos ativos
          setUserGroupInfo(null);
          setGroups([]);
        }

      } catch (error) {
        console.error('💥 Erro inesperado ao carregar grupos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserGroups();
  }, [user]);

  const handleAcceptMember = async (groupId: string, matchId: string, memberNickname: string) => {
    setProcessingAction(matchId);
    
    try {
      console.log('✅ Aceitando membro:', { groupId, matchId, memberNickname });
      
      const { error } = await groupService.acceptInvitation(matchId);
      
      if (error) {
        console.error('❌ Erro ao aceitar membro:', error);
        alert(`❌ Erro ao aceitar ${memberNickname}: ${error.message}`);
        return;
      }

      // Atualizar lista local
      setGroupMembers(prev => ({
        ...prev,
        [groupId]: prev[groupId]?.map(member => 
          member.id === matchId 
            ? { ...member, status: 'accepted' as const }
            : member
        ) || []
      }));
      
      console.log('✅ Membro aceito com sucesso');
      alert(`✅ ${memberNickname} foi aceito no grupo!`);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao aceitar membro:', error);
      alert('❌ Erro inesperado. Tente novamente.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectMember = async (groupId: string, matchId: string, memberNickname: string) => {
    setProcessingAction(matchId);
    
    try {
      console.log('❌ Rejeitando membro:', { groupId, matchId, memberNickname });
      
      const { error } = await groupService.rejectInvitation(matchId);
      
      if (error) {
        console.error('❌ Erro ao rejeitar membro:', error);
        alert(`❌ Erro ao rejeitar ${memberNickname}: ${error.message}`);
        return;
      }

      // Atualizar lista local
      setGroupMembers(prev => ({
        ...prev,
        [groupId]: prev[groupId]?.map(member => 
          member.id === matchId 
            ? { ...member, status: 'declined' as const }
            : member
        ) || []
      }));
      
      console.log('✅ Membro rejeitado com sucesso');
      
    } catch (error) {
      console.error('💥 Erro inesperado ao rejeitar membro:', error);
      alert('❌ Erro inesperado. Tente novamente.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCloseGroup = async (groupId: string) => {
    try {
      console.log('🔄 Encerrando grupo:', groupId);
      
      const { error } = await groupService.updateGroupStatus(groupId, 'closed');
      
      if (error) {
        console.error('❌ Erro ao encerrar grupo:', error);
        alert('❌ Erro ao encerrar grupo: ' + error.message);
        return;
      }

      // Atualizar estado local
      setGroups([]);
      setUserGroupInfo(null);
      setShowConfirmClose(null);
      
      console.log('✅ Grupo encerrado com sucesso');
      alert('✅ Grupo encerrado com sucesso! Agora você pode avaliar os membros na aba "Avaliar Jogadores".');
      
    } catch (error) {
      console.error('💥 Erro inesperado ao encerrar grupo:', error);
      alert('❌ Erro inesperado ao encerrar grupo.');
    }
  };

  const handleLeaveGroup = async (membershipId: string) => {
    try {
      const { error } = await groupService.leaveGroup(membershipId);
      
      if (error) {
        console.error('❌ Erro ao deixar grupo:', error);
        alert('❌ Erro ao deixar grupo: ' + error.message);
        return;
      }

      // Atualizar estado local
      setGroups([]);
      setUserGroupInfo(null);
      setShowConfirmLeave(null);
      alert('✅ Você deixou o grupo com sucesso! Uma nova vaga foi liberada.');
    } catch (error) {
      console.error('💥 Erro inesperado ao deixar grupo:', error);
      alert('❌ Erro inesperado ao deixar grupo.');
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

  const getGroupStats = (group: any) => {
    const members = groupMembers[group.id] || [];
    const interestedCount = members.filter(m => m.status === 'invited').length;
    const acceptedCount = members.filter(m => m.status === 'accepted').length;
    const totalOccupied = 1 + acceptedCount; // 1 (líder) + aceitos
    const availableSlots = group.max_members - totalOccupied;
    
    return {
      interestedCount,
      acceptedCount,
      totalOccupied,
      availableSlots: Math.max(0, availableSlots)
    };
  };

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const sixHoursLater = new Date(created.getTime() + 6 * 60 * 60 * 1000);
    const remaining = sixHoursLater.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expirado';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m restantes`;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Carregando suas alianças...</p>
        </div>
      </div>
    );
  }

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
            {userGroupInfo?.isLeader 
              ? 'Gerencie sua expedição ativa e recrute guerreiros para suas missões no Deep Desert.'
              : userGroupInfo?.isActiveMember
              ? 'Você faz parte de uma expedição ativa no Deep Desert. Coordene com seu líder.'
              : 'Você não possui grupos ativos. Crie uma expedição ou candidate-se a uma existente.'
            }
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {userGroupInfo && groups.length > 0 ? (
            <div className="space-y-8">
              {groups.map(group => {
                const stats = getGroupStats(group);
                const members = groupMembers[group.id] || [];
                const interestedMembers = members.filter(m => m.status === 'invited');
                const acceptedMembers = members.filter(m => m.status === 'accepted');
                const timeRemaining = getTimeRemaining(group.created_at);
                
                return (
                  <div key={group.id} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
                    
                    <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-500/40">
                      {/* Group Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          {userGroupInfo.isLeader ? (
                            <Crown className="w-6 h-6 text-amber-400" />
                          ) : (
                            <Shield className="w-6 h-6 text-blue-400" />
                          )}
                          <h2 className="text-2xl font-bold text-orange-200">{group.title}</h2>
                          {!userGroupInfo.isLeader && (
                            <span className="px-3 py-1 bg-blue-900/50 text-blue-200 rounded-full text-sm font-medium">
                              Membro
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-amber-400" />
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              group.resource_target === 'PvP' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
                            }`}>
                              {group.resource_target}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-400" />
                            <span className="text-orange-200 text-sm font-medium">
                              {timeRemaining}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Group Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-500/30">
                          <div className="text-2xl font-bold text-amber-300">{group.max_members}</div>
                          <div className="text-sm text-amber-200">Slots Totais</div>
                        </div>
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                          <div className="text-2xl font-bold text-blue-300">{stats.interestedCount}</div>
                          <div className="text-sm text-blue-200">Interessados</div>
                        </div>
                        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
                          <div className="text-2xl font-bold text-purple-300">{stats.acceptedCount}</div>
                          <div className="text-sm text-purple-200">Aceitos</div>
                        </div>
                        <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                          <div className="text-2xl font-bold text-green-300">{stats.availableSlots}</div>
                          <div className="text-sm text-green-200">Vagas Livres</div>
                        </div>
                      </div>

                      {/* Roles Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {group.roles_needed.map((role: string, index: number) => {
                          const isLeaderSlot = index === 0;
                          const assignedMember = acceptedMembers[index - 1]; // -1 porque o líder não está na lista
                          
                          return (
                            <div key={index} className={`p-4 rounded-lg border-2 ${
                              isLeaderSlot 
                                ? 'bg-amber-900/30 border-amber-500/50' 
                                : assignedMember
                                ? 'bg-green-900/30 border-green-500/50'
                                : 'bg-gray-900/30 border-gray-500/30'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-orange-200">Slot {index + 1}</span>
                                {isLeaderSlot && <Crown className="w-4 h-4 text-amber-400" />}
                                {assignedMember && <UserCheck className="w-4 h-4 text-green-400" />}
                              </div>
                              <div className="text-sm text-orange-300 mb-1">Função: {role}</div>
                              <div className="text-sm font-medium">
                                {isLeaderSlot ? (
                                  <span className="text-amber-300">
                                    {userGroupInfo.isLeader ? 'Você (Líder)' : 'Líder do Grupo'}
                                  </span>
                                ) : assignedMember ? (
                                  <span className="text-green-300">{assignedMember.players.nickname}</span>
                                ) : (
                                  <span className="text-gray-400">Vago</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Interested Members Section - APENAS PARA LÍDERES */}
                      {userGroupInfo.isLeader && interestedMembers.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-orange-200 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-400" />
                            Candidatos Aguardando Aprovação ({interestedMembers.length})
                          </h3>
                          
                          <div className="space-y-3">
                            {interestedMembers.map(member => (
                              <div key={member.id} className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {member.players.nickname.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-blue-200">{member.players.nickname}</div>
                                      <div className="text-sm text-blue-300/80">
                                        Nível {member.players.game_level} • Candidatou-se em {formatDate(member.created_at)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAcceptMember(group.id, member.id, member.players.nickname)}
                                      disabled={processingAction === member.id || stats.availableSlots === 0}
                                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                      {processingAction === member.id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      ) : (
                                        <UserCheck className="w-4 h-4" />
                                      )}
                                      {stats.availableSlots === 0 ? 'Grupo Lotado' : 'Aceitar'}
                                    </button>
                                    
                                    <button
                                      onClick={() => handleRejectMember(group.id, member.id, member.players.nickname)}
                                      disabled={processingAction === member.id}
                                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                      {processingAction === member.id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      ) : (
                                        <UserX className="w-4 h-4" />
                                      )}
                                      Rejeitar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Accepted Members Section */}
                      {acceptedMembers.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-orange-200 mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-orange-400" />
                            Membros Confirmados ({acceptedMembers.length})
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {acceptedMembers.map(member => (
                              <div key={member.id} className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                      {member.players.nickname.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-green-200">{member.players.nickname}</div>
                                    <div className="text-sm text-green-300/80">
                                      Nível {member.players.game_level} • Confirmado
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No candidates message - APENAS PARA LÍDERES */}
                      {userGroupInfo.isLeader && interestedMembers.length === 0 && acceptedMembers.length === 0 && (
                        <div className="bg-gray-900/30 p-6 rounded-lg border border-gray-500/30 mb-6 text-center">
                          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-300">Nenhum guerreiro se candidatou ainda</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Aguarde candidaturas ou divulgue sua expedição
                          </p>
                        </div>
                      )}

                      {/* Group Actions */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-orange-300">
                          Criado em: {formatDate(group.created_at)}
                        </div>
                        
                        <div className="flex gap-3">
                          {userGroupInfo.isLeader ? (
                            <button
                              onClick={() => setShowConfirmClose(group.id)}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              <AlertTriangle className="w-5 h-5" />
                              Encerrar Aliança
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowConfirmLeave(userGroupInfo.membershipId!)}
                              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              <LogOut className="w-5 h-5" />
                              Deixar Grupo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  Você não faz parte de nenhuma expedição ativa no momento.
                </p>
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30">
                  <p className="text-sm text-orange-200 tracking-wide">
                    ⚔️ <strong>Opções:</strong> Crie uma nova aliança na aba "Criar Anúncio" ou candidate-se a uma existente em "Explorar Grupos".
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal - Close Group */}
        {showConfirmClose && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative max-w-md mx-4">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-xl opacity-50"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900 via-red-900/20 to-orange-900/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-red-500/30">
                <div className="text-center mb-6">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-200 mb-2">Encerrar Aliança</h3>
                  <p className="text-red-300/80 mb-4">
                    Tem certeza que deseja encerrar esta expedição? Esta ação não pode ser desfeita e todos os membros serão removidos.
                  </p>
                  <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
                    <p className="text-green-200 text-sm">
                      ⭐ <strong>Após encerrar:</strong> Você poderá avaliar os membros na aba "Avaliar Jogadores" por 30 minutos.
                    </p>
                  </div>
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

        {/* Confirmation Modal - Leave Group */}
        {showConfirmLeave && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative max-w-md mx-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl opacity-50"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900 via-orange-900/20 to-red-900/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-orange-500/30">
                <div className="text-center mb-6">
                  <LogOut className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-orange-200 mb-2">Deixar Grupo</h3>
                  <p className="text-orange-300/80">
                    Tem certeza que deseja deixar esta expedição? Uma nova vaga será liberada para outros guerreiros.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmLeave(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleLeaveGroup(showConfirmLeave)}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Deixar Grupo
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