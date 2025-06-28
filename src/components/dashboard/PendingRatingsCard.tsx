import React from 'react';
import { Star, Clock, Users } from 'lucide-react';

interface PendingRatingsCardProps {
  pendingRatings: Array<{
    groupId: string;
    groupName: string;
    playersToRate: Array<{
      id: string;
      nickname: string;
    }>;
    timeRemaining: number;
  }>;
  onRateNow: (groupId: string) => void;
}

export const PendingRatingsCard: React.FC<PendingRatingsCardProps> = ({
  pendingRatings,
  onRateNow
}) => {
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
        <h3 className="text-xl font-bold text-orange-200 flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-orange-400" />
          Avaliações Pendentes
        </h3>

        {pendingRatings.length > 0 ? (
          <div className="space-y-4">
            {pendingRatings.map(rating => (
              <div key={rating.groupId} className="bg-black/30 p-4 rounded-lg border border-orange-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-orange-200">{rating.groupName}</h4>
                  <div className="flex items-center gap-1 text-orange-300 text-sm">
                    <Clock className="w-4 h-4" />
                    {formatTimeRemaining(rating.timeRemaining)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-sm">
                    {rating.playersToRate.length} guerreiro(s) para avaliar
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {rating.playersToRate.slice(0, 3).map(player => (
                    <span 
                      key={player.id}
                      className="px-2 py-1 bg-orange-900/50 text-orange-200 rounded text-xs"
                    >
                      {player.nickname}
                    </span>
                  ))}
                  {rating.playersToRate.length > 3 && (
                    <span className="px-2 py-1 bg-gray-900/50 text-gray-300 rounded text-xs">
                      +{rating.playersToRate.length - 3} mais
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => onRateNow(rating.groupId)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Avaliar Agora
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-orange-400/50 mx-auto mb-4" />
            <p className="text-orange-100/80">Nenhuma avaliação pendente</p>
            <p className="text-orange-300/60 text-sm mt-1">
              Avaliações aparecerão após grupos serem encerrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};