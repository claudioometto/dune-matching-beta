import React, { useState } from 'react';
import { Star, Users, Clock } from 'lucide-react';

// Componente placeholder para avaliações
export const RatePlayers: React.FC = () => {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-2xl">
              <Star className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            AVALIAR GUERREIROS
          </h1>
          <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
            Sistema de reputação para construir confiança entre os guerreiros do Deep Desert.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
            
            <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-400/50">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-orange-200 mb-4 tracking-wide">
                SISTEMA EM DESENVOLVIMENTO
              </h3>
              <p className="text-orange-100/80 mb-8 text-lg">
                O sistema de avaliações será ativado quando grupos forem encerrados após expedições.
              </p>
              <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30">
                <p className="text-sm text-orange-200 tracking-wide">
                  ⭐ <strong>Em breve:</strong> Avalie seus companheiros de expedição e construa sua reputação no Deep Desert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};