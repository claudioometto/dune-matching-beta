import React from 'react';
import { User, Trophy, Home, Target, Edit } from 'lucide-react';

interface PlayerStatusCardProps {
  player: {
    nickname: string;
    gameId: string;
    level: number;
    hasDeepDesertBase: boolean;
    baseSector?: string;
    interests: string[];
  };
  onEditProfile: () => void;
}

export const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ player, onEditProfile }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-orange-200 flex items-center gap-2">
            <User className="w-6 h-6 text-orange-400" />
            Status do Guerreiro
          </h3>
          <button
            onClick={onEditProfile}
            className="bg-blue-600/80 hover:bg-blue-500/80 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar Perfil
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar e Nome */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center border-2 border-orange-400/50">
              <span className="text-white text-xl font-bold">
                {player.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-orange-200">{player.nickname}</h4>
              <p className="text-orange-300/80 text-sm">ID: {player.gameId || 'Não informado'}</p>
            </div>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-orange-200 font-medium">Nível de Poder</span>
                <div className="text-amber-300 font-bold">{player.level}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
              <Home className="w-5 h-5 text-orange-400" />
              <div>
                <span className="text-orange-200 font-medium">Base no Deep Desert</span>
                <div className="text-orange-300">
                  {player.hasDeepDesertBase 
                    ? `✅ Setor ${player.baseSector || 'Não especificado'}`
                    : '❌ Não possui'
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg">
              <Target className="w-5 h-5 text-orange-400" />
              <div>
                <span className="text-orange-200 font-medium">Especialização</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {player.interests.map(interest => (
                    <span 
                      key={interest}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        interest === 'PvP' 
                          ? 'bg-red-900/50 text-red-200' 
                          : 'bg-green-900/50 text-green-200'
                      }`}
                    >
                      {interest === 'PvP' ? '⚔️ PvP' : '🏜️ Coleta'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};