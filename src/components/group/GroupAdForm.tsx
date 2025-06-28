import React from 'react';
import { Users, Swords, AlertTriangle, Clock } from 'lucide-react';
import { useGroupAdForm } from '../../hooks/useGroupAdForm';
import { GroupBasicInfoSection } from './GroupBasicInfoSection';
import { GroupRolesSection } from './GroupRolesSection';
import { GroupFiltersSection } from './GroupFiltersSection';
import { GroupSubmitButton } from './GroupSubmitButton';

export const GroupAdForm: React.FC = () => {
  const {
    formData,
    errors,
    loading,
    hasActiveGroup,
    checkingActiveGroup,
    blockReason,
    handleInputChange,
    handleRoleChange,
    handleFilterInterestToggle,
    handleFilterToolToggle,
    handleSubmit
  } = useGroupAdForm();

  // Loading state enquanto verifica grupos ativos
  if (checkingActiveGroup) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Verificando grupos ativos...</p>
        </div>
      </div>
    );
  }

  // Se já tem grupo ativo, mostrar mensagem de bloqueio
  if (hasActiveGroup) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 rounded-full flex items-center justify-center border-2 border-red-400/50 shadow-2xl">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-200 via-orange-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
              GRUPO ATIVO DETECTADO
            </h1>
            <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
              Você já possui participação ativa no sistema imperial. Resolva sua situação atual antes de formar uma nova aliança.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-red-500/40">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-400/50">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-200 mb-4 tracking-wide">
                  PARTICIPAÇÃO ATIVA DETECTADA
                </h3>
                <p className="text-red-100/80 mb-8 text-lg">
                  {blockReason}
                </p>
                <div className="bg-red-900/30 p-6 rounded-xl border border-red-500/30 mb-6">
                  <p className="text-sm text-red-200 tracking-wide">
                    ⚔️ <strong>Instrução:</strong> Vá para a aba "Meu Grupo" para gerenciar sua situação atual.
                  </p>
                </div>

                {/* Informações sobre limite de tempo */}
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <h4 className="font-bold text-orange-200">Sistema de Expiração Automática</h4>
                  </div>
                  <p className="text-sm text-orange-200 tracking-wide">
                    🕐 <strong>Lembrete:</strong> Todos os grupos são automaticamente encerrados após 6 horas de criação. 
                    Grupos lotados (4/4 membros) também não aparecem mais na listagem pública.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background overlay específico */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header épico */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
            
            {/* Ícone principal */}
            <div className="relative w-full h-full bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-2xl">
              <Swords className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            FORMAR ALIANÇA
          </h1>
          <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
            Reúna guerreiros dignos para expedições no Deep Desert. Defina critérios e encontre 
            companheiros que compartilhem sua visão de conquista.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Efeito de brilho do container */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
            
            {/* Container principal */}
            <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-orange-500/40">
              
              <GroupBasicInfoSection
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
              />

              <GroupRolesSection
                formData={formData}
                errors={errors}
                onRoleChange={handleRoleChange}
              />

              <GroupFiltersSection
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                onFilterInterestToggle={handleFilterInterestToggle}
                onFilterToolToggle={handleFilterToolToggle}
              />

              <GroupSubmitButton loading={loading} />
            </div>
          </div>
        </form>

        {/* Footer épico com informações importantes */}
        <div className="text-center text-orange-100/80 mt-12 space-y-4">
          <p className="text-sm tracking-wide drop-shadow-md">
            ⚔️ Após formar a aliança, guerreiros poderão se candidatar através da aba "Explorar Grupos" ⚔️
          </p>
          
          {/* Informações sobre regras */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30">
              <h4 className="font-bold text-orange-200 mb-3 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Regras do Sistema Imperial
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-orange-200">
                <div>
                  <p>🕐 <strong>Expiração:</strong> Grupos são encerrados automaticamente após 6 horas</p>
                  <p>👥 <strong>Limite:</strong> Máximo 4 membros por expedição</p>
                </div>
                <div>
                  <p>🔒 <strong>Exclusividade:</strong> Apenas 1 grupo ativo por guerreiro</p>
                  <p>🚫 <strong>Visibilidade:</strong> Grupos lotados não aparecem na listagem</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};