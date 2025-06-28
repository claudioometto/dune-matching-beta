import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { groupService } from '../../services/groupService';
import { playerService } from '../../services/playerService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const DiagnosticPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];

    // 1. Verificar configuração do Supabase
    try {
      const supabaseConfigured = isSupabaseConfigured();
      results.push({
        name: 'Configuração Supabase',
        status: supabaseConfigured ? 'success' : 'error',
        message: supabaseConfigured ? 'Supabase configurado corretamente' : 'Supabase não configurado',
        details: {
          url: !!import.meta.env.VITE_SUPABASE_URL,
          key: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
    } catch (error) {
      results.push({
        name: 'Configuração Supabase',
        status: 'error',
        message: 'Erro ao verificar configuração',
        details: error
      });
    }

    // 2. Verificar autenticação
    try {
      results.push({
        name: 'Autenticação',
        status: user ? 'success' : 'warning',
        message: user ? `Usuário autenticado: ${user.email}` : 'Usuário não autenticado',
        details: {
          userId: user?.id,
          email: user?.email,
          authenticated: !!user
        }
      });
    } catch (error) {
      results.push({
        name: 'Autenticação',
        status: 'error',
        message: 'Erro ao verificar autenticação',
        details: error
      });
    }

    // 3. Testar conexão com banco
    try {
      const connectionTest = await groupService.testConnection();
      results.push({
        name: 'Conexão Banco de Dados',
        status: connectionTest.success ? 'success' : 'error',
        message: connectionTest.success ? 'Conexão com banco OK' : 'Falha na conexão com banco',
        details: connectionTest.error
      });
    } catch (error) {
      results.push({
        name: 'Conexão Banco de Dados',
        status: 'error',
        message: 'Erro ao testar conexão',
        details: error
      });
    }

    // 4. Verificar dados do jogador
    if (user?.id) {
      try {
        const { data: playerData, error } = await playerService.getPlayerByUserId(user.id);
        results.push({
          name: 'Dados do Jogador',
          status: playerData ? 'success' : 'warning',
          message: playerData ? `Jogador encontrado: ${playerData.nickname}` : 'Jogador não cadastrado',
          details: { playerData, error }
        });
      } catch (error) {
        results.push({
          name: 'Dados do Jogador',
          status: 'error',
          message: 'Erro ao buscar dados do jogador',
          details: error
        });
      }
    }

    // 5. Testar busca de convites
    if (user?.id) {
      try {
        const { data: invitations, error } = await groupService.getPlayerInvitations(user.id);
        results.push({
          name: 'Sistema de Convites',
          status: error ? 'error' : 'success',
          message: error ? `Erro ao buscar convites: ${error.message}` : `${invitations?.length || 0} convites encontrados`,
          details: { invitations, error }
        });
      } catch (error) {
        results.push({
          name: 'Sistema de Convites',
          status: 'error',
          message: 'Erro ao testar sistema de convites',
          details: error
        });
      }
    }

    // 6. Verificar grupos ativos
    if (user?.id) {
      try {
        const { data: userGroups, error } = await groupService.getUserGroups(user.id);
        results.push({
          name: 'Grupos do Usuário',
          status: error ? 'error' : 'success',
          message: error ? `Erro ao buscar grupos: ${error.message}` : `${userGroups?.length || 0} grupos encontrados`,
          details: { userGroups, error }
        });
      } catch (error) {
        results.push({
          name: 'Grupos do Usuário',
          status: 'error',
          message: 'Erro ao testar busca de grupos',
          details: error
        });
      }
    }

    setDiagnostics(results);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && diagnostics.length === 0) {
      runDiagnostics();
    }
  }, [isOpen]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-900/20';
      case 'error':
        return 'border-red-500/30 bg-red-900/20';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-900/20';
    }
  };

  // Só mostrar em desenvolvimento ou quando há problemas
  const shouldShow = process.env.NODE_ENV === 'development' || 
                    diagnostics.some(d => d.status === 'error');

  if (!shouldShow) return null;

  return (
    <>
      {/* Botão de diagnóstico */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Diagnóstico do Sistema"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Modal de diagnóstico */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative max-w-4xl mx-4 w-full max-h-[90vh] overflow-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-50"></div>
            
            <div className="relative bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-blue-500/30">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-200">Diagnóstico do Sistema</h3>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={runDiagnostics}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </button>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-blue-200">Executando diagnósticos...</p>
                </div>
              )}

              {/* Results */}
              {!loading && diagnostics.length > 0 && (
                <div className="space-y-4">
                  {diagnostics.map((diagnostic, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}>
                      <div className="flex items-start gap-3">
                        {getStatusIcon(diagnostic.status)}
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{diagnostic.name}</h4>
                          <p className="text-sm text-gray-300 mb-2">{diagnostic.message}</p>
                          
                          {diagnostic.details && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                                Ver detalhes
                              </summary>
                              <pre className="mt-2 p-2 bg-black/30 rounded text-gray-300 overflow-auto">
                                {JSON.stringify(diagnostic.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {!loading && diagnostics.length > 0 && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Resumo</h4>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-400">
                      ✅ {diagnostics.filter(d => d.status === 'success').length} OK
                    </span>
                    <span className="text-yellow-400">
                      ⚠️ {diagnostics.filter(d => d.status === 'warning').length} Avisos
                    </span>
                    <span className="text-red-400">
                      ❌ {diagnostics.filter(d => d.status === 'error').length} Erros
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};