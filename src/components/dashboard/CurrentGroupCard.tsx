import React from 'react';
import { Users, Clock, Plus, Search, Crown, Shield } from 'lucide-react';

interface CurrentGroupCardProps {
  currentGroup: {
    id: string;
    name: string;
    objective: 'Coleta' | 'PvP';
    role: 'leader' | 'member';
    timeRemaining: number;
    memberCount: number;
    maxMembers: number;
  } | null;
  onCreateGroup: () => void;
  onExploreGroups: () => void;
  onGoToGroup: () => void;
}

export const CurrentGroupCard: React.FC<CurrentGroupCardProps> = ({
  currentGroup,
  onCreateGroup,
  onExploreGroups,
  onGoToGroup
}) => {
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
        <h3 className="text-xl font-bold text-orange-200 flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-orange-400" />
          Participação Atual
        </h3>

        {currentGroup ? (
          <div className="space-y-4">
            {/* Header do grupo */}
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-orange-200 flex items-center gap-2">
                  {currentGroup.role === 'leader' ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Shield className="w-5 h-5 text-blue-400" />
                  )}
                  {currentGroup.name}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentGroup.objective === 'PvP' 
                    ? 'bg-red-900/50 text-red-200' 
                    : 'bg-green-900/50 text-green-200'
                }`}>
                  {currentGroup.objective}
                </span>
              </div>
              
              <div className="text-sm text-orange-300">
                {currentGroup.role === 'leader' ? '👑 Você é o líder' : '🛡️ Você é membro'}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-900/30 p-3 rounded-lg text-center border border-blue-500/30">
                <div className="text-lg font-bold text-blue-300">
                  {currentGroup.memberCount}/{currentGroup.maxMembers}
                </div>
                <div className="text-xs text-blue-200">Membros</div>
              </div>
              
              <div className="bg-orange-900/30 p-3 rounded-lg text-center border border-orange-500/30">
                <div className="text-lg font-bold text-orange-300 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeRemaining(currentGroup.timeRemaining)}
                </div>
                <div className="text-xs text-orange-200">Restante</div>
              </div>
            </div>

            {/* Botão de ação */}
            <button
              onClick={onGoToGroup}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Ir para Meu Grupo
            </button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="text-orange-100/80 mb-6">
              Você não participa de nenhum grupo ativo.
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={onCreateGroup}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar Grupo
              </button>
              
              <button
                onClick={onExploreGroups}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Explorar Grupos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};