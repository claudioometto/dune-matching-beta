import React, { useState, useEffect } from 'react';
import { Shield, Users, Star, Bell, Clock, Edit, Plus, Search, Trophy } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { playerService } from '../../services/playerService';
import { groupService } from '../../services/groupService';
import { ratingService } from '../../services/ratingService';
import { DashboardData, DesertQuote } from '../../types/dashboard';
import { PlayerStatusCard } from './PlayerStatusCard';
import { CurrentGroupCard } from './CurrentGroupCard';
import { RecentNotificationsCard } from './RecentNotificationsCard';
import { PendingRatingsCard } from './PendingRatingsCard';
import { ReputationCard } from './ReputationCard';
import { DesertQuoteCard } from './DesertQuoteCard';

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Frases inspiradas em Dune
  const desertQuotes: DesertQuote[] = [
    { text: "A areia cobre todos os rastros... mas não os seus erros.", author: "Provérbio Fremen" },
    { text: "Aquele que controla a especiaria, controla o universo.", author: "Barão Harkonnen" },
    { text: "O medo é o assassino da mente.", author: "Litania do Medo" },
    { text: "Caminhe sem ritmo e não atrairá o verme.", author: "Stilgar" },
    { text: "O deserto não perdoa os fracos.", author: "Liet Kynes" },
    { text: "A água é vida no Deep Desert.", author: "Ditado Fremen" },
    { text: "Apenas os fortes sobrevivem às tempestades de areia.", author: "Gurney Halleck" },
    { text: "A especiaria deve fluir.", author: "Imperador Shaddam IV" }
  ];

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      console.log('🔄 Carregando dados do dashboard...');

      // 1. Buscar dados do jogador
      const { data: playerData } = await playerService.getPlayerByUserId(user.id);
      
      // 2. Buscar grupo atual (como líder ou membro)
      let currentGroup = null;
      
      // Verificar se é líder de algum grupo ativo
      const { data: ownedGroups } = await groupService.getUserGroups(user.id);
      const activeOwnedGroup = ownedGroups?.find(group => group.status === 'open');
      
      if (activeOwnedGroup) {
        // Contar membros
        const { data: members } = await groupService.getGroupMembers(activeOwnedGroup.id);
        const acceptedMembers = members?.filter(m => m.status === 'accepted') || [];
        
        // Calcular tempo restante (6 horas)
        const createdAt = new Date(activeOwnedGroup.created_at);
        const sixHoursLater = new Date(createdAt.getTime() + 6 * 60 * 60 * 1000);
        const timeRemaining = Math.max(0, sixHoursLater.getTime() - Date.now());
        
        currentGroup = {
          id: activeOwnedGroup.id,
          name: activeOwnedGroup.title,
          objective: activeOwnedGroup.resource_target === 'PvP' ? 'PvP' : 'Coleta',
          role: 'leader' as const,
          timeRemaining,
          memberCount: 1 + acceptedMembers.length,
          maxMembers: activeOwnedGroup.max_members
        };
      } else {
        // Verificar se é membro de algum grupo ativo
        const { data: memberGroups } = await groupService.getGroupsAsMember(user.id);
        const activeMemberGroup = memberGroups?.find(match => 
          match.status === 'accepted' && match.group_ads?.status === 'open'
        );
        
        if (activeMemberGroup) {
          const group = activeMemberGroup.group_ads;
          const { data: members } = await groupService.getGroupMembers(group.id);
          const acceptedMembers = members?.filter(m => m.status === 'accepted') || [];
          
          const createdAt = new Date(group.created_at);
          const sixHoursLater = new Date(createdAt.getTime() + 6 * 60 * 60 * 1000);
          const timeRemaining = Math.max(0, sixHoursLater.getTime() - Date.now());
          
          currentGroup = {
            id: group.id,
            name: group.title,
            objective: group.resource_target === 'PvP' ? 'PvP' : 'Coleta',
            role: 'member' as const,
            timeRemaining,
            memberCount: 1 + acceptedMembers.length,
            maxMembers: group.max_members
          };
        }
      }

      // 3. Buscar notificações recentes (últimos 5 convites)
      const { data: invitations } = await groupService.getPlayerInvitations(user.id);
      const recentNotifications = (invitations || []).slice(0, 5).map(invitation => ({
        id: invitation.id,
        type: 'invitation' as const,
        message: `Convite para "${invitation.group_ads?.title || 'Grupo'}"`,
        createdAt: new Date(invitation.created_at)
      }));

      // 4. Buscar avaliações pendentes
      const { data: completedGroups } = await ratingService.getCompletedGroupsForRating(user.id);
      const pendingRatings = (completedGroups || [])
        .filter(group => group.canRate)
        .map(group => ({
          groupId: group.id,
          groupName: group.title,
          playersToRate: group.members.filter(member => member.user_id !== user.id),
          timeRemaining: group.timeRemaining
        }));

      // 5. Buscar reputação
      const { data: reputationData } = await ratingService.getPlayerReputation(user.id);
      const { data: recentRatings } = await ratingService.getRecentRatings(user.id, 3);
      
      const reputation = {
        averageRating: reputationData?.average_rating || 0,
        totalRatings: reputationData?.total_ratings || 0,
        recentComments: (recentRatings || []).map(rating => ({
          comment: rating.comment,
          stars: rating.stars,
          fromNickname: rating.from_player?.nickname || 'Anônimo'
        }))
      };

      // Montar dados do dashboard
      const dashboardData: DashboardData = {
        player: playerData ? {
          nickname: playerData.nickname,
          gameId: playerData.steam_id || '',
          level: playerData.game_level,
          hasDeepDesertBase: playerData.desert_base,
          baseSector: playerData.base_sector || undefined,
          interests: playerData.interests
        } : null,
        currentGroup,
        recentNotifications,
        pendingRatings,
        reputation
      };

      setDashboardData(dashboardData);
      console.log('✅ Dados do dashboard carregados:', dashboardData);

    } catch (error) {
      console.error('💥 Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Carregando painel do guerreiro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="text-red-400 text-xl mb-4">❌ {error}</div>
          <button
            onClick={loadDashboardData}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Selecionar frase aleatória
  const randomQuote = desertQuotes[Math.floor(Math.random() * desertQuotes.length)];

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            PAINEL DO GUERREIRO
          </h1>
          
          {dashboardData?.player && (
            <p className="text-2xl text-orange-100/90 font-medium tracking-wide drop-shadow-lg">
              Bem-vindo de volta, <span className="text-amber-300 font-bold">{dashboardData.player.nickname}</span>!
            </p>
          )}
          
          <p className="text-orange-100/80 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg mt-4">
            Central de comando para suas expedições no Deep Desert
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {dashboardData?.player ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Esquerda */}
              <div className="space-y-8">
                <PlayerStatusCard 
                  player={dashboardData.player} 
                  onEditProfile={() => {/* Será implementado */}}
                />
                <ReputationCard reputation={dashboardData.reputation} />
                <DesertQuoteCard quote={randomQuote} />
              </div>

              {/* Coluna Central */}
              <div className="space-y-8">
                <CurrentGroupCard 
                  currentGroup={dashboardData.currentGroup}
                  onCreateGroup={() => {/* Será implementado */}}
                  onExploreGroups={() => {/* Será implementado */}}
                  onGoToGroup={() => {/* Será implementado */}}
                />
                <PendingRatingsCard 
                  pendingRatings={dashboardData.pendingRatings}
                  onRateNow={() => {/* Será implementado */}}
                />
              </div>

              {/* Coluna Direita */}
              <div className="space-y-8">
                <RecentNotificationsCard 
                  notifications={dashboardData.recentNotifications}
                  onViewAll={() => {/* Será implementado */}}
                />
              </div>
            </div>
          ) : (
            /* Estado sem cadastro */
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-400/50">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-4 tracking-wide">
                  REGISTRO NECESSÁRIO
                </h3>
                <p className="text-orange-100/80 mb-8 text-lg">
                  Complete seu registro de guerreiro para acessar todas as funcionalidades do Deep Desert.
                </p>
                <button
                  onClick={() => {/* Navegar para cadastro */}}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-8 py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-orange-400/50 flex items-center gap-3 mx-auto"
                >
                  <Edit className="w-6 h-6" />
                  Completar Registro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};