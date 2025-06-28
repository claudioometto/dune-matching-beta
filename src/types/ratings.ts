export interface PlayerRating {
  fromNickname: string;
  toNickname: string;
  groupId: string;
  stars: number; // 1 a 5
  comment?: string;
  createdAt: Date;
}

export interface RatingFormData {
  [playerNickname: string]: {
    stars: number;
    comment: string;
    submitted: boolean;
  };
}

export interface PlayerProfileData {
  nickname: string;
  gameId: string;
  averageRating: number;
  totalRatings: number;
  recentComments: Array<{
    comment: string;
    stars: number;
    fromNickname: string;
    createdAt: Date;
  }>;
}

export interface CompletedGroup {
  id: string;
  groupName: string;
  objective: 'Coleta' | 'PvP';
  completedAt: Date;
  members: Array<{
    nickname: string;
    gameId: string;
    role: 'Coleta' | 'Ataque';
  }>;
  canRate: boolean; // Se ainda está no prazo de 30 minutos
  currentPlayerNickname: string; // Para saber quem não pode se autoavaliar
}