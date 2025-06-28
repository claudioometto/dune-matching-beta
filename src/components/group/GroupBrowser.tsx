import React, { useState, useEffect } from 'react';
import { Search, Users, Target, Crown, UserPlus, Filter, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { playerService } from '../../services/playerService';
import { useAuth } from '../auth/AuthProvider';

interface GroupAd {
  id: string;
  title: string;
  description: string;
  resource_target: string;
  roles_needed: string[];
  max_members: number;
  status: string;
  created_at: string;
  host_nickname: string;
  host_name: string;
  current_members: number;
}

export const GroupBrowser: React.FC = () => {
  const [groups, setGroups] = useState<GroupAd[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState<string>('');
  const [availableSlotsFilter, setAvailableSlotsFilter] = useState<string>('');
  const [playerData, setPlayerData] = useState<any>(null);
  const [userCanApply, setUserCanApply] = useState(true);
  const [blockReason, setBlockReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Carregar dados do jogador atual e verificar se pode se candidatar
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!user?.id) return;

      try {
        // Carregar dados do jogador
        const { data } = await playerService.getPlayerByUserId(user.id);
        setPlayerData(data);

        // Verificar se pode se candidatar a grupos
        const { canCreate, reason } = await groupService.canUserCreateGroup(user.id);
        setUserCanApply(canCreate);
        if (!canCreate && reason) {
          setBlockReason(reason);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do jogador:', error);
      }
    };

    loadPlayerData();
  }, [user]);

  // Carregar grupos ativos
  const loadGroups = async () => {
    try {
      setError(null);
      console.log('🔄 Carregando grupos ativos...');
      
      const { data, error: serviceError } = await groupService.getActiveGroups();
      
      if (serviceError) {
        console.error('❌ Erro ao carregar grupos:', serviceError);
        setError(`Erro ao carregar grupos: ${serviceError.message}`);
        return;
      }

      console.log('✅ Grupos carregados:', data?.length || 0);
      
      // Filtrar grupos que não são do usuário atual
      const otherGroups = (data || []).filter(group => group.host_id !== user?.id);
      setGroups(otherGroups);
      setFilteredGroups(otherGroups);
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar grupos:', error);
      setError('Erro inesperado ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = groups;

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(group => 
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.host_nickname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por objetivo
    if (objectiveFilter) {
      filtered = filtered.filter(group => group.resource_target === objectiveFilter);
    }

    // Filtro por vagas disponíveis
    if (availableSlotsFilter) {
      const minSlots = parseInt(availableSlotsFilter);
      filtered = filtered.filter(group => {
        const availableSlots = group.max_members - group.current_members;
        return availableSlots >= minSlots;
      });
    }

    setFilteredGroups(filtered);
  }, [groups, searchTerm, objectiveFilter, availableSlotsFilter]);

  const handleApplyToGroup = async (groupId: string, groupTitle: string) => {
    if (!user?.id) {
      alert('❌ Você precisa estar logado para se candidatar');
      return;
    }

    if (!playerData) {
      alert('❌ Complete seu cadastro antes de se candidatar a grupos');
      return;
    }

    if (!userCanApply) {
      alert(`❌ ${blockReason}`);
      return;
    }

    try {
      console.log('📝 Candidatando-se ao grupo:', groupId);
      
      const { error } = await groupService.createInvitation(groupId, user.id);
      
      if (error) {
        console.error('❌ Erro ao se candidatar:', error);
        
        if (error.message?.includes('duplicate key')) {
          alert('ℹ️ Você já se candidatou a este grupo!');
        } else {
          alert(`❌ Erro ao se candidatar: ${error.message}`);
        }
        return;
      }

      console.log('✅ Candidatura enviada com sucesso');
      alert(`✅ Candidatura enviada para "${groupTitle}"! O líder do grupo será notificado.`);
      
      // Atualizar status do usuário
      setUserCanApply(false);
      setBlockReason('Você se candidatou a um grupo e deve aguardar a resposta do líder.');
      
    } catch (error) {
      console.error('💥 Erro inesperado ao se candidatar:', error);
      alert('❌ Erro inesperado. Tente novamente.');
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

  const getAvailableSlots = (group: GroupAd) => {
    return group.max_members - group.current_members;
  };

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const sixHoursLater = new Date(created.getTime() + 6 * 60 * 60 * 1000);
    const remaining = sixHoursLater.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expirado';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Explorando expedições ativas...</p>
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
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            EXPLORAR GRUPOS
          </h1>
          <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
            Descubra expedições ativas no Deep Desert e candidate-se para juntar-se aos guerreiros.
          </p>
        </div>

        {/* Status do usuário */}
        {!userCanApply && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-yellow-900/30 rounded-lg p-6 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-yellow-200 font-bold mb-2">Candidatura Restrita</h3>
                  <p className="text-yellow-300">{blockReason}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
            
            <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-6 h-6 text-orange-400" />
                <h2 className="text-xl font-bold text-orange-200">Filtros de Busca</h2>
                <button
                  onClick={loadGroups}
                  disabled={loading}
                  className="ml-auto bg-orange-600/80 hover:bg-orange-500/80 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Busca por texto */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2">
                    Buscar por nome
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-orange-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-black/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all"
                      placeholder="Nome do grupo ou líder"
                    />
                  </div>
                </div>

                {/* Filtro por objetivo */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2">
                    Objetivo
                  </label>
                  <select
                    value={objectiveFilter}
                    onChange={(e) => setObjectiveFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-orange-500/30 rounded-lg text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all"
                  >
                    <option value="">Todos os objetivos</option>
                    <option value="Especiaria">Coleta de Especiaria</option>
                    <option value="PvP">Combate PvP</option>
                  </select>
                </div>

                {/* Filtro por vagas */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2">
                    Vagas disponíveis
                  </label>
                  <select
                    value={availableSlotsFilter}
                    onChange={(e) => setAvailableSlotsFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-orange-500/30 rounded-lg text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all"
                  >
                    <option value="">Qualquer quantidade</option>
                    <option value="1">1+ vagas</option>
                    <option value="2">2+ vagas</option>
                    <option value="3">3+ vagas</option>
                  </select>
                </div>

                {/* Status do jogador */}
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2">
                    Seu status
                  </label>
                  <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    playerData 
                      ? userCanApply
                        ? 'bg-green-900/30 text-green-200 border border-green-500/30'
                        : 'bg-yellow-900/30 text-yellow-200 border border-yellow-500/30'
                      : 'bg-red-900/30 text-red-200 border border-red-500/30'
                  }`}>
                    {playerData 
                      ? userCanApply 
                        ? '✅ Pode se candidatar' 
                        : '⏳ Aguardando resposta'
                      : '❌ Não cadastrado'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-red-900/30 rounded-lg p-6 border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-red-200 font-bold mb-2">Erro ao Carregar Grupos</h3>
                  <p className="text-red-300 mb-4">{error}</p>
                  <button
                    onClick={loadGroups}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de grupos */}
        <div className="max-w-6xl mx-auto">
          {!error && filteredGroups.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 shadow-lg border border-orange-500/30">
                <h2 className="text-xl font-bold text-orange-200 flex items-center gap-3 tracking-wide">
                  <Users className="w-6 h-6 text-orange-400" />
                  EXPEDIÇÕES DISPONÍVEIS ({filteredGroups.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredGroups.map(group => {
                  const availableSlots = getAvailableSlots(group);
                  const timeRemaining = getTimeRemaining(group.created_at);
                  
                  return (
                    <div key={group.id} className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
                      
                      <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
                        {/* Header do grupo */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-orange-200 mb-2">{group.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="w-4 h-4 text-amber-400" />
                              <span className="text-orange-300 text-sm">Líder: {group.host_nickname}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-amber-400" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                group.resource_target === 'PvP' 
                                  ? 'bg-red-900/50 text-red-200' 
                                  : 'bg-green-900/50 text-green-200'
                              }`}>
                                {group.resource_target === 'PvP' ? 'PvP' : 'Coleta'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-300 text-xs font-medium">
                                {timeRemaining}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Funções do grupo */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-orange-200 mb-2">Funções necessárias:</h4>
                          <div className="flex flex-wrap gap-2">
                            {group.roles_needed.map((role, index) => (
                              <span 
                                key={index}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  index === 0 
                                    ? 'bg-amber-900/50 text-amber-200 border border-amber-500/30' 
                                    : 'bg-gray-900/50 text-gray-300 border border-gray-500/30'
                                }`}
                              >
                                {role} {index === 0 && '(Líder)'}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-300">{group.max_members}</div>
                            <div className="text-xs text-orange-200">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-300">{group.current_members}</div>
                            <div className="text-xs text-blue-200">Ocupados</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-300">{availableSlots}</div>
                            <div className="text-xs text-green-200">Disponíveis</div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-orange-300">
                            Criado: {formatDate(group.created_at)}
                          </div>
                          
                          <button
                            onClick={() => handleApplyToGroup(group.id, group.title)}
                            disabled={!playerData || !userCanApply || availableSlots === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                              !playerData 
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : !userCanApply
                                ? 'bg-yellow-600/50 text-yellow-300 cursor-not-allowed'
                                : availableSlots === 0
                                ? 'bg-red-600/50 text-red-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                            }`}
                          >
                            <UserPlus className="w-4 h-4" />
                            {!playerData 
                              ? 'Complete o cadastro'
                              : !userCanApply
                              ? 'Já candidatado'
                              : availableSlots === 0
                              ? 'Grupo lotado'
                              : 'Candidatar-se'
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !error ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-400/50">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-4 tracking-wide">
                  NENHUMA EXPEDIÇÃO ENCONTRADA
                </h3>
                <p className="text-orange-100/80 mb-8 text-lg">
                  {groups.length === 0 
                    ? 'Não há grupos ativos no momento. Seja o primeiro a criar uma expedição!'
                    : 'Nenhum grupo corresponde aos filtros aplicados. Tente ajustar os critérios de busca.'
                  }
                </p>
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30 mb-6">
                  <p className="text-sm text-orange-200 tracking-wide">
                    🏜️ <strong>Dica:</strong> {groups.length === 0 
                      ? 'Vá para "Criar Anúncio" para formar sua própria aliança no Deep Desert.'
                      : 'Remova alguns filtros ou tente termos de busca diferentes.'
                    }
                  </p>
                </div>

                {/* Informações sobre o sistema */}
                <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-500/30">
                  <h4 className="font-bold text-blue-200 mb-3 flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Sistema de Expedições
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-200">
                    <div>
                      <p>🕐 Grupos expiram em 6 horas</p>
                      <p>🚫 Grupos lotados não aparecem</p>
                    </div>
                    <div>
                      <p>👥 Máximo 4 membros por grupo</p>
                      <p>🔄 Lista atualizada automaticamente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};