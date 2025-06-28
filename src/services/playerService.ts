import { supabase } from '../lib/supabase';
import { PlayerData } from '../types/player';
import type { Database } from '../lib/supabase';

type PlayerRow = Database['public']['Tables']['players']['Row'];
type PlayerInsert = Database['public']['Tables']['players']['Insert'];
type PlayerUpdate = Database['public']['Tables']['players']['Update'];

/**
 * Converte dados do formulário para formato do banco
 */
const convertFormDataToDb = (formData: PlayerData, userId: string): PlayerInsert => {
  return {
    id: userId, // Usar o ID do usuário autenticado
    name: formData.nickname,
    nickname: formData.nickname,
    steam_id: formData.gameId || null,
    game_level: parseInt(formData.level),
    equipment: [
      formData.weaponTier,
      formData.armorTier,
      formData.ornithopterTier
    ].filter(Boolean),
    tools: [
      formData.miningToolsTier,
      formData.spiceToolsTier
    ].filter(Boolean),
    interests: formData.interests,
    desert_base: formData.hasDeepDesertBase,
    email: formData.email,
    age: parseInt(formData.age),
    server: formData.server,
    base_sector: formData.hasDeepDesertBase ? formData.baseSector : null
  };
};

/**
 * Converte dados do banco para formato do formulário
 */
const convertDbToFormData = (dbData: PlayerRow): PlayerData => {
  return {
    nickname: dbData.nickname,
    gameId: dbData.steam_id || '',
    email: dbData.email || '',
    age: dbData.age?.toString() || '',
    server: dbData.server || '',
    level: dbData.game_level.toString(),
    weaponTier: dbData.equipment[0] || '',
    armorTier: dbData.equipment[1] || '',
    ornithopterTier: dbData.equipment[2] || '',
    miningToolsTier: dbData.tools[0] || '',
    spiceToolsTier: dbData.tools[1] || '',
    interests: dbData.interests,
    hasDeepDesertBase: dbData.desert_base,
    baseSector: dbData.base_sector || ''
  };
};

/**
 * Formatar mensagem de erro mais amigável
 */
const formatError = (error: any): string => {
  if (!error) return 'Erro desconhecido';
  
  const message = error.message || error.toString();
  
  // Erros específicos do schema
  if (message.includes("Could not find the 'age' column")) {
    return 'Schema do banco desatualizado. Entre em contato com o administrador.';
  }
  
  if (message.includes("Could not find the 'email' column")) {
    return 'Schema do banco desatualizado. Entre em contato com o administrador.';
  }
  
  // Erros de constraint
  if (message.includes('duplicate key value violates unique constraint')) {
    if (message.includes('nickname')) {
      return 'Este nickname já está em uso por outro jogador.';
    }
    if (message.includes('email')) {
      return 'Este email já está cadastrado.';
    }
    return 'Dados duplicados encontrados.';
  }
  
  // Erros de validação
  if (message.includes('check constraint')) {
    if (message.includes('age')) {
      return 'Idade deve estar entre 13 e 100 anos.';
    }
    if (message.includes('game_level')) {
      return 'Level deve estar entre 1 e 60.';
    }
    return 'Dados inválidos fornecidos.';
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
 * Serviço para operações com jogadores
 */
export const playerService = {
  /**
   * Criar novo jogador
   */
  async createPlayer(formData: PlayerData, userId: string): Promise<{ data: PlayerRow | null; error: any }> {
    try {
      const dbData = convertFormDataToDb(formData, userId);
      
      const { data, error } = await supabase
        .from('players')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar jogador por nickname
   */
  async getPlayerByNickname(nickname: string): Promise<{ data: PlayerRow | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('nickname', nickname)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar jogador:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar jogador por email
   */
  async getPlayerByEmail(email: string): Promise<{ data: PlayerRow | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('email', email)
        .single();

      // Se não encontrar, não é erro
      if (error?.code === 'PGRST116') {
        return { data: null, error: null };
      }

      if (error) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar jogador por email:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar jogador por ID do usuário autenticado
   */
  async getPlayerByUserId(userId: string): Promise<{ data: PlayerRow | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();

      // Se não encontrar, não é erro
      if (error?.code === 'PGRST116') {
        return { data: null, error: null };
      }

      if (error) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar jogador por user ID:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Atualizar jogador
   */
  async updatePlayer(id: string, formData: PlayerData, userId: string): Promise<{ data: PlayerRow | null; error: any }> {
    try {
      const dbData = convertFormDataToDb(formData, userId);
      
      const { data, error } = await supabase
        .from('players')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Listar todos os jogadores
   */
  async getAllPlayers(): Promise<{ data: PlayerRow[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao listar jogadores:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar jogadores por critérios de matching
   */
  async findCompatiblePlayers(criteria: {
    minLevel?: number;
    interests?: string[];
    hasDesertBase?: boolean;
  }): Promise<{ data: PlayerRow[] | null; error: any }> {
    try {
      let query = supabase.from('players').select('*');

      if (criteria.minLevel) {
        query = query.gte('game_level', criteria.minLevel);
      }

      if (criteria.interests && criteria.interests.length > 0) {
        query = query.overlaps('interests', criteria.interests);
      }

      if (criteria.hasDesertBase !== undefined) {
        query = query.eq('desert_base', criteria.hasDesertBase);
      }

      const { data, error } = await query.order('game_level', { ascending: false });

      if (error) {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar jogadores compatíveis:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  /**
   * Buscar reputação do jogador
   */
  async getPlayerReputation(playerId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('player_reputation')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { 
          data: null, 
          error: { 
            ...error, 
            message: formatError(error) 
          } 
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar reputação:', error);
      return { 
        data: null, 
        error: { 
          message: formatError(error) 
        } 
      };
    }
  },

  // Expor funções de conversão para uso externo
  convertFormDataToDb,
  convertDbToFormData
};