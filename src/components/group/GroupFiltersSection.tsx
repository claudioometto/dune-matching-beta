import React from 'react';
import { Filter, Home } from 'lucide-react';
import { GroupAdData, GroupAdErrors } from '../../types/group';
import { 
  MIN_LEVEL_OPTIONS, 
  FILTER_INTERESTS, 
  FILTER_EQUIPMENT_TIERS,
  REQUIRED_TOOLS 
} from '../../constants/groupData';
import { SECTORS } from '../../constants/gameData';
import { FieldError } from '../player/FieldError';

interface GroupFiltersSectionProps {
  formData: GroupAdData;
  errors: GroupAdErrors;
  onInputChange: (field: string, value: any) => void;
  onFilterInterestToggle: (interest: string) => void;
  onFilterToolToggle: (tool: string) => void;
}

export const GroupFiltersSection: React.FC<GroupFiltersSectionProps> = ({
  formData,
  errors,
  onInputChange,
  onFilterInterestToggle,
  onFilterToolToggle
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Filter className="w-6 h-6 text-amber-600" />
        Filtros para Matching (Opcionais)
      </h2>
      
      <div className="space-y-6">
        {/* Level and Interests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level Mínimo
            </label>
            <select
              value={formData.filters.minLevel}
              onChange={(e) => onInputChange('filters.minLevel', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            >
              <option value="">Qualquer level</option>
              {MIN_LEVEL_OPTIONS.map(level => (
                <option key={level} value={level}>Level {level}+</option>
              ))}
            </select>
            {errors['filters.minLevel'] && <FieldError message={errors['filters.minLevel']} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interesses do Jogador
            </label>
            <div className="flex flex-wrap gap-3 pt-2">
              {FILTER_INTERESTS.map(interest => (
                <label key={interest} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.filters.interests.includes(interest)}
                    onChange={() => onFilterInterestToggle(interest)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Tiers */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Equipamentos Mínimos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier Mínimo - Armas
              </label>
              <select
                value={formData.filters.minWeaponTier}
                onChange={(e) => onInputChange('filters.minWeaponTier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="">Qualquer tier</option>
                {FILTER_EQUIPMENT_TIERS.map(tier => (
                  <option key={tier} value={tier}>{tier}+</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier Mínimo - Armadura
              </label>
              <select
                value={formData.filters.minArmorTier}
                onChange={(e) => onInputChange('filters.minArmorTier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="">Qualquer tier</option>
                {FILTER_EQUIPMENT_TIERS.map(tier => (
                  <option key={tier} value={tier}>{tier}+</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier Mínimo - Ornicóptero
              </label>
              <select
                value={formData.filters.minOrnithopterTier}
                onChange={(e) => onInputChange('filters.minOrnithopterTier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="">Qualquer tier</option>
                {FILTER_EQUIPMENT_TIERS.map(tier => (
                  <option key={tier} value={tier}>{tier}+</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deep Desert Base */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-600" />
            Base no Deep Desert
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.filters.requiresDeepDesertBase}
                  onChange={(e) => onInputChange('filters.requiresDeepDesertBase', e.target.checked)}
                  className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-3 text-gray-700">Exigir que o jogador tenha base no Deep Desert</span>
              </label>
            </div>

            {formData.filters.requiresDeepDesertBase && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setor Específico
                </label>
                <select
                  value={formData.filters.specificSector}
                  onChange={(e) => onInputChange('filters.specificSector', e.target.value)}
                  className={`w-full md:w-1/3 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                    errors['filters.specificSector'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Qualquer setor</option>
                  {SECTORS.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                {errors['filters.specificSector'] && <FieldError message={errors['filters.specificSector']} />}
              </div>
            )}
          </div>
        </div>

        {/* Required Tools */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Ferramentas Necessárias</h3>
          <div className="flex flex-wrap gap-4">
            {REQUIRED_TOOLS.map(tool => (
              <label key={tool} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.filters.requiredTools.includes(tool)}
                  onChange={() => onFilterToolToggle(tool)}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="ml-2 text-gray-700">{tool}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-lg">
        <p className="text-sm text-amber-700">
          ⚡ <strong>Matching Inteligente:</strong> Quanto mais filtros você definir, 
          mais específicos serão os jogadores encontrados. Deixe em branco para maior flexibilidade.
        </p>
      </div>
    </div>
  );
};