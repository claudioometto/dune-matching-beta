import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type RatingRow = Database['public']['Tables']['ratings']['Row'];
type RatingInsert = Database['public']['Tables']['ratings']['Insert'];

/**
 * Formatar mensagem de erro mais amigável
 */
const formatError = (error: any): string => {
  if (!error) return 'Erro desconhecido';
  
  const message = error.message || error.toString();
  
  // Erros específicos de avaliação
  if (message.includes('duplicate key')) {
    return 'Você já avaliou este jogador neste grupo.';
  }
  
  if (message.includes('check constraint')) {
    if (message.includes('stars')) {
      return 'A avaliação deve ser entre 1 e 5 estrelas.';
    }
    if (message.includes('from_player_id')) {
      return 'Você não pode se autoavaliar.';
    }
  }
  
  // Erros de permissão
  if (message.includes('permission denied') || message.includes('RLS')) {
    return 'Você não tem permissão para realizar esta operação.';
  }
  
  // Erros de conexão
  if (message.includes('network') || message.includes('connection')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Retornar mensagem original se não conseguir categorizar
  return message;
};

/**
 * Serviço para operações com avaliações
 */
export const ratingService = {
  /**
   * Criar nova avaliação
   */
  async createRating(
    fromPlayerId: string,
    toPlayerId: string,
    groupId: string,
    stars: number,
    comment?: string
  ): Promise<{ data: RatingRow | null; error: any }> {
    try {
      console.log('⭐ Criando avaliação:', { fromPlayerId, toPlayerId, groupId, stars, comment });
      
      // Validações básicas
      if (fromPlayerId === toPlayerId) {
        return {
          data: null,
          error: { message: 'Você não pode se autoavaliar.' }
        };
      }
      
      if (stars < 1 || stars > 5) {
        return {
          data: null,
          error: { message: 'A avaliação deve ser entre 1 e 5 estrelas.' }
        };
      }
      
      const ratingData: RatingInsert = {
        from_player_id: fromPlayerId,
        to_player_id: toPlayerId,
        group_id: groupId,
        stars,
        comment: comment || null
      };

      const { data, error } = await supabase
        .from('ratings')
        .insert(ratingData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar avaliação:', error);
        return {
          data: null,
          error: {
            ...error,
            message: formatError(error)
          }
        };
      }

      console.log('✅ Avaliação criada com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao criar avaliação:', error);
      return {
        data: null,
        error: {
          message: formatError(error)
        }
      };
    }
  },

  /**
   * Buscar grupos encerrados que podem ser avaliados - VERSÃO CORRIGIDA COM CLOSED_AT
   */
  async getCompletedGroupsForRating(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando grupos encerrados para avaliação:', userId);
      console.log('🕐 Horário local atual:', new Date().toISOString());
      console.log('🌍 Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
      console.log('⏰ Offset:', new Date().getTimezoneOffset(), 'minutos');
      
      // Buscar grupos encerrados nas últimas 24 horas usando o campo closed_at
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      console.log('📅 Buscando grupos encerrados desde:', twentyFourHoursAgo);
      
      // 1. Buscar grupos criados pelo usuário que foram encerrados
      const { data: ownedGroups, error: ownedError } = await supabase
        .from('group_ads')
        .select(`
          id,
          title,
          resource_target,
          status,
          created_at,
          closed_at,
          host_id
        `)
        .eq('host_id', userId)
        .eq('status', 'closed')
        .not('closed_at', 'is', null)
        .gte('closed_at', twentyFourHoursAgo);

      if (ownedError) {
        console.error('❌ Erro ao buscar grupos próprios encerrados:', ownedError);
      } else {
        console.log('📊 Grupos próprios encerrados encontrados:', ownedGroups?.length || 0);
        ownedGroups?.forEach(group => {
          console.log(`  - ${group.title}: criado em ${group.created_at}, encerrado em ${group.closed_at}`);
        });
      }

      // 2. Buscar grupos onde o usuário foi membro aceito e que foram encerrados
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_matches')
        .select(`
          id,
          status,
          group_ads!inner (
            id,
            title,
            resource_target,
            status,
            created_at,
            closed_at,
            host_id
          )
        `)
        .eq('player_id', userId)
        .eq('status', 'accepted')
        .eq('group_ads.status', 'closed')
        .not('group_ads.closed_at', 'is', null)
        .gte('group_ads.closed_at', twentyFourHoursAgo);

      if (memberError) {
        console.error('❌ Erro ao buscar grupos como membro encerrados:', memberError);
      } else {
        console.log('📊 Grupos como membro encerrados encontrados:', memberGroups?.length || 0);
        memberGroups?.forEach(match => {
          const group = match.group_ads;
          console.log(`  - ${group.title}: criado em ${group.created_at}, encerrado em ${group.closed_at}`);
        });
      }

      // Combinar resultados
      const allGroups = [
        ...(ownedGroups || []),
        ...(memberGroups || []).map(match => match.group_ads)
      ];

      console.log('📊 Total de grupos encontrados:', allGroups.length);

      // Remover duplicatas
      const uniqueGroups = allGroups.filter((group, index, self) => 
        index === self.findIndex(g => g.id === group.id)
      );

      console.log('📊 Grupos únicos após remoção de duplicatas:', uniqueGroups.length);

      // Para cada grupo, buscar os membros e verificar se ainda pode avaliar
      const completedGroupsWithMembers = await Promise.all(
        uniqueGroups.map(async (group) => {
          try {
            console.log(`🔍 Processando grupo: ${group.title} (${group.id})`);
            
            // Buscar todos os membros aceitos do grupo
            const { data: acceptedMembers, error: membersError } = await supabase
              .from('group_matches')
              .select(`
                id,
                player_id,
                players!inner (
                  id,
                  nickname,
                  name
                )
              `)
              .eq('group_id', group.id)
              .eq('status', 'accepted');

            if (membersError) {
              console.error(`❌ Erro ao buscar membros do grupo ${group.id}:`, membersError);
              return null;
            }

            console.log(`👥 Membros aceitos encontrados para ${group.title}:`, acceptedMembers?.length || 0);

            // Buscar dados do host (líder do grupo)
            const { data: hostData, error: hostError } = await supabase
              .from('players')
              .select('id, nickname, name')
              .eq('id', group.host_id)
              .single();

            if (hostError) {
              console.error(`❌ Erro ao buscar dados do host do grupo ${group.id}:`, hostError);
            }

            // Montar lista de todos os membros (host + aceitos)
            const allMembers = [];
            
            // Adicionar o host
            if (hostData) {
              allMembers.push({
                id: hostData.id,
                nickname: hostData.nickname,
                user_id: hostData.id
              });
            }
            
            // Adicionar membros aceitos
            if (acceptedMembers) {
              acceptedMembers.forEach(member => {
                allMembers.push({
                  id: member.players.id,
                  nickname: member.players.nickname,
                  user_id: member.players.id
                });
              });
            }

            console.log(`👥 Total de membros para avaliação em ${group.title}:`, allMembers.length);

            // CORREÇÃO: Usar closed_at ao invés de created_at/updated_at
            if (!group.closed_at) {
              console.warn(`⚠️ Grupo ${group.title} não tem closed_at definido, pulando...`);
              return null;
            }

            const closedAt = new Date(group.closed_at);
            const now = new Date();
            
            // 30 minutos após o encerramento para avaliar
            const thirtyMinutesLater = new Date(closedAt.getTime() + 30 * 60 * 1000);
            const canRate = now <= thirtyMinutesLater;
            const timeRemaining = Math.max(0, thirtyMinutesLater.getTime() - now.getTime());

            console.log(`⏰ Grupo ${group.title}:`);
            console.log(`   - Encerrado em: ${closedAt.toISOString()}`);
            console.log(`   - Agora: ${now.toISOString()}`);
            console.log(`   - Prazo até: ${thirtyMinutesLater.toISOString()}`);
            console.log(`   - Pode avaliar: ${canRate}`);
            console.log(`   - Tempo restante: ${Math.floor(timeRemaining / 1000 / 60)}min ${Math.floor((timeRemaining % (1000 * 60)) / 1000)}s`);

            return {
              id: group.id,
              title: group.title,
              resource_target: group.resource_target,
              completed_at: group.closed_at, // Usar closed_at como completed_at
              members: allMembers,
              canRate,
              timeRemaining
            };
          } catch (error) {
            console.error('❌ Erro ao processar grupo:', group.id, error);
            return null;
          }
        })
      );

      // Filtrar grupos nulos
      const validGroups = completedGroupsWithMembers
        .filter(group => group !== null)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

      console.log('✅ Grupos válidos para avaliação:', validGroups.length);
      
      // Log detalhado dos grupos encontrados
      validGroups.forEach((group, index) => {
        console.log(`${index + 1}. ${group.title} - ${group.members.length} membros - ${group.canRate ? 'Pode avaliar' : 'Expirado'}`);
      });

      return { data: validGroups, error: null };

    } catch (error) {
      console.error('💥 Erro inesperado ao buscar grupos encerrados:', error);
      return {
        data: null,
        error: {
          message: formatError(error)
        }
      };
    }
  },

  /**
   * Buscar avaliações de um jogador
   */
  async getPlayerRatings(playerId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando avaliações do jogador:', playerId);
      
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          from_player:players!ratings_from_player_id_fkey (
            nickname,
            name
          ),
          group_ads (
            title
          )
        `)
        .eq('to_player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar avaliações:', error);
        return {
          data: null,
          error: {
            ...error,
            message: formatError(error)
          }
        };
      }

      console.log('✅ Avaliações encontradas:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar avaliações:', error);
      return {
        data: null,
        error: {
          message: formatError(error)
        }
      };
    }
  },

  /**
   * Buscar reputação resumida do jogador
   */
  async getPlayerReputation(playerId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log('🔄 Buscando reputação do jogador:', playerId);
      
      const { data, error } = await supabase
        .from('player_reputation')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar reputação:', error);
        return {
          data: null,
          error: {
            ...error,
            message: formatError(error)
          }
        };
      }

      console.log('✅ Reputação encontrada:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar reputação:', error);
      return {
        data: null,
        error: {
          message: formatError(error)
        }
      };
    }
  },

  /**
   * Verificar se jogador já avaliou outro em um grupo específico
   */
  async hasRated(fromPlayerId: string, toPlayerId: string, groupId: string): Promise<{ data: boolean; error: any }> {
    try {
      console.log('🔄 Verificando se já avaliou:', { fromPlayerId, toPlayerId, groupId });
      
      const { data, error } = await supabase
        .from('ratings')
        .select('id')
        .eq('from_player_id', fromPlayerId)
        .eq('to_player_id', toPlayerId)
        .eq('group_id', groupId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar avaliação:', error);
        return {
          data: false,
          error: {
            ...error,
            message: formatError(error)
          }
        };
      }

      const hasRated = !!data;
      console.log('✅ Verificação concluída:', hasRated);
      return { data: hasRated, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao verificar avaliação:', error);
      return {
        data: false,
        error: {
          message: formatError(error)
        }
      };
    }
  },

  /**
   * Buscar últimas avaliações de um jogador
   */
  async getRecentRatings(playerId: string, limit: number = 5): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando avaliações recentes:', { playerId, limit });
      
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          stars,
          comment,
          created_at,
          from_player:players!ratings_from_player_id_fkey (
            nickname
          )
        `)
        .eq('to_player_id', playerId)
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao buscar avaliações recentes:', error);
        return {
          data: null,
          error: {
            ...error,
            message: formatError(error)
          }
        };
      }

      console.log('✅ Avaliações recentes encontradas:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar avaliações recentes:', error);
      return {
        data: null,
        error: {
          message: formatError(error)
        }
      };
    }
  }
};