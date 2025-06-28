import React, { useState } from 'react';
import { Shield, Mail, Lock, UserPlus, LogIn, AlertCircle, Key } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { ResetPasswordModal } from './ResetPasswordModal';

export const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const { signIn, signUp } = useAuth();

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validações
    if (!email || !password) {
      setError('Todos os campos são obrigatórios');
      setLoading(false);
      return;
    }

    if (!isLogin && !validatePassword(password)) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha inválidos');
          } else {
            setError(error.message);
          }
        }
      } else {
        // Cadastro
        const { error } = await signUp(email, password);
        
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('E-mail já cadastrado. Deseja redefinir a senha?');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Efeito de brilho do container */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
        
        {/* Container principal */}
        <div className="relative bg-black/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-500/40">
          
          {/* Header épico */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-2 tracking-wide">
              {isLogin ? 'ACESSO AUTORIZADO' : 'NOVO REGISTRO'}
            </h1>
            <p className="text-orange-100/80 text-sm tracking-wide">
              {isLogin ? 'Entre no sistema imperial' : 'Junte-se aos guerreiros do deserto'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="group">
              <label className="block text-sm font-bold text-orange-200 mb-2 tracking-wider uppercase">
                Canal de Comunicação *
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

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-bold text-orange-200 mb-2 tracking-wider uppercase">
                Código de Acesso *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-black/30 border-2 border-orange-500/30 rounded-xl text-orange-100 placeholder-orange-300/50 focus:ring-2 focus:ring-orange-500 focus:border-orange-400 transition-all duration-300 backdrop-blur-sm group-hover:border-orange-400/50"
                  placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                />
              </div>
              {!isLogin && (
                <p className="text-orange-300/70 text-xs mt-1">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 text-sm">{error}</p>
                  {error.includes('E-mail já cadastrado') && (
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="text-red-300 hover:text-red-200 text-xs underline mt-1"
                    >
                      Redefinir senha
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-200 text-sm">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-xl blur-lg opacity-60 group-hover:opacity-90 transition-opacity duration-500 animate-pulse"></div>
              
              <div className={`relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500 text-white py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 transform group-hover:scale-105 shadow-2xl border-2 border-orange-400/50 flex items-center justify-center gap-3 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}>
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                    <span>{isLogin ? 'ACESSAR SISTEMA' : 'REGISTRAR-SE'}</span>
                  </>
                )}
              </div>
            </button>

            {/* Forgot password link */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-orange-300 hover:text-orange-200 text-sm tracking-wide transition-colors flex items-center gap-1 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {/* Toggle mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-orange-300 hover:text-orange-200 text-sm tracking-wide transition-colors"
              >
                {isLogin ? 'Não possui acesso? Registre-se' : 'Já possui acesso? Entre'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <ResetPasswordModal
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
};