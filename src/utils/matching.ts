import { GroupAdData } from '../types/group';
import { PlayerData } from '../types/player';

/**
 * Extrai o número do tier de uma string (ex: "T3 - Tier 3" -> 3)
 */
const extractTierNumber = (tierString: string): number => {
  if (!tierString) return 0;
  const match = tierString.match(/T(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

/**
 * Verifica se um jogador possui pelo menos uma das ferramentas exigidas
 */
const hasRequiredTools = (player: PlayerData, requiredTools: string[]): boolean => {
  if (requiredTools.length === 0) return true;
  
  const playerTools = [];
  if (player.miningToolsTier) playerTools.push('Ferramentas de Minério');
  if (player.spiceToolsTier) playerTools.push('Ferramentas de Especiaria');
  
  return requiredTools.some(tool => playerTools.includes(tool));
};

/**
 * Verifica se um jogador possui pelo menos um dos interesses exigidos
 */
const hasMatchingInterests = (player: PlayerData, requiredInterests: string[]): boolean => {
  if (requiredInterests.length === 0) return true;
  return requiredInterests.some(interest => player.interests.includes(interest));
};

/**
 * Algoritmo principal de matching entre jogadores e anúncios de grupo
 * 
 * @param groupAd - Anúncio de grupo com filtros definidos
 * @param allPlayers - Lista de todos os jogadores cadastrados
 * @returns Array de jogadores compatíveis com os filtros do anúncio
 */
export const matchPlayersToAd = (groupAd: GroupAdData, allPlayers: PlayerData[]): PlayerData[] => {
  return allPlayers.filter(player => {
    const { filters } = groupAd;
    
    // 1. Verificar level mínimo
    if (filters.minLevel) {
      const playerLevel = parseInt(player.level);
      const minLevel = parseInt(filters.minLevel);
      if (isNaN(playerLevel) || isNaN(minLevel) || playerLevel < minLevel) {
        return false;
      }
    }
    
    // 2. Verificar interesses compatíveis
    if (!hasMatchingInterests(player, filters.interests)) {
      return false;
    }
    
    // 3. Verificar tier mínimo de armas
    if (filters.minWeaponTier) {
      const playerWeaponTier = extractTierNumber(player.weaponTier);
      const minWeaponTier = parseInt(filters.minWeaponTier.replace('T', ''));
      if (playerWeaponTier < minWeaponTier) {
        return false;
      }
    }
    
    // 4. Verificar tier mínimo de armadura
    if (filters.minArmorTier) {
      const playerArmorTier = extractTierNumber(player.armorTier);
      const minArmorTier = parseInt(filters.minArmorTier.replace('T', ''));
      if (playerArmorTier < minArmorTier) {
        return false;
      }
    }
    
    // 5. Verificar tier mínimo de ornicóptero
    if (filters.minOrnithopterTier) {
      const playerOrnithopterTier = extractTierNumber(player.ornithopterTier);
      const minOrnithopterTier = parseInt(filters.minOrnithopterTier.replace('T', ''));
      if (playerOrnithopterTier < minOrnithopterTier) {
        return false;
      }
    }
    
    // 6. Verificar base no Deep Desert
    if (filters.requiresDeepDesertBase) {
      if (!player.hasDeepDesertBase) {
        return false;
      }
      
      // Se foi especificado um setor, verificar se bate
      if (filters.specificSector && player.baseSector !== filters.specificSector) {
        return false;
      }
    }
    
    // 7. Verificar ferramentas necessárias
    if (!hasRequiredTools(player, filters.requiredTools)) {
      return false;
    }
    
    return true;
  });
};

/**
 * Gera convites automáticos baseados no matching
 * 
 * @param groupAd - Anúncio de grupo
 * @param compatiblePlayers - Jogadores compatíveis encontrados pelo matching
 * @returns Array de convites gerados
 */
export const generateInvitations = (groupAd: GroupAdData, compatiblePlayers: PlayerData[]) => {
  return compatiblePlayers.map(player => ({
    id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    groupName: groupAd.groupName,
    groupObjective: groupAd.objective,
    groupCreator: 'Anunciante', // Em produção, seria o nome real do criador
    roles: groupAd.roles,
    playerEmail: player.email,
    playerNickname: player.nickname,
    createdAt: new Date(),
    status: 'pending' as const
  }));
};