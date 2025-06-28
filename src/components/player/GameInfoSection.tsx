import React from 'react';
import { Server, Trophy, Zap } from 'lucide-react';
import { PlayerData, FormErrors } from '../../types/player';
import { SERVERS } from '../../constants/gameData';
import { FieldError } from './FieldError';

interface GameInfoSectionProps {
  formData: PlayerData;
  errors: FormErrors;
  onInputChange: (field: keyof PlayerData, value: any) => void;
}

export const GameInfoSection: React.FC<GameInfoSectionProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  // Gerar opções de level de 1 a 200
  const levelOptions = Array.from({ length: 200 }, (_, i) => i + 1);

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-200 to-amber-300 bg-clip-text mb-8 flex items-center gap-3 tracking-wide">
        <Zap className="w-8 h-8 text-orange-300" />
        INFORMAÇÕES DO JOGO
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Server */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Servidor Imperial *
          </label>
          <div className="relative">
            <Server className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <select
              value={formData.server}
              onChange={(e) => onInputChange('server', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.server ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
            >
              <option value="" className="bg-gray-900 text-orange-200">Selecione um servidor</option>
              {SERVERS.map(server => (
                <option key={server} value={server} className="bg-gray-900 text-orange-200">{server}</option>
              ))}
            </select>
          </div>
          {errors.server && <FieldError message={errors.server} />}
        </div>

        {/* Level - Agora com dropdown de 1 a 200 */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Nível de Poder * (1-200)
          </label>
          <div className="relative">
            <Trophy className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <select
              value={formData.level}
              onChange={(e) => onInputChange('level', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.level ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
            >
              <option value="" className="bg-gray-900 text-orange-200">Selecione seu nível</option>
              {levelOptions.map(level => (
                <option key={level} value={level.toString()} className="bg-gray-900 text-orange-200">
                  Nível {level}
                </option>
              ))}
            </select>
          </div>
          {errors.level && <FieldError message={errors.level} />}
        </div>
      </div>
    </div>
  );
};