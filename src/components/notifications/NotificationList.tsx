import React, { useState, useEffect } from 'react';
import { Bell, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { NotificationCard } from './NotificationCard';
import { groupService } from '../../services/groupService';
import { useAuth } from '../auth/AuthProvider';
import type { Invitation } from '../../types/notification';

export const NotificationList: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { user } = useAuth();

  // Debug: Log do usuário para verificar autenticação
  console.log('🔍 NotificationList - User:', user);
  console.log('🔍 NotificationList - User ID:', user?.id);
  console.log('🔍 NotificationList - User Email:', user?.email);

  // Carregar convites do usuário
  const loadInvitations = async () => {
    console.log('🔄 Iniciando carregamento de convites...');
    
    if (!user?.id) {
      console.warn('⚠️ User ID não encontrado, interrompendo carregamento');
      setError('Usuário não autenticado corretamente');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('📡 Chamando groupService.getPlayerInvitations com ID:', user.id);
      
      const { data, error: serviceError } = await groupService.getPlayerInvitations(user.id);
      
      console.log('📥 Resposta do serviço:', { data, error: serviceError });
      
      if (serviceError) {
        console.error('❌ Erro no serviço de convites:', serviceError);
        setError(`Erro ao carregar convites: ${serviceError.message || 'Erro desconhecido'}`);
        setDebugInfo({ serviceError, userId: user.id });
        return;
      }

      console.log('📊 Dados brutos recebidos:', data);
      console.log('📊 Quantidade de registros:', data?.length || 0);

      // Converter dados do banco para formato da interface
      const formattedInvitations: Invitation[] = (data || []).map((match, index) => {
        console.log(`🔄 Processando convite ${index + 1}:`, match);
        
        return {
          id: match.id,
          groupName: match.group_ads?.title || 'Grupo sem nome',
          groupObjective: match.group_ads?.resource_target === 'PvP' ? 'PvP' : 'Coleta',
          groupCreator: match.group_ads?.players?.nickname || 'Criador desconhecido',
          roles: (match.group_ads?.roles_needed || []).map((role: string, roleIndex: number) => ({
            id: (roleIndex + 1).toString(),
            type: role as 'Coleta' | 'Ataque',
            isOwner: roleIndex === 0,
            playerName: roleIndex === 0 ? match.group_ads?.players?.nickname : undefined
          })),
          playerEmail: user.email || '',
          playerNickname: '', // Será preenchido quando necessário
          createdAt: new Date(match.created_at),
          status: 'pending'
        };
      });

      console.log('✅ Convites formatados:', formattedInvitations);
      setInvitations(formattedInvitations);
      setDebugInfo({ 
        rawData: data, 
        formattedCount: formattedInvitations.length,
        userId: user.id,
        userEmail: user.email
      });

    } catch (error) {
      console.error('💥 Erro inesperado ao carregar convites:', error);
      setError(`Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setDebugInfo({ unexpectedError: error, userId: user.id });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [user]);

  const handleAccept = async (invitationId: string) => {
    console.log('✅ Aceitando convite:', invitationId);
    
    try {
      const { error } = await groupService.acceptInvitation(invitationId);
      
      if (error) {
        console.error('❌ Erro ao aceitar convite:', error);
        alert('❌ Erro ao aceitar convite: ' + error.message);
        return;
      }

      // Atualizar lista local
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'accepted' as const }
            : inv
        )
      );
      
      console.log('✅ Convite aceito com sucesso');
      alert('✅ Convite aceito! Você foi adicionado ao grupo.');
    } catch (error) {
      console.error('💥 Erro inesperado ao aceitar convite:', error);
      alert('❌ Erro inesperado ao aceitar convite.');
    }
  };

  const handleReject = async (invitationId: string) => {
    console.log('❌ Rejeitando convite:', invitationId);
    
    try {
      const { error } = await groupService.rejectInvitation(invitationId);
      
      if (error) {
        console.error('❌ Erro ao rejeitar convite:', error);
        alert('❌ Erro ao rejeitar convite: ' + error.message);
        return;
      }

      // Atualizar lista local
      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId 
            ? { ...inv, status: 'rejected' as const }
            : inv
        )
      );
      
      console.log('✅ Convite rejeitado com sucesso');
    } catch (error) {
      console.error('💥 Erro inesperado ao rejeitar convite:', error);
      alert('❌ Erro inesperado ao rejeitar convite.');
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Recarregando convites manualmente...');
    setLoading(true);
    loadInvitations();
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Carregando transmissões...</p>
          <p className="text-orange-300/70 text-sm mt-2">Verificando convites no sistema imperial...</p>
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
              <Bell className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-200 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-wider drop-shadow-2xl">
            TRANSMISSÕES
          </h1>
          <p className="text-orange-100/90 max-w-3xl mx-auto text-lg leading-relaxed tracking-wide drop-shadow-lg">
            Convites de alianças baseados em sua reputação e compatibilidade com expedições ativas.
          </p>

          {/* Botão de refresh */}
          <div className="mt-6">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-orange-600/80 hover:bg-orange-500/80 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Transmissões
            </button>
          </div>
        </div>

        {/* Debug Info (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
              <h3 className="text-blue-200 font-bold mb-2">🔍 Debug Info (Dev Only)</h3>
              <pre className="text-xs text-blue-100 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-900/30 rounded-lg p-6 border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-red-200 font-bold mb-2">Erro ao Carregar Transmissões</h3>
                  <p className="text-red-300 mb-4">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {!error && pendingInvitations.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 shadow-lg border border-orange-500/30">
                <h2 className="text-xl font-bold text-orange-200 flex items-center gap-3 tracking-wide">
                  <Shield className="w-6 h-6 text-orange-400" />
                  CONVITES PENDENTES ({pendingInvitations.length})
                </h2>
              </div>
              
              {pendingInvitations.map(invitation => (
                <NotificationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : !error ? (
            <div className="relative">
              {/* Efeito de brilho do container */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-black/50 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-orange-500/40">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-orange-400/50">
                  <Bell className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-4 tracking-wide">
                  NENHUMA TRANSMISSÃO ATIVA
                </h3>
                <p className="text-orange-100/80 mb-8 text-lg">
                  Quando alianças compatíveis com seu perfil forem formadas, você receberá convites aqui.
                </p>
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30 mb-6">
                  <p className="text-sm text-orange-200 tracking-wide">
                    🏜️ <strong>Conselho dos Anciãos:</strong> Mantenha seu registro atualizado para receber convites mais relevantes das expedições do Deep Desert.
                  </p>
                </div>

                {/* Status de conexão */}
                <div className="text-xs text-orange-300/70 space-y-1">
                  <p>✅ Conectado ao sistema imperial</p>
                  <p>👤 Usuário: {user?.email || 'Não identificado'}</p>
                  <p>🔍 Última verificação: {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};