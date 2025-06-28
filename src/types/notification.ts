export interface Invitation {
  id: string;
  groupName: string;
  groupObjective: 'Coleta' | 'PvP';
  groupCreator: string;
  roles: Array<{
    id: string;
    type: 'Coleta' | 'Ataque';
    isOwner: boolean;
    playerName?: string;
  }>;
  playerEmail: string;
  playerNickname: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface GroupMember {
  id: string;
  nickname: string;
  gameId: string;
  level: string;
  proposedRole: 'Coleta' | 'Ataque';
  status: 'interested' | 'selected' | 'rejected';
  joinedAt: Date;
}

export interface ActiveGroup {
  id: string;
  groupName: string;
  objective: 'Coleta' | 'PvP';
  creator: string;
  roles: Array<{
    id: string;
    type: 'Coleta' | 'Ataque';
    isOwner: boolean;
    playerName?: string;
    filled: boolean;
  }>;
  members: GroupMember[];
  waitingList: GroupMember[];
  createdAt: Date;
  isActive: boolean;
}