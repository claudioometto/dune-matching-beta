import React from 'react';
import { Target, Swords } from 'lucide-react';
import { PlayerData, FormErrors } from '../../types/player';
import { INTEREST_OPTIONS } from '../../constants/gameData';
import { FieldError } from './FieldError';

interface InterestsSectionProps {
  formData: PlayerData;
  errors: FormErrors;
  onInterestToggle: (interest: string) => void;
}

export const InterestsSection: React.FC<InterestsSectionProps> = ({
  formData,
  errors,
  onInterestToggle
}) => {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-200 to-amber-300 bg-clip-text mb-8 flex items-center gap-3 tracking-wide">
        <Swords className="w-8 h-8 text-orange-300" />
        ESPECIALIZAÇÃO DE COMBATE *
      </h2>
      
      <div className="flex flex-wrap gap-6">
        {INTEREST_OPTIONS.map(interest => (
          <label key={interest} className="group flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={() => onInterestToggle(interest)}
                className="sr-only"
              />
              <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 ${
                formData.interests.includes(interest)
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-400 shadow-lg shadow-orange-500/50'
                  : 'border-orange-400/50 group-hover:border-orange-400'
              }`}>
                {formData.interests.includes(interest) && (
                  <Target className="w-4 h-4 text-white m-0.5" />
                )}
              </div>
            </div>
            <span className="ml-4 text-orange-100 font-bold text-lg tracking-wide group-hover:text-orange-200 transition-colors">
              {interest === 'Coleta' ? '🏜️ COLETA DE RECURSOS' : '⚔️ COMBATE PVP'}
            </span>
          </label>
        ))}
      </div>
      {errors.interests && <FieldError message={errors.interests} />}
    </div>
  );
};