import React from 'react';
import { User, Mail, Calendar, CheckCircle, Shield } from 'lucide-react';
import { PlayerData, FormErrors } from '../../types/player';
import { FieldError } from './FieldError';

interface BasicInfoSectionProps {
  formData: PlayerData;
  gameIdLocked: boolean;
  isEditMode: boolean;
  errors: FormErrors;
  onInputChange: (field: keyof PlayerData, value: any) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  gameIdLocked,
  isEditMode,
  errors,
  onInputChange
}) => {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-orange-300 to-amber-400 bg-clip-text mb-8 flex items-center gap-3 tracking-wide">
        <Shield className="w-8 h-8 text-orange-400" />
        IDENTIDADE DO GUERREIRO
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Nickname */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Nome de Guerra *
            {isEditMode && (
              <span className="text-xs text-red-400 ml-2 normal-case">
                (Bloqueado no modo edição)
              </span>
            )}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => onInputChange('nickname', e.target.value)}
              disabled={isEditMode}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 placeholder-orange-300/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                isEditMode ? 'bg-gray-900/50 border-gray-500/50 cursor-not-allowed text-gray-400' : ''
              } ${errors.nickname ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'}`}
              placeholder="Seu nome nas areias de Arrakis"
            />
          </div>
          {errors.nickname && <FieldError message={errors.nickname} />}
        </div>

        {/* Game ID */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Código de Identificação * 
            {(gameIdLocked || isEditMode) && (
              <span className="text-xs text-green-400 ml-2 normal-case">
                (Selado permanentemente)
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.gameId}
              onChange={(e) => onInputChange('gameId', e.target.value)}
              disabled={gameIdLocked || isEditMode}
              className={`w-full px-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 placeholder-orange-300/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                (gameIdLocked || isEditMode) ? 'bg-green-900/20 border-green-500/50 cursor-not-allowed' : ''
              } ${errors.gameId ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'}`}
              placeholder="ID único no sistema imperial"
            />
            {(gameIdLocked || isEditMode) && (
              <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-green-400" />
            )}
          </div>
          {errors.gameId && <FieldError message={errors.gameId} />}
        </div>

        {/* Email */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Canal de Comunicação *
            <span className="text-xs text-green-400 ml-2 normal-case">
              (Protegido pela autenticação)
            </span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <input
              type="email"
              value={formData.email}
              disabled={true}
              className="w-full pl-12 pr-4 py-4 bg-green-900/20 border-2 border-green-500/50 rounded-xl text-green-100 cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
              placeholder="seu@canal.comunicacao"
            />
            <CheckCircle className="absolute right-4 top-4 w-5 h-5 text-green-400" />
          </div>
          {errors.email && <FieldError message={errors.email} />}
        </div>

        {/* Age */}
        <div className="group">
          <label className="block text-sm font-bold text-orange-200 mb-3 tracking-wider uppercase">
            Ciclos de Vida *
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
            <input
              type="number"
              value={formData.age}
              onChange={(e) => onInputChange('age', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 bg-black/30 border-2 rounded-xl text-orange-100 placeholder-orange-300/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm ${
                errors.age ? 'border-red-500' : 'border-orange-500/30 group-hover:border-orange-400/50'
              }`}
              placeholder="Idade em anos terrestres"
              min="13"
              max="100"
            />
          </div>
          {errors.age && <FieldError message={errors.age} />}
        </div>
      </div>
    </div>
  );
};