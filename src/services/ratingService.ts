import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type RatingRow = Database['public']['Tables']['ratings']['Row'];
type RatingInsert = Database['public']['Tables']['ratings']['Insert'];

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

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      return { data: null, error };
    }
  },

  /**
   * Buscar avaliações de um jogador
   */
  async getPlayerRatings(playerId: string): Promise<{ data: any[] | null; error: any }> {
    try {
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

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return { data: null, error };
    }
  },

  /**
   * Buscar reputação resumida do jogador
   */
  async getPlayerReputation(playerId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('player_reputation')
        .select('*')
        .eq('id', playerId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar reputação:', error);
      return { data: null, error };
    }
  },

  /**
   * Verificar se jogador já avaliou outro em um grupo específico
   */
  async hasRated(fromPlayerId: string, toPlayerId: string, groupId: string): Promise<{ data: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('id')
        .eq('from_player_id', fromPlayerId)
        .eq('to_player_id', toPlayerId)
        .eq('group_id', groupId)
        .single();

      return { data: !!data, error: error?.code === 'PGRST116' ? null : error };
    } catch (error) {
      console.error('Erro ao verificar avaliação:', error);
      return { data: false, error };
    }
  },

  /**
   * Buscar últimas avaliações de um jogador
   */
  async getRecentRatings(playerId: string, limit: number = 5): Promise<{ data: any[] | null; error: any }> {
    try {
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

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar avaliações recentes:', error);
      return { data: null, error };
    }
  }
};