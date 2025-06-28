import React from 'react';
import { Bell, Clock, ArrowRight } from 'lucide-react';

interface RecentNotificationsCardProps {
  notifications: Array<{
    id: string;
    type: 'invitation' | 'acceptance' | 'rejection';
    message: string;
    createdAt: Date;
  }>;
  onViewAll: () => void;
}

export const RecentNotificationsCard: React.FC<RecentNotificationsCardProps> = ({
  notifications,
  onViewAll
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h atrás`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}min atrás`;
    } else {
      return 'Agora';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invitation':
        return '📨';
      case 'acceptance':
        return '✅';
      case 'rejection':
        return '❌';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-orange-500/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-orange-200 flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-400" />
            Notificações Recentes
          </h3>
          {notifications.length > 0 && (
            <button
              onClick={onViewAll}
              className="text-orange-300 hover:text-orange-200 text-sm font-medium transition-colors flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div key={notification.id} className="bg-black/30 p-4 rounded-lg border border-orange-500/20">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <p className="text-orange-200 text-sm">{notification.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span className="text-orange-300/70 text-xs">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-orange-400/50 mx-auto mb-4" />
            <p className="text-orange-100/80">Nenhuma notificação recente</p>
            <p className="text-orange-300/60 text-sm mt-1">
              Convites e atualizações aparecerão aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
};