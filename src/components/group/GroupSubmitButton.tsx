import React from 'react';
import { Send, Swords } from 'lucide-react';

interface GroupSubmitButtonProps {
  onClick?: () => void;
  loading?: boolean;
}

export const GroupSubmitButton: React.FC<GroupSubmitButtonProps> = ({ onClick, loading = false }) => {
  return (
    <div className="flex justify-center pt-6">
      <button
        type="submit"
        onClick={onClick}
        disabled={loading}
        className="group relative overflow-hidden"
      >
        {/* Efeito de energia */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity duration-500 animate-pulse"></div>
        
        {/* Botão principal */}
        <div className={`relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 transform group-hover:scale-105 shadow-2xl border-2 border-orange-400/50 flex items-center gap-3 ${
          loading ? 'opacity-75 cursor-not-allowed' : ''
        }`}>
          
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>FORMANDO ALIANÇA...</span>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </>
          ) : (
            <>
              <Swords className="w-5 h-5" />
              <span>FORMAR ALIANÇA</span>
              <Send className="w-5 h-5" />
            </>
          )}
        </div>
      </button>
    </div>
  );
};