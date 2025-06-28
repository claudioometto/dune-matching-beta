import React from 'react';
import { Users, Target } from 'lucide-react';
import { GroupAdData, GroupAdErrors } from '../../types/group';
import { GROUP_OBJECTIVES } from '../../constants/groupData';
import { FieldError } from '../player/FieldError';

interface GroupBasicInfoSectionProps {
  formData: GroupAdData;
  errors: GroupAdErrors;
  onInputChange: (field: string, value: any) => void;
}

export const GroupBasicInfoSection: React.FC<GroupBasicInfoSectionProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-amber-600" />
        Informações do Grupo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Grupo *
          </label>
          <input
            type="text"
            value={formData.groupName}
            onChange={(e) => onInputChange('groupName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
              errors.groupName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Farm noturno G5, PvP defensivo em I3"
          />
          {errors.groupName && <FieldError message={errors.groupName} />}
        </div>

        {/* Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objetivo do Grupo *
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              value={formData.objective}
              onChange={(e) => onInputChange('objective', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                errors.objective ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione o objetivo</option>
              {GROUP_OBJECTIVES.map(objective => (
                <option key={objective} value={objective}>{objective}</option>
              ))}
            </select>
          </div>
          {errors.objective && <FieldError message={errors.objective} />}
        </div>
      </div>
    </div>
  );
};