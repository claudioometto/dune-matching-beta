import React, { useState, useEffect } from 'react';
import { Star, Users, Clock, Send, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { ratingService } from '../../services/ratingService';
import { groupService } from '../../services/groupService';
import { useAuth } from '../auth/AuthProvider';

interface CompletedGroup {
  id: string;
  title: string;
  resource_target: string;
  completed_at: string;
  members: Array<{
    id: string;
    nickname: string;
    user_id: string;
  }>;
  canRate: boolean;
  timeRemaining: number;
}

interface RatingData {
  [playerId: string]: {
    stars: number;
    comment: string;
    submitted: boolean;
  };
}

export const RatePlayers: React.FC = () => {
  const [completedGroups, setCompletedGroups] = useState<CompletedGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CompletedGroup | null>(null);
  const [ratings, setRatings] = useState<RatingData>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { user } = useAuth();

  // Carregar grupos encerrados que podem ser avaliados
  const loadCompletedGroups = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Carregando grupos encerrados para avaliação...');
      setLoading(true);
      
      const { data, error } = await ratingService.getCompletedGroupsForRating(user.id);
      
      if (error) {
        console.error('❌ Erro ao carregar grupos encerrados:', error);
        setDebugInfo({ error, userId: user.id });
        return;
      }

      console.log('✅ Grupos encerrados encontrados:', data?.length || 0);
      setCompletedGroups(data || []);
      setDebugInfo({ 
        groupsFound: data?.length || 0, 
        groups: data,
        userId: user.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localTime: new Date().toISOString(),
        timezoneOffset: new Date().getTimezoneOffset()
      });
      
      // Se há apenas um grupo, selecioná-lo automaticamente
      if (data && data.length === 1) {
        setSelectedGroup(data[0]);
        initializeRatings(data[0]);
      }
      
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar grupos encerrados:', error);
      setDebugInfo({ unexpectedError: error, userId: user.id });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedGroups();
  }, [user]);

  // Timer para atualizar tempo restante
  useEffect(() => {
    if (!selectedGroup || !selectedGroup.canRate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const completedAt = new Date(selectedGroup.completed_at).getTime();
      // Usar 2 horas ao invés de 30 minutos para compensar fuso horário
      const twoHoursLater = completedAt + (2 * 60 * 60 * 1000);
      const remaining = Math.max(0, twoHoursLater - now);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setSelectedGroup(prev => prev ? { ...prev, canRate: false } : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedGroup]);

  const initializeRatings = (group: CompletedGroup) => {
    const initialRatings: RatingData = {};
    
    group.members.forEach(member => {
      if (member.user_id !== user?.id) { // Não pode se autoavaliar
        initialRatings[member.user_id] = {
          stars: 0,
          comment: '',
          submitted: false
        };
      }
    });
    
    setRatings(initialRatings);
  };

  const handleGroupSelect = (group: CompletedGroup) => {
    setSelectedGroup(group);
    initializeRatings(group);
  };

  const handleStarClick = (playerId: string, stars: number) => {
    if (ratings[playerId]?.submitted) return;
    
    setRatings(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        stars
      }
    }));
  };

  const handleCommentChange = (playerId: string, comment: string) => {
    if (ratings[playerId]?.submitted) return;
    
    setRatings(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        comment: comment.slice(0, 200) // Limite de 200 caracteres
      }
    }));
  };

  const handleSubmitRating = async (playerId: string) => {
    if (!selectedGroup || !user?.id) return;
    
    const rating = ratings[playerId];
    if (!rating || rating.stars === 0) {
      alert('❌ Selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('⭐ Enviando avaliação:', { playerId, rating });
      
      const { error } = await ratingService.createRating(
        user.id,
        playerId,
        selectedGroup.id,
        rating.stars,
        rating.comment || undefined
      );
      
      if (error) {
        console.error('❌ Erro ao enviar avaliação:', error);
        alert(`❌ Erro ao enviar avaliação: ${error.message}`);
        return;
      }
      
      // Marcar como enviada
      setRatings(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          submitted: true
        }
      }));
      
      console.log('✅ Avaliação enviada com sucesso');
      alert('✅ Avaliação enviada com sucesso!');
      
    } catch (error) {
      console.error('💥 Erro inesperado ao enviar avaliação:', error);
      alert('❌ Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (playerId: string, currentRating: number) => {
    const isSubmitted = ratings[playerId]?.submitted;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(playerId, star)}
            disabled={isSubmitted}
            className={`w-8 h-8 transition-all duration-200 ${
              isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star 
              className={`w-full h-full ${
                star <= currentRating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-400'
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getCurrentUserNickname = () => {
    if (!selectedGroup || !user?.id) return '';
    const currentUser = selectedGroup.members.find(m => m.user_id === user.id);
    return currentUser?.nickname || '';
  };

  const getOtherMembers = () => {
    if (!selectedGroup || !user?.id) return [];
    return selectedGroup.members.filter(m => m.user_id !== user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Carregando avaliações...</p>
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
              <Star className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            AVALIAR GUERREIROS
          </h1>
          <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
            Avalie seus companheiros de expedição para construir a reputação da comunidade do Deep Desert.
          </p>

          {/* Botão de refresh */}
          <div className="mt-6">
            <button
              onClick={loadCompletedGroups}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-orange-600/80 hover:bg-orange-500/80 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Lista
            </button>
          </div>
        </div>

        {/* Debug Info (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
              <h3 className="text-blue-200 font-bold mb-2">🔍 Debug Info - Fuso Horário (Dev Only)</h3>
              <div className="text-xs text-blue-100 space-y-1">
                <p><strong>Timezone:</strong> {debugInfo.timezone}</p>
                <p><strong>Horário Local:</strong> {debugInfo.localTime}</p>
                <p><strong>Offset (min):</strong> {debugInfo.timezoneOffset}</p>
                <p><strong>Grupos encontrados:</strong> {debugInfo.groupsFound}</p>
                {debugInfo.error && (
                  <p className="text-red-300"><strong>Erro:</strong> {debugInfo.error.message}</p>
                )}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-300">Ver dados completos</summary>
                <pre className="text-xs text-blue-100 overflow-auto max-h-40 mt-2">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {completedGroups.length > 0 ? (
            <>
              {/* Seleção de grupo (se houver múltiplos) */}
              {completedGroups.length > 1 && (
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
                  
                  <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
                    <h2 className="text-xl font-bold text-orange-200 mb-4 flex items-center gap-3">
                      <Users className="w-6 h-6 text-orange-400" />
                      Selecione o Grupo para Avaliar
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {completedGroups.map(group => (
                        <button
                          key={group.id}
                          onClick={() => handleGroupSelect(group)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            selectedGroup?.id === group.id
                              ? 'border-orange-500 bg-orange-900/30'
                              : 'border-orange-500/30 bg-black/30 hover:border-orange-400'
                          }`}
                        >
                          <h3 className="font-bold text-orange-200 mb-2">{group.title}</h3>
                          <div className="text-sm text-orange-300">
                            <p>Objetivo: {group.resource_target}</p>
                            <p>Membros: {group.members.length}</p>
                            <p className={group.canRate ? 'text-green-300' : 'text-red-300'}>
                              {group.canRate ? '✅ Pode avaliar' : '❌ Tempo expirado'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Avaliações do grupo selecionado */}
              {selectedGroup && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
                  
                  <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-500/40">
                    {/* Header do grupo */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-orange-200 mb-2">{selectedGroup.title}</h2>
                      <p className="text-orange-300 mb-4">
                        Objetivo: {selectedGroup.resource_target} • Você: {getCurrentUserNickname()}
                      </p>
                      
                      {selectedGroup.canRate ? (
                        <div className="flex items-center justify-center gap-2 bg-green-900/30 px-6 py-3 rounded-full border border-green-500/50">
                          <Clock className="w-5 h-5 text-green-400" />
                          <span className="text-green-200 font-medium">
                            Tempo restante: {formatTimeRemaining(timeRemaining)} (janela estendida para fuso horário)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 bg-red-900/30 px-6 py-3 rounded-full border border-red-500/50">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <span className="text-red-200 font-medium">
                            Tempo para avaliação expirado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lista de membros para avaliar */}
                    {selectedGroup.canRate && getOtherMembers().length > 0 ? (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-orange-200 text-center mb-6">
                          Avalie seus companheiros de expedição:
                        </h3>
                        
                        {getOtherMembers().map(member => {
                          const rating = ratings[member.user_id];
                          const isSubmitted = rating?.submitted;
                          
                          return (
                            <div key={member.user_id} className={`p-6 rounded-xl border-2 transition-all ${
                              isSubmitted 
                                ? 'border-green-500/50 bg-green-900/20' 
                                : 'border-orange-500/30 bg-black/30'
                            }`}>
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center border-2 border-orange-400/50">
                                  <span className="text-white font-bold text-lg">
                                    {member.nickname.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-orange-200">{member.nickname}</h4>
                                  <p className="text-orange-300 text-sm">Companheiro de expedição</p>
                                </div>
                                {isSubmitted && (
                                  <div className="flex items-center gap-2 text-green-300">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Avaliado</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Avaliação por estrelas */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-orange-200 mb-2">
                                  Avaliação * (1-5 estrelas)
                                </label>
                                {renderStars(member.user_id, rating?.stars || 0)}
                              </div>
                              
                              {/* Comentário */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-orange-200 mb-2">
                                  Comentário (opcional)
                                </label>
                                <textarea
                                  value={rating?.comment || ''}
                                  onChange={(e) => handleCommentChange(member.user_id, e.target.value)}
                                  disabled={isSubmitted}
                                  className={`w-full px-4 py-3 bg-black/30 border border-orange-500/30 rounded-lg text-orange-100 placeholder-orange-300/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all resize-none ${
                                    isSubmitted ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                  placeholder="Descreva sua experiência com este guerreiro..."
                                  rows={3}
                                  maxLength={200}
                                />
                                <div className="text-xs text-orange-300 mt-1">
                                  {(rating?.comment || '').length}/200 caracteres
                                </div>
                              </div>
                              
                              {/* Botão de envio */}
                              {!isSubmitted && (
                                <button
                                  onClick={() => handleSubmitRating(member.user_id)}
                                  disabled={!rating?.stars || submitting}
                                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-6 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {submitting ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-5 h-5" />
                                      Enviar Avaliação
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : !selectedGroup.canRate ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-red-200 mb-2">
                          Tempo para Avaliação Expirado
                        </h3>
                        <p className="text-red-300">
                          O prazo de 2 horas para avaliar este grupo já passou.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-orange-200 mb-2">
                          Nenhum Membro para Avaliar
                        </h3>
                        <p className="text-orange-300">
                          Você era o único membro deste grupo ou todos já foram avaliados.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-400/50">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-4 tracking-wide">
                  NENHUM GRUPO PARA AVALIAR
                </h3>
                <p className="text-orange-100/80 mb-8 text-lg">
                  Você não possui grupos encerrados recentemente que possam ser avaliados.
                </p>
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30 mb-6">
                  <p className="text-sm text-orange-200 tracking-wide">
                    ⭐ <strong>Como funciona:</strong> Após participar de uma expedição que seja encerrada, 
                    você terá 2 horas para avaliar seus companheiros de grupo.
                  </p>
                </div>

                {/* Informações sobre debug */}
                {debugInfo && (
                  <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30 text-left">
                    <h4 className="text-blue-200 font-bold mb-2">🔍 Informações de Debug:</h4>
                    <div className="text-sm text-blue-300">
                      <p>• Usuário ID: {debugInfo.userId}</p>
                      <p>• Grupos encontrados: {debugInfo.groupsFound || 0}</p>
                      <p>• Timezone: {debugInfo.timezone}</p>
                      <p>• Offset: {debugInfo.timezoneOffset} min</p>
                      {debugInfo.error && (
                        <p className="text-red-300">• Erro: {debugInfo.error.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};