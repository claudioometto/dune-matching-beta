import { supabase } from '../lib/supabase';

/**
 * Função para criar dados de teste no sistema
 * USAR APENAS EM DESENVOLVIMENTO/TESTE
 */
export const createTestData = async () => {
  try {
    console.log('🔄 Criando dados de teste...');

    // 1. Criar jogador de teste (se não existir)
    const testPlayerData = {
      id: '00000000-0000-0000-0000-000000000001', // ID fixo para teste
      name: 'Jogador Teste',
      nickname: 'TestPlayer',
      steam_id: 'test123',
      game_level: 45,
      equipment: ['T4 - Tier 4', 'T3 - Tier 3', 'T4 - Tier 4'],
      tools: ['T4 - Tier 4', 'T3 - Tier 3'],
      interests: ['Coleta', 'PvP'],
      desert_base: true,
      email: 'teste@exemplo.com',
      age: 25,
      server: 'América do Sul',
      base_sector: 'G5'
    };

    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('id', testPlayerData.id)
      .single();

    if (!existingPlayer) {
      const { error: playerError } = await supabase
        .from('players')
        .insert(testPlayerData);

      if (playerError) {
        console.error('❌ Erro ao criar jogador teste:', playerError);
      } else {
        console.log('✅ Jogador teste criado');
      }
    } else {
      console.log('ℹ️ Jogador teste já existe');
    }

    // 2. Criar grupo de teste
    const testGroupData = {
      id: '00000000-0000-0000-0000-000000000002', // ID fixo para teste
      host_id: testPlayerData.id,
      title: 'Expedição de Teste G5',
      description: 'Grupo de teste para verificar sistema de convites',
      resource_target: 'Especiaria',
      roles_needed: ['Coleta', 'Ataque', 'Coleta', 'Ataque'],
      max_members: 4,
      status: 'open' as const
    };

    const { data: existingGroup } = await supabase
      .from('group_ads')
      .select('id')
      .eq('id', testGroupData.id)
      .single();

    if (!existingGroup) {
      const { error: groupError } = await supabase
        .from('group_ads')
        .insert(testGroupData);

      if (groupError) {
        console.error('❌ Erro ao criar grupo teste:', groupError);
      } else {
        console.log('✅ Grupo teste criado');
      }
    } else {
      console.log('ℹ️ Grupo teste já existe');
    }

    // 3. Criar convite de teste para o usuário atual
    const currentUser = await supabase.auth.getUser();
    if (currentUser.data.user) {
      const testInviteData = {
        group_id: testGroupData.id,
        player_id: currentUser.data.user.id,
        status: 'invited' as const
      };

      const { data: existingInvite } = await supabase
        .from('group_matches')
        .select('id')
        .eq('group_id', testGroupData.id)
        .eq('player_id', currentUser.data.user.id)
        .single();

      if (!existingInvite) {
        const { error: inviteError } = await supabase
          .from('group_matches')
          .insert(testInviteData);

        if (inviteError) {
          console.error('❌ Erro ao criar convite teste:', inviteError);
        } else {
          console.log('✅ Convite teste criado para usuário atual');
        }
      } else {
        console.log('ℹ️ Convite teste já existe');
      }
    }

    console.log('🎉 Dados de teste criados com sucesso!');
    return { success: true };

  } catch (error) {
    console.error('💥 Erro ao criar dados de teste:', error);
    return { success: false, error };
  }
};

/**
 * Função para limpar dados de teste
 */
export const cleanTestData = async () => {
  try {
    console.log('🧹 Limpando dados de teste...');

    // Remover convites de teste
    await supabase
      .from('group_matches')
      .delete()
      .eq('group_id', '00000000-0000-0000-0000-000000000002');

    // Remover grupo de teste
    await supabase
      .from('group_ads')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000002');

    // Remover jogador de teste
    await supabase
      .from('players')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000001');

    console.log('✅ Dados de teste removidos');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao limpar dados de teste:', error);
    return { success: false, error };
  }
};