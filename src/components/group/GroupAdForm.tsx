import React from 'react';
import { Users, Swords } from 'lucide-react';
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
    handleInputChange,
    handleRoleChange,
    handleFilterInterestToggle,
    handleFilterToolToggle,
    handleSubmit
  } = useGroupAdForm();

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

        {/* Footer épico */}
        <div className="text-center text-orange-100/80 mt-12">
          <p className="text-sm tracking-wide drop-shadow-md">
            ⚔️ Após formar a aliança, guerreiros compatíveis receberão convites baseados nos critérios definidos ⚔️
          </p>
        </div>
      </div>
    </div>
  );
};