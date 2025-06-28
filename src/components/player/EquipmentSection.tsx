import React from 'react';
import { Sword, Shield, Zap } from 'lucide-react';
import { PlayerData, FormErrors } from '../../types/player';
import { EQUIPMENT_TIERS } from '../../constants/gameData';
import { FieldError } from './FieldError';

interface EquipmentSectionProps {
  formData: PlayerData;
  errors: FormErrors;
  onInputChange: (field: keyof PlayerData, value: any) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-200 to-amber-300 bg-clip-text mb-8 flex items-center gap-3 tracking-wide">
        <Sword className="w-8 h-8 text-orange-300" />
        EQUIPAMENTOS DE GUERRA
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weapon Tier */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Arsenal de Combate *
          </label>
          <div className="relative">
            <Sword className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <select
              value={formData.weaponTier}
              onChange={(e) => onInputChange('weaponTier', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.weaponTier ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
            >
              <option value="" className="bg-gray-900 text-orange-200">Selecionar tier</option>
              {EQUIPMENT_TIERS.map(tier => (
                <option key={tier} value={tier} className="bg-gray-900 text-orange-200">{tier}</option>
              ))}
            </select>
          </div>
          {errors.weaponTier && <FieldError message={errors.weaponTier} />}
        </div>

        {/* Armor Tier */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Proteção Corporal *
          </label>
          <div className="relative">
            <Shield className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <select
              value={formData.armorTier}
              onChange={(e) => onInputChange('armorTier', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.armorTier ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
            >
              <option value="" className="bg-gray-900 text-orange-200">Selecionar tier</option>
              {EQUIPMENT_TIERS.map(tier => (
                <option key={tier} value={tier} className="bg-gray-900 text-orange-200">{tier}</option>
              ))}
            </select>
          </div>
          {errors.armorTier && <FieldError message={errors.armorTier} />}
        </div>

        {/* Ornithopter Tier */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Ornicóptero *
          </label>
          <div className="relative">
            <Zap className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <select
              value={formData.ornithopterTier}
              onChange={(e) => onInputChange('ornithopterTier', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.ornithopterTier ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
            >
              <option value="" className="bg-gray-900 text-orange-200">Selecionar tier</option>
              {EQUIPMENT_TIERS.map(tier => (
                <option key={tier} value={tier} className="bg-gray-900 text-orange-200">{tier}</option>
              ))}
            </select>
          </div>
          {errors.ornithopterTier && <FieldError message={errors.ornithopterTier} />}
        </div>
      </div>
    </div>
  );
};