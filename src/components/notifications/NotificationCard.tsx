import React from 'react';
import { Users, Target, Clock, Check, X } from 'lucide-react';
import { Invitation } from '../../types/notification';

interface NotificationCardProps {
  invitation: Invitation;
  onAccept: (invitationId: string) => void;
  onReject: (invitationId: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  invitation,
  onAccept,
  onReject
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getObjectiveColor = (objective: string) => {
    return objective === 'PvP' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{invitation.groupName}</h3>
            <p className="text-sm text-gray-600">Criado por {invitation.groupCreator}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          {formatDate(invitation.createdAt)}
        </div>
      </div>

      {/* Objective */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-gray-700">Objetivo:</span>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getObjectiveColor(invitation.groupObjective)}`}>
          {invitation.groupObjective}
        </span>
      </div>

      {/* Roles */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Funções no grupo:</h4>
        <div className="grid grid-cols-2 gap-2">
          {invitation.roles.map((role, index) => (
            <div key={role.id} className="bg-gray-50 p-2 rounded text-sm">
              <span className="font-medium">Slot {index + 1}:</span> {role.type}
              {role.isOwner && <span className="text-amber-600 ml-1">(Criador)</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onAccept(invitation.id)}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Aceitar Convite
        </button>
        
        <button
          onClick={() => onReject(invitation.id)}
          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Rejeitar
        </button>
      </div>
    </div>
  );
};