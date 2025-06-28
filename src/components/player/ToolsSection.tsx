import React from 'react';
import { Pickaxe, Gem } from 'lucide-react';
import { PlayerData, FormErrors } from '../../types/player';
import { TOOL_TIERS } from '../../constants/gameData';
import { FieldError } from './FieldError';

interface ToolsSectionProps {
  formData: PlayerData;
  errors: FormErrors;
  onInputChange: (field: keyof PlayerData, value: any) => void;
}

export const ToolsSection: React.FC<ToolsSectionProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-200 to-amber-300 bg-clip-text mb-8 flex items-center gap-3 tracking-wide">
        <Pickaxe className="w-8 h-8 text-orange-300" />
        FERRAMENTAS DE EXTRAÇÃO
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mining Tools */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Extratores de Minério *
          </label>
          <div className="relative">
            <Pickaxe className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <select
              value={formData.miningToolsTier}
              onChange={(e) => onInputChange('miningToolsTier', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.miningToolsTier ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
            >
              <option value="" className="bg-gray-900 text-orange-200">Selecionar tier</option>
              {TOOL_TIERS.map(tier => (
                <option key={tier} value={tier} className="bg-gray-900 text-orange-200">{tier}</option>
              ))}
            </select>
          </div>
          {errors.miningToolsTier && <FieldError message={errors.miningToolsTier} />}
        </div>

        {/* Spice Tools */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Coletores de Especiaria *
          </label>
          <div className="relative">
            <Gem className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <select
              value={formData.spiceToolsTier}
              onChange={(e) => onInputChange('spiceToolsTier', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.spiceToolsTier ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
            >
              <option value="" className="bg-gray-900 text-orange-200">Selecionar tier</option>
              {TOOL_TIERS.map(tier => (
                <option key={tier} value={tier} className="bg-gray-900 text-orange-200">{tier}</option>
              ))}
            </select>
          </div>
          {errors.spiceToolsTier && <FieldError message={errors.spiceToolsTier} />}
        </div>
      </div>
    </div>
  );
};