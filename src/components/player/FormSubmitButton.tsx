import React from 'react';
import { Zap, Shield } from 'lucide-react';

interface FormSubmitButtonProps {
  onClick?: () => void;
  loading?: boolean;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({ onClick, loading = false }) => {
  return (
    <div className="flex justify-center pt-8">
      <button
        type="submit"
        onClick={onClick}
        disabled={loading}
        className="group relative overflow-hidden"
      >
        {/* Efeito de energia */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity duration-500 animate-pulse"></div>
        
        {/* Botão principal */}
        <div className={`relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500 text-white px-12 py-5 rounded-xl font-bold text-xl tracking-wider transition-all duration-300 transform group-hover:scale-105 shadow-2xl border-2 border-orange-400/50 flex items-center gap-4 ${
          loading ? 'opacity-75 cursor-not-allowed' : ''
        }`}>
          
          {loading ? (
            <>
              <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>PROCESSANDO...</span>
              <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </>
          ) : (
            <>
              <Shield className="w-7 h-7" />
              <span>ATIVAR REGISTRO</span>
              <Zap className="w-7 h-7" />
            </>
          )}
          
          {/* Efeito de partículas */}
          {!loading && (
            <>
              <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-orange-300 rounded-full animate-pulse delay-500"></div>
            </>
          )}
        </div>
      </button>
    </div>
  );
};