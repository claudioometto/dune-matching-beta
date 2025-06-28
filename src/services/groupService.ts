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
  
  // Erros de duplicação (candidatura já enviada)
  if (message.includes('duplicate key')) {
    return 'Você já se candidatou a este grupo.';
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
 * Verificar se o usuário pode criar grupos (não está em nenhum grupo ativo)
 */
const canCreateGroup = async (userId: string): Promise<{ canCreate: boolean; reason?: string }> => {
  try {
    // 1. Verificar se é líder de algum grupo ativo
    const { data: ownedGroups } = await supabase
      .from('group_ads')
      .select('id, title')
      .eq('host_id', userId)
      .eq('status', 'open');

    if (ownedGroups && ownedGroups.length > 0) {
      return { 
        canCreate: false, 
        reason: `Você já é líder do grupo "${ownedGroups[0].title}". Encerre-o antes de criar outro.` 
      };
    }

    // 2. Verificar se é membro aceito de algum grupo ativo
    const { data: memberGroups } = await supabase
      .from('group_matches')
      .select(`
        id,
        group_ads!inner (
          id,
          title,
          status
        )
      `)
      .eq('player_id', userId)
      .eq('status', 'accepted');

    const activeMemberships = memberGroups?.filter(match => 
      match.group_ads?.status === 'open'
    );

    if (activeMemberships && activeMemberships.length > 0) {
      return { 
        canCreate: false, 
        reason: `Você já faz parte do grupo "${activeMemberships[0].group_ads?.title}". Deixe o grupo antes de criar outro.` 
      };
    }

    return { canCreate: true };
  } catch (error) {
    console.error('Erro ao verificar permissão para criar grupo:', error);
    return { canCreate: false, reason: 'Erro ao verificar permissões' };
  }
};

/**
 * Serviço para operações com grupos
 */
export const groupService = {
  /**
   * Verificar se usuário pode criar grupo
   */
  async canUserCreateGroup(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    return canCreateGroup(userId);
  },

  /**
   * Criar novo anúncio de grupo
   */
  async createGroupAd(formData: GroupAdData, hostId: string): Promise<{ data: GroupAdRow | null; error: any }> {
    try {
      console.log('🔄 Criando anúncio de grupo:', { formData, hostId });
      
      // Verificar se o usuário pode criar grupos
      const { canCreate, reason } = await canCreateGroup(hostId);
      if (!canCreate) {
        return { 
          data: null, 
          error: { message: reason } 
        };
      }
      
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
   * Buscar grupos ativos (não lotados e não expirados)
   */
  async getActiveGroups(): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando grupos ativos...');
      
      // Query mais robusta com joins explícitos
      const { data, error } = await supabase
        .from('group_ads')
        .select(`
          id,
          title,
          description,
          resource_target,
          roles_needed,
          max_members,
          status,
          created_at,
          closed_at,
          host_id,
          players!group_ads_host_id_fkey (
            nickname,
            name
          )
        `)
        .eq('status', 'open')
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

      // Processar dados para incluir informações do host e contagem de membros
      const processedData = await Promise.all((data || []).map(async (group) => {
        // Contar membros aceitos
        const { data: members } = await supabase
          .from('group_matches')
          .select('id')
          .eq('group_id', group.id)
          .eq('status', 'accepted');

        const currentMembers = 1 + (members?.length || 0); // 1 (líder) + membros aceitos
        
        // Verificar se o grupo expirou (6 horas)
        const createdAt = new Date(group.created_at);
        const now = new Date();
        const sixHoursLater = new Date(createdAt.getTime() + 6 * 60 * 60 * 1000);
        const isExpired = now > sixHoursLater;
        
        // Se expirou, marcar como fechado
        if (isExpired) {
          await supabase
            .from('group_ads')
            .update({ status: 'closed' })
            .eq('id', group.id);
          
          return null; // Não incluir na lista
        }
        
        // Se está lotado, não incluir na lista
        if (currentMembers >= group.max_members) {
          return null;
        }

        return {
          ...group,
          host_nickname: group.players?.nickname || 'Desconhecido',
          host_name: group.players?.name || 'Desconhecido',
          current_members: currentMembers
        };
      }));

      // Filtrar grupos nulos (expirados ou lotados)
      const filteredData = processedData.filter(group => group !== null);

      console.log('✅ Grupos ativos encontrados:', filteredData.length);
      return { data: filteredData, error: null };
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
   * Buscar grupos onde o usuário é membro aceito
   */
  async getGroupsAsMember(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando grupos como membro:', userId);
      
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
            max_members,
            status,
            created_at,
            closed_at,
            host_id
          )
        `)
        .eq('player_id', userId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar grupos como membro:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Grupos como membro encontrados:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar grupos como membro:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Deixar um grupo (para membros)
   */
  async leaveGroup(membershipId: string): Promise<{ data: any | null; error: any }> {
    try {
      console.log('🔄 Deixando grupo:', membershipId);
      
      const { data, error } = await supabase
        .from('group_matches')
        .update({ status: 'declined' })
        .eq('id', membershipId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao deixar grupo:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Grupo deixado com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao deixar grupo:', error);
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
   * Criar convite/candidatura para jogador - VERSÃO MELHORADA
   */
  async createInvitation(groupId: string, playerId: string): Promise<{ data: GroupMatchRow | null; error: any }> {
    try {
      console.log('🔄 Criando candidatura:', { groupId, playerId });
      
      // Verificar se o jogador pode se candidatar
      const { canCreate, reason } = await canCreateGroup(playerId);
      if (!canCreate) {
        return { 
          data: null, 
          error: { message: reason } 
        };
      }
      
      // Verificar se o grupo ainda está aberto e tem vagas
      const { data: groupData, error: groupError } = await supabase
        .from('group_ads')
        .select('status, max_members, created_at')
        .eq('id', groupId)
        .single();

      if (groupError) {
        console.error('❌ Erro ao verificar grupo:', groupError);
        return { 
          data: null, 
          error: { 
            message: 'Grupo não encontrado ou inacessível' 
          } 
        };
      }

      if (groupData.status !== 'open') {
        return { 
          data: null, 
          error: { 
            message: 'Este grupo não está mais aceitando candidaturas' 
          } 
        };
      }

      // Verificar se o grupo expirou (6 horas)
      const createdAt = new Date(groupData.created_at);
      const now = new Date();
      const sixHoursLater = new Date(createdAt.getTime() + 6 * 60 * 60 * 1000);
      
      if (now > sixHoursLater) {
        // Marcar grupo como fechado
        await supabase
          .from('group_ads')
          .update({ status: 'closed' })
          .eq('id', groupId);
        
        return { 
          data: null, 
          error: { 
            message: 'Este grupo expirou (6 horas limite)' 
          } 
        };
      }

      // Contar membros atuais
      const { data: currentMembers } = await supabase
        .from('group_matches')
        .select('id')
        .eq('group_id', groupId)
        .in('status', ['invited', 'accepted']);

      const totalMembers = 1 + (currentMembers?.length || 0); // 1 (líder) + membros

      if (totalMembers >= groupData.max_members) {
        return { 
          data: null, 
          error: { 
            message: 'Este grupo já está lotado' 
          } 
        };
      }

      // Criar candidatura
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
        console.error('❌ Erro ao criar candidatura:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Candidatura criada com sucesso:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao criar candidatura:', error);
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
            closed_at,
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
   * Buscar todos os matches do usuário (para debug)
   */
  async getAllUserMatches(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      console.log('🔄 Buscando todos os matches do usuário:', userId);
      
      const { data, error } = await supabase
        .from('group_matches')
        .select(`
          id,
          status,
          created_at,
          group_id,
          player_id
        `)
        .eq('player_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar matches do usuário:', error);
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      console.log('✅ Matches do usuário encontrados:', data?.length || 0);
      return { data, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar matches do usuário:', error);
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
   * Atualizar status do grupo - VERSÃO CORRIGIDA COM CLOSED_AT
   */
  async updateGroupStatus(groupId: string, status: 'open' | 'in_progress' | 'closed'): Promise<{ data: GroupAdRow | null; error: any }> {
    try {
      console.log('🔄 Atualizando status do grupo:', { groupId, status });
      
      // O trigger do banco automaticamente preencherá closed_at quando status = 'closed'
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
      console.log('📅 Closed_at definido como:', data.closed_at);
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
   * Buscar informações das tabelas (para debug)
   */
  async getTablesInfo(): Promise<{ data: any | null; error: any }> {
    try {
      console.log('🔄 Buscando informações das tabelas...');
      
      // Verificar estrutura da tabela group_ads
      const { data: groupAdsColumns, error: groupAdsError } = await supabase
        .rpc('get_table_columns', { table_name: 'group_ads' })
        .single();

      if (groupAdsError) {
        console.log('ℹ️ RPC não disponível, usando query alternativa...');
        
        // Query alternativa para verificar se closed_at existe
        const { data: testData, error: testError } = await supabase
          .from('group_ads')
          .select('id, status, created_at, closed_at')
          .limit(1);

        return { 
          data: { 
            hasClosedAtField: !testError,
            testError: testError?.message,
            sampleData: testData
          }, 
          error: null 
        };
      }

      return { data: groupAdsColumns, error: null };
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar informações das tabelas:', error);
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