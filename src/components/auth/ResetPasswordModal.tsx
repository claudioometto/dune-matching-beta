import React, { useState } from 'react';
import { Key, Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ResetPasswordModalProps {
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative max-w-md mx-4 w-full">
        {/* Efeito de brilho do modal */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-xl opacity-50"></div>
        
        {/* Modal principal */}
        <div className="relative bg-gradient-to-br from-gray-900 via-orange-900/20 to-amber-900/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-orange-500/30">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-orange-300 hover:text-orange-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-orange-600 to-yellow-600 rounded-full flex items-center justify-center">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-200 to-amber-300 bg-clip-text text-transparent mb-2 tracking-wide">
                  REDEFINIR SENHA
                </h3>
                <p className="text-orange-200/80 text-sm">
                  Digite seu e-mail para receber instruções
                </p>
              </div>
              
              {/* Form */}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-bold text-orange-200 mb-2 tracking-wider uppercase">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-black/30 border-2 border-orange-500/30 rounded-xl text-orange-100 placeholder-orange-300/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm group-hover:border-orange-400/50"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-green-200 mb-2">
                E-mail Enviado!
              </h3>
              <p className="text-green-300/80 text-sm mb-6">
                Verifique sua caixa de entrada para redefinir sua senha.
              </p>
              
              <button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Entendi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};