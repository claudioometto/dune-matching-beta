import React, { useState } from 'react';
import { Mail, Copy, CheckCircle, MessageCircle, Zap, Shield } from 'lucide-react';

export const ContactButton: React.FC = () => {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const email = 'claudio.ometto10@gmail.com';

  const handleContactClick = () => {
    setShowEmail(true);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCloseModal = () => {
    setShowEmail(false);
    setCopied(false);
  };

  return (
    <>
      {/* Botão Principal - Inspirado no universo Dune */}
      <button
        onClick={handleContactClick}
        title="Conectar-se com os Guardiões do Deep Desert"
        className="fixed bottom-6 right-6 z-40 group relative overflow-hidden"
      >
        {/* Efeito de energia/brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition-opacity duration-500 animate-pulse"></div>
        
        {/* Anel externo */}
        <div className="absolute inset-0 border-2 border-orange-400/50 rounded-full animate-spin-slow"></div>
        
        {/* Botão principal */}
        <div className="relative bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500 text-white px-5 py-4 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 flex items-center gap-3 font-bold text-sm border-2 border-orange-400/50">
          
          {/* Ícone com efeito especial */}
          <div className="relative">
            <Shield className="w-6 h-6 relative z-10" />
            <div className="absolute inset-0 bg-white/30 rounded-full blur-sm group-hover:bg-white/50 transition-all duration-300"></div>
          </div>
          
          <span className="hidden sm:inline relative z-10 tracking-wide">
            CONECTAR
          </span>
          
          {/* Efeito de partículas */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
        </div>
      </button>

      {/* Modal épico */}
      {showEmail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-md mx-4">
            {/* Efeito de brilho do modal */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-xl opacity-50"></div>
            
            {/* Modal principal */}
            <div className="relative bg-gradient-to-br from-gray-900 via-orange-900/20 to-amber-900/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-orange-500/30">
              
              {/* Header épico */}
              <div className="text-center mb-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-orange-600 to-yellow-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-200 to-amber-300 bg-clip-text text-transparent mb-2 tracking-wide">
                  CANAL DE COMUNICAÇÃO
                </h3>
                <p className="text-orange-200/80 text-sm tracking-wider">
                  Conecte-se com os Guardiões do Deep Desert
                </p>
              </div>
              
              {/* E-mail section */}
              <div className="bg-black/40 rounded-xl p-6 mb-6 border border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-orange-100 font-medium break-all text-sm">{email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className={`ml-3 p-3 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                      copied 
                        ? 'bg-green-600/80 text-green-100 shadow-lg shadow-green-500/30' 
                        : 'bg-orange-600/80 text-orange-100 hover:bg-orange-500/80 shadow-lg shadow-orange-500/30'
                    }`}
                    title={copied ? 'Transmissão copiada!' : 'Copiar canal de comunicação'}
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {copied && (
                  <div className="flex items-center gap-2 text-green-300 text-sm animate-fade-in">
                    <Zap className="w-4 h-4" />
                    <span className="tracking-wide">Canal copiado para transmissão!</span>
                  </div>
                )}
              </div>
              
              {/* Botão fechar épico */}
              <div className="flex justify-center">
                <button
                  onClick={handleCloseModal}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 py-3 px-8 rounded-lg font-bold tracking-wide transition-all duration-300 transform hover:scale-105 border border-gray-600/50 shadow-lg"
                >
                  ENCERRAR TRANSMISSÃO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};