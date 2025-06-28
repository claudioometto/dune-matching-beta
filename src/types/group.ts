export interface GroupRole {
  id: string;
  type: 'Coleta' | 'Ataque';
  isOwner: boolean;
  playerName?: string;
}

export interface GroupAdData {
  groupName: string;
  objective: 'Coleta' | 'PvP' | '';
  roles: GroupRole[];
  filters: {
    minLevel: string;
    interests: string[];
    minWeaponTier: string;
    minArmorTier: string;
    minOrnithopterTier: string;
    requiresDeepDesertBase: boolean;
    specificSector: string;
    requiredTools: string[];
  };
}

export interface GroupAdErrors {
  [key: string]: string;
}