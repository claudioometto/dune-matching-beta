import React from 'react';
import { Shield, Crown } from 'lucide-react';
import { GroupAdData, GroupAdErrors } from '../../types/group';
import { ROLE_TYPES } from '../../constants/groupData';
import { FieldError } from '../player/FieldError';

interface GroupRolesSectionProps {
  formData: GroupAdData;
  errors: GroupAdErrors;
  onRoleChange: (roleId: string, newType: 'Coleta' | 'Ataque') => void;
}

export const GroupRolesSection: React.FC<GroupRolesSectionProps> = ({
  formData,
  errors,
  onRoleChange
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Shield className="w-6 h-6 text-amber-600" />
        Funções no Grupo (Máximo 4 membros)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.roles.map((role, index) => (
          <div key={role.id} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700 flex items-center gap-2">
                {role.isOwner && <Crown className="w-4 h-4 text-amber-600" />}
                Slot {index + 1}
                {role.isOwner && ' (Você - Líder)'}
              </span>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Função:
              </label>
              <select
                value={role.type}
                onChange={(e) => onRoleChange(role.id, e.target.value as 'Coleta' | 'Ataque')}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                  role.isOwner ? 'bg-amber-50 border-amber-200' : 'border-gray-300'
                }`}
              >
                {ROLE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              {role.isOwner && (
                <p className="text-xs text-amber-600">
                  Como líder, você pode escolher qualquer função
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {errors.roles && <FieldError message={errors.roles} />}
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Dica:</strong> O líder (você) pode escolher qualquer função. Defina as funções que você precisa no grupo. 
          O sistema encontrará jogadores compatíveis com base nos filtros abaixo.
        </p>
      </div>
    </div>
  );
};