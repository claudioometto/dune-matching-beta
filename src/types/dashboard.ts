export interface DashboardData {
  player: {
    nickname: string;
    gameId: string;
    level: number;
    hasDeepDesertBase: boolean;
    baseSector?: string;
    interests: string[];
  } | null;
  
  currentGroup: {
    id: string;
    name: string;
    objective: 'Coleta' | 'PvP';
    role: 'leader' | 'member';
    timeRemaining: number;
    memberCount: number;
    maxMembers: number;
  } | null;
  
  recentNotifications: Array<{
    id: string;
    type: 'invitation' | 'acceptance' | 'rejection';
    message: string;
    createdAt: Date;
  }>;
  
  pendingRatings: Array<{
    groupId: string;
    groupName: string;
    playersToRate: Array<{
      id: string;
      nickname: string;
    }>;
    timeRemaining: number;
  }>;
  
  reputation: {
    averageRating: number;
    totalRatings: number;
    recentComments: Array<{
      comment: string;
      stars: number;
      fromNickname: string;
    }>;
  };
}

export interface DesertQuote {
  text: string;
  author?: string;
}