import { supabase } from '../lib/supabase';
import { GroupAdData } from '../types/group';
import type { Database } from '../lib/supabase';

type GroupAdRow = Database['public']['Tables']['group_ads']['Row'];
type GroupAdInsert = Database['public']['Tables']['group_ads']['Insert'];
type GroupMatchRow = Database['public']['Tables']['group_matches']['Row'];
type GroupMatchInsert = Database['public']['Tables']['group_matches']['Insert'];

/**
 * Formatar mensagem de erro mais amigável
 */
const formatError = (error: any): string => {
  if (!error) return 'Erro desconhecido';
  
  const message = error.message || error.toString();
  
  // Erros de permissão
  if (message.includes('permission denied') || message.includes('RLS')) {
    return 'Você não tem permissão para realizar esta operação.';
  }
  
  // Erros de conexão
  if (message.includes('network') || message.includes('connection')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Erros de dados não encontrados
  if (message.includes('PGRST116') || message.includes('not found')) {
    return 'Dados não encontrados.';
  }
  
  // Retornar mensagem original se não conseguir categorizar
  return message;
};

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
      console.log('🔄 Criando anúncio de grupo:', { formData, hostId });
      
      const dbData = convertFormDataToDb(formData, hostId);
      console.log('📊 Dados convertidos para DB:', dbData);
      
      const { data, error } = await supabase
        .from('group_ads')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar anúncio:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Anúncio criado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao criar anúncio de grupo:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar grupos ativos
   */
  async getActiveGroups(): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando grupos ativos...');
      
      const { data, error } = await supabase
        .from('active_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar grupos ativos:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Grupos ativos encontrados:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar grupos ativos:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar grupos do usuário
   */
  async getUserGroups(userId: string): Promise<{ data: GroupAdRow[] | null; error: any }> {
    try {
      console.log('🔄 Buscando grupos do usuário:', userId);
      
      const { data, error } = await supabase
        .from('group_ads')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar grupos do usuário:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Grupos do usuário encontrados:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar grupos do usuário:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar grupo por ID
   */
  async getGroupById(groupId: string): Promise<{ data: GroupAdRow | null; error: any }> {
    try {
      console.log('🔄 Buscando grupo por ID:', groupId);
      
      const { data, error } = await supabase
        .from('group_ads')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar grupo:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Grupo encontrado:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar grupo:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Criar convite para jogador
   */
  async createInvitation(groupId: string, playerId: string): Promise<{ data: GroupMatchRow | null; error: any }> {
    try {
      console.log('🔄 Criando convite:', { groupId, playerId });
      
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

      if (error) {
        console.error('❌ Erro ao criar convite:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Convite criado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao criar convite:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Aceitar convite
   */
  async acceptInvitation(matchId: string): Promise<{ data: GroupMatchRow | null; error: any }> {
    try {
      console.log('🔄 Aceitando convite:', matchId);
      
      const { data, error } = await supabase
        .from('group_matches')
        .update({ 
          status: 'accepted',
          joined_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao aceitar convite:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Convite aceito com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao aceitar convite:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Rejeitar convite
   */
  async rejectInvitation(matchId: string): Promise<{ data: GroupMatchRow | null; error: any }> {
    try {
      console.log('🔄 Rejeitando convite:', matchId);
      
      const { data, error } = await supabase
        .from('group_matches')
        .update({ status: 'declined' })
        .eq('id', matchId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao rejeitar convite:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Convite rejeitado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao rejeitar convite:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar convites do jogador - VERSÃO MELHORADA COM DEBUG
   */
  async getPlayerInvitations(playerId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando convites do jogador:', playerId);
      console.log('📡 Executando query no Supabase...');
      
      // Query mais robusta com joins explícitos
      const { data, error } = await supabase
        .from('group_matches')
        .select(`
          id,
          status,
          created_at,
          group_ads!inner (
            id,
            title,
            description,
            resource_target,
            roles_needed,
            created_at,
            players!group_ads_host_id_fkey (
              nickname,
              name
            )
          )
        `)
        .eq('player_id', playerId)
        .eq('status', 'invited')
        .order('created_at', { ascending: false });

      console.log('📥 Resposta da query:', { data, error });
      console.log('📊 Quantidade de registros retornados:', data?.length || 0);

      if (error) {
        console.error('❌ Erro na query de convites:', error);
        console.error('❌ Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      // Log detalhado dos dados para debug
      if (data && data.length > 0) {
        console.log('✅ Convites encontrados:');
        data.forEach((item, index) => {
          console.log(`  ${index + 1}. ID: ${item.id}, Grupo: ${item.group_ads?.title}, Status: ${item.status}`);
        });
      } else {
        console.log('ℹ️ Nenhum convite pendente encontrado para o jogador');
      }

      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar convites:', error);
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar membros do grupo
   */
  async getGroupMembers(groupId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando membros do grupo:', groupId);
      
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

      if (error) {
        console.error('❌ Erro ao buscar membros do grupo:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Membros do grupo encontrados:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar membros do grupo:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Atualizar status do grupo
   */
  async updateGroupStatus(groupId: string, status: 'open' | 'in_progress' | 'closed'): Promise<{ data: GroupAdRow | null; error: any }> {
    try {
      console.log('🔄 Atualizando status do grupo:', { groupId, status });
      
      const { data, error } = await supabase
        .from('group_ads')
        .update({ status })
        .eq('id', groupId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar status do grupo:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Status do grupo atualizado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar status do grupo:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Função de teste para verificar conectividade
   */
  async testConnection(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🔄 Testando conexão com Supabase...');
      
      const { data, error } = await supabase
        .from('players')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Erro na conexão:', error);
        return { success: false, error };
      }

      console.log('✅ Conexão com Supabase OK');
      return { success: true };
    } catch (error) {
      console.error('💥 Erro inesperado na conexão:', error);
      return { success: false, error };
    }
  }
};