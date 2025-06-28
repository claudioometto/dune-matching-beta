import React, { useState, useEffect } from 'react';
import { Bell, Shield } from 'lucide-react';
import { NotificationCard } from './NotificationCard';
import { groupService } from '../../services/groupService';
import { useAuth } from '../auth/AuthProvider';
import type { Invitation } from '../../types/notification';

export const NotificationList: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Carregar convites do usuário
  useEffect(() => {
    const loadInvitations = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await groupService.getPlayerInvitations(user.id);
        
        if (error) {
          console.error('Erro ao carregar convites:', error);
          return;
        }

        // Converter dados do banco para formato da interface
        const formattedInvitations: Invitation[] = (data || []).map(match => ({
          id: match.id,
          groupName: match.group_ads.title,
          groupObjective: match.group_ads.resource_target === 'PvP' ? 'PvP' : 'Coleta',
          groupCreator: match.group_ads.players?.nickname || 'Desconhecido',
          roles: match.group_ads.roles_needed.map((role: string, index: number) => ({
            id: (index + 1).toString(),
            type: role as 'Coleta' | 'Ataque',
            isOwner: index === 0,
            playerName: index === 0 ? match.group_ads.players?.nickname : undefined
          })),
          playerEmail: user.email || '',
          playerNickname: '', // Será preenchido quando necessário
          createdAt: new Date(match.created_at),
          status: 'pending'
        }));

        setInvitations(formattedInvitations);
      } catch (error) {
        console.error('Erro ao carregar convites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvitations();
  }, [user]);

  const handleAccept = async (invitationId: string) => {
    try {
      const { error } = await groupService.acceptInvitation(invitationId);
      
      if (error) {
        console.error('Erro ao aceitar convite:', error);
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
      
      alert('✅ Convite aceito! Você foi adicionado ao grupo.');
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      alert('❌ Erro inesperado ao aceitar convite.');
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      const { error } = await groupService.rejectInvitation(invitationId);
      
      if (error) {
        console.error('Erro ao rejeitar convite:', error);
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
      
      console.log('Convite rejeitado com sucesso');
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      alert('❌ Erro inesperado ao rejeitar convite.');
    }
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Carregando transmissões...</p>
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
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {pendingInvitations.length > 0 ? (
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
          ) : (
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
                <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/30">
                  <p className="text-sm text-orange-200 tracking-wide">
                    🏜️ <strong>Conselho dos Anciãos:</strong> Mantenha seu registro atualizado para receber convites mais relevantes das expedições do Deep Desert.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};