import React from 'react';
import { Trophy, Star, MessageCircle } from 'lucide-react';

interface ReputationCardProps {
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

export const ReputationCard: React.FC<ReputationCardProps> = ({ reputation }) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
        <h3 className="text-xl font-bold text-orange-200 flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-orange-400" />
          Reputação Pública
        </h3>

        {reputation.totalRatings > 0 ? (
          <div className="space-y-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-900/30 p-3 rounded-lg text-center border border-amber-500/30">
                <div className="flex items-center justify-center mb-1">
                  {renderStars(reputation.averageRating)}
                </div>
                <div className="text-lg font-bold text-amber-300">
                  {reputation.averageRating.toFixed(1)}
                </div>
                <div className="text-xs text-amber-200">Média</div>
              </div>
              
              <div className="bg-blue-900/30 p-3 rounded-lg text-center border border-blue-500/30">
                <div className="text-lg font-bold text-blue-300">
                  {reputation.totalRatings}
                </div>
                <div className="text-xs text-blue-200">Avaliações</div>
              </div>
            </div>

            {/* Comentários recentes */}
            {reputation.recentComments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-orange-200 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comentários Recentes
                </h4>
                <div className="space-y-2">
                  {reputation.recentComments.map((comment, index) => (
                    <div key={index} className="bg-black/30 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-orange-300 text-sm font-medium">
                          {comment.fromNickname}
                        </span>
                        <div className="flex">
                          {Array.from({ length: comment.stars }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-orange-100/90 text-sm italic">"{comment.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Ver Perfil */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              Ver Perfil Público
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Star className="w-12 h-12 text-orange-400/50 mx-auto mb-4" />
            <p className="text-orange-100/80 mb-2">Ainda não há avaliações</p>
            <p className="text-orange-300/60 text-sm">
              Participe de expedições para construir sua reputação
            </p>
          </div>
        )}
      </div>
    </div>
  );
};