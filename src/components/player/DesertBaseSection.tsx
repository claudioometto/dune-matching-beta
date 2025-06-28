import React from 'react';
import { Home, MapPin } from 'lucide-react';
import { PlayerData, FormErrors } from '../../types/player';
import { SECTORS } from '../../constants/gameData';
import { FieldError } from './FieldError';

interface DesertBaseSectionProps {
  formData: PlayerData;
  errors: FormErrors;
  onInputChange: (field: keyof PlayerData, value: any) => void;
}

export const DesertBaseSection: React.FC<DesertBaseSectionProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-200 to-amber-300 bg-clip-text mb-8 flex items-center gap-3 tracking-wide">
        <Home className="w-8 h-8 text-orange-300" />
        FORTALEZA NO DEEP DESERT
      </h2>
      
      <div className="space-y-6">
        <div className="bg-black/20 p-6 rounded-xl border border-orange-500/30">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.hasDeepDesertBase}
                onChange={(e) => onInputChange('hasDeepDesertBase', e.target.checked)}
                className="sr-only"
              />
              <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 ${
                formData.hasDeepDesertBase
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-400 shadow-lg shadow-orange-500/50'
                  : 'border-orange-400/50 group-hover:border-orange-400'
              }`}>
                {formData.hasDeepDesertBase && (
                  <Home className="w-4 h-4 text-white m-0.5" />
                )}
              </div>
            </div>
            <span className="ml-4 text-orange-100 font-bold text-lg tracking-wide group-hover:text-orange-200 transition-colors">
              🏛️ POSSUO FORTALEZA NO DEEP DESERT
            </span>
          </label>
        </div>

        {formData.hasDeepDesertBase && (
          <div className="group">
            <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
              Setor da Fortaleza *
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
              <select
                value={formData.baseSector}
                onChange={(e) => onInputChange('baseSector', e.target.value)}
                className={`w-full md:w-1/2 pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                  errors.baseSector ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
                }`}
              >
                <option value="" className="bg-gray-900 text-orange-200">Selecionar setor</option>
                {SECTORS.map(sector => (
                  <option key={sector} value={sector} className="bg-gray-900 text-orange-200">{sector}</option>
                ))}
              </select>
            </div>
            {errors.baseSector && <FieldError message={errors.baseSector} />}
          </div>
        )}
      </div>
    </div>
  );
};