import React, { useState, useEffect } from 'react';
import { User, Star, MessageCircle, Shield } from 'lucide-react';
import { playerService } from '../../services/playerService';
import { ratingService } from '../../services/ratingService';
import { useAuth } from '../auth/AuthProvider';
import type { PlayerProfileData } from '../../types/ratings';

export const PlayerProfile: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        // Buscar dados do jogador
        const { data: playerData } = await playerService.getPlayerByUserId(user.id);
        
        if (!playerData) {
          setLoading(false);
          return;
        }

        // Buscar reputação
        const { data: reputationData } = await ratingService.getPlayerReputation(user.id);
        
        // Buscar comentários recentes
        const { data: recentRatings } = await ratingService.getRecentRatings(user.id, 5);

        const playerProfile: PlayerProfileData = {
          nickname: playerData.nickname,
          gameId: playerData.steam_id || '',
          averageRating: reputationData?.average_rating || 0,
          totalRatings: reputationData?.total_ratings || 0,
          recentComments: (recentRatings || []).map(rating => ({
            comment: rating.comment,
            stars: rating.stars,
            fromNickname: rating.from_player?.nickname || 'Anônimo',
            createdAt: new Date(rating.created_at)
          }))
        };

        setProfile(playerProfile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {/* Estrelas cheias */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ))}
        
        {/* Meia estrela */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        )}
        
        {/* Estrelas vazias */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
        
        <span className="ml-2 text-sm text-orange-200">
          {rating.toFixed(1)} ({profile?.totalRatings} avaliações)
        </span>
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-400/50">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-4 tracking-wide">
                  PERFIL NÃO ENCONTRADO
                </h3>
                <p className="text-orange-100/80 mb-8 text-lg">
                  Complete seu cadastro primeiro para visualizar seu perfil público.
                </p>
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30">
                  <p className="text-sm text-orange-200 tracking-wide">
                    👤 <strong>Dica:</strong> Vá para a aba "Cadastro" para criar seu perfil de guerreiro.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            PERFIL DO GUERREIRO
          </h1>
          <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
            Reputação e conquistas na comunidade do Deep Desert.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
            
            <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-500/40">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center border-2 border-orange-400/50">
                  <span className="text-white text-2xl font-bold">
                    {profile.nickname.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-orange-200 mb-2">{profile.nickname}</h2>
                  <p className="text-orange-300/80 mb-3">ID: {profile.gameId || 'Não informado'}</p>
                  
                  {profile.totalRatings > 0 ? (
                    <div>
                      {renderStars(profile.averageRating)}
                    </div>
                  ) : (
                    <p className="text-orange-300/60">Ainda não possui avaliações</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              {profile.totalRatings > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-amber-900/30 p-4 rounded-lg text-center border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-300">
                      {profile.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-amber-200">Média Geral</div>
                  </div>
                  
                  <div className="bg-blue-900/30 p-4 rounded-lg text-center border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-300">
                      {profile.totalRatings}
                    </div>
                    <div className="text-sm text-blue-200">Total de Avaliações</div>
                  </div>
                  
                  <div className="bg-green-900/30 p-4 rounded-lg text-center border border-green-500/30">
                    <div className="text-2xl font-bold text-green-300">
                      {profile.totalRatings > 0 ? Math.round((profile.recentComments.filter(c => c.stars >= 4).length / profile.totalRatings) * 100) : 0}%
                    </div>
                    <div className="text-sm text-green-200">Avaliações Positivas</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Comments */}
          {profile.recentComments.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-500/40">
                <h3 className="text-2xl font-bold text-orange-200 mb-6 flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-orange-400" />
                  Comentários Recentes
                </h3>
                
                <div className="space-y-4">
                  {profile.recentComments.map((comment, index) => (
                    <div key={index} className="bg-gray-900/30 p-4 rounded-lg border border-gray-500/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-orange-200">{comment.fromNickname}</span>
                          <div className="flex">
                            {Array.from({ length: comment.stars }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-xs text-orange-300/70">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                      
                      <p className="text-orange-100/90 italic">"{comment.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Ratings State */}
          {profile.totalRatings === 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
                <Star className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-orange-200 mb-2">
                  Ainda não há avaliações
                </h3>
                <p className="text-orange-100/80">
                  Participe de expedições para construir sua reputação no Deep Desert.
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
            <p className="text-sm text-blue-200">
              ℹ️ <strong>Sobre as avaliações:</strong> As avaliações são feitas pelos membros do grupo após o encerramento 
              de uma expedição. Elas refletem a experiência da comunidade com este guerreiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};