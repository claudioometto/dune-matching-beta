import { supabase } from '../lib/supabase';
import { GroupAdData } from '../types/group';
import type { Database } from '../lib/supabase';

type GroupAdRow = Database['public']['Tables']['group_ads']['Row'];
type GroupAdInsert = Database['public']['Tables']['group_ads']['Insert'];
type GroupMatchRow = Database['public']['Tables']['group_matches']['Row'];
type GroupMatchInsert = Database['public']['Tables']['group_matches']['Insert'];

/**
 * Converte dados do formulário para formato do banco
 */
const convertFormDataToDb = (formData: GroupAdData, hostId: string): GroupAdInsert => {
  return {
    host_id: hostId,
    title: formData.groupName,
    description: `Objetivo: ${formData.objective}. Filtros aplicados: ${JSON.stringify(formData.filters)}`,
    resource_target: formData.objective === 'Coleta' ? 'Especiaria' : 'PvP',
    roles_needed: formData.roles.map(role => role.type),
    max_members: 4,
    status: 'open'
  };
};

/**
 * Serviço para operações com grupos
 */
export const groupService = {
  /**
   * Criar novo anúncio de grupo
   */
  async createGroupAd(formData: GroupAdData, hostId: string): Promise<{ data: GroupAdRow | null; error: any }> {
    try {
      const dbData = convertFormDataToDb(formData, hostId);
      
      const { data, error } = await supabase
        .from('group_ads')
        .insert(dbData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar anúncio de grupo:', error);
      return { data: null, error };
    }
  },

  /**
   * Buscar grupos ativos
   */
  async getActiveGroups(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('active_groups')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar grupos ativos:', error);
      return { data: null, error };
    }
  },

  /**
   * Buscar grupos do usuário
   */
  async getUserGroups(userId: string): Promise<{ data: GroupAdRow[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_ads')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar grupos do usuário:', error);
      return { data: null, error };
    }
  },

  /**
   * Buscar grupo por ID
   */
  async getGroupById(groupId: string): Promise<{ data: GroupAdRow | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_ads')
        .select('*')
        .eq('id', groupId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      return { data: null, error };
    }
  },

  /**
   * Criar convite para jogador
   */
  async createInvitation(groupId: string, playerId: string): Promise<{ data: GroupMatchRow | null; error: any }> {
    try {
      const inviteData: GroupMatchInsert = {
        group_id: groupId,
        player_id: playerId,
        status: 'invited'
      };

      const { data, error } = await supabase
        .from('group_matches')
        .insert(inviteData)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      return { data: null, error };
    }
  },

  /**
   * Aceitar convite
   */
  async acceptInvitation(matchId: string): Promise<{ data: GroupMatchRow | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_matches')
        .update({ 
          status: 'accepted',
          joined_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      return { data: null, error };
    }
  },

  /**
   * Rejeitar convite
   */
  async rejectInvitation(matchId: string): Promise<{ data: GroupMatchRow | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_matches')
        .update({ status: 'declined' })
        .eq('id', matchId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      return { data: null, error };
    }
  },

  /**
   * Buscar convites do jogador
   */
  async getPlayerInvitations(playerId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_matches')
        .select(`
          *,
          group_ads (
            id,
            title,
            description,
            resource_target,
            roles_needed,
            created_at,
            players (nickname)
          )
        `)
        .eq('player_id', playerId)
        .eq('status', 'invited')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
      return { data: null, error };
    }
  },

  /**
   * Buscar membros do grupo
   */
  async getGroupMembers(groupId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_matches')
        .select(`
          *,
          players (
            id,
            nickname,
            name,
            game_level
          )
        `)
        .eq('group_id', groupId)
        .in('status', ['invited', 'accepted'])
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar membros do grupo:', error);
      return { data: null, error };
    }
  },

  /**
   * Atualizar status do grupo
   */
  async updateGroupStatus(groupId: string, status: 'open' | 'in_progress' | 'closed'): Promise<{ data: GroupAdRow | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_ads')
        .update({ status })
        .eq('id', groupId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar status do grupo:', error);
      return { data: null, error };
    }
  }
};