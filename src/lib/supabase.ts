import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente Supabase singleton
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos do banco de dados (gerados automaticamente pelo Supabase)
export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          nickname: string;
          steam_id: string | null;
          game_level: number;
          equipment: string[];
          tools: string[];
          interests: string[];
          desert_base: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nickname: string;
          steam_id?: string | null;
          game_level: number;
          equipment: string[];
          tools: string[];
          interests: string[];
          desert_base?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nickname?: string;
          steam_id?: string | null;
          game_level?: number;
          equipment?: string[];
          tools?: string[];
          interests?: string[];
          desert_base?: boolean;
          created_at?: string;
        };
      };
      group_ads: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string | null;
          resource_target: string | null;
          roles_needed: string[];
          max_members: number;
          status: 'open' | 'in_progress' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          title: string;
          description?: string | null;
          resource_target?: string | null;
          roles_needed: string[];
          max_members?: number;
          status?: 'open' | 'in_progress' | 'closed';
          created_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          title?: string;
          description?: string | null;
          resource_target?: string | null;
          roles_needed?: string[];
          max_members?: number;
          status?: 'open' | 'in_progress' | 'closed';
          created_at?: string;
        };
      };
      group_matches: {
        Row: {
          id: string;
          group_id: string;
          player_id: string;
          status: 'invited' | 'accepted' | 'declined';
          joined_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          player_id: string;
          status?: 'invited' | 'accepted' | 'declined';
          joined_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          player_id?: string;
          status?: 'invited' | 'accepted' | 'declined';
          joined_at?: string | null;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          from_player_id: string;
          to_player_id: string;
          group_id: string;
          stars: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_player_id: string;
          to_player_id: string;
          group_id: string;
          stars: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_player_id?: string;
          to_player_id?: string;
          group_id?: string;
          stars?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      player_reputation: {
        Row: {
          id: string;
          nickname: string;
          name: string;
          average_rating: number;
          total_ratings: number;
          positive_ratings: number;
        };
      };
      active_groups: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string | null;
          resource_target: string | null;
          roles_needed: string[];
          max_members: number;
          status: 'open' | 'in_progress' | 'closed';
          created_at: string;
          host_nickname: string;
          host_name: string;
          current_members: number;
        };
      };
    };
  };
};