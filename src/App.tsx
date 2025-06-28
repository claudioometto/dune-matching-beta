import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoginForm } from './components/auth/LoginForm';
import { PlayerForm } from './components/player/PlayerForm';
import { GroupAdForm } from './components/group/GroupAdForm';
import { NotificationList } from './components/notifications/NotificationList';
import { MyGroup } from './components/group/MyGroup';
import { RatePlayers } from './components/ratings/RatePlayers';
import { PlayerProfile } from './components/player/PlayerProfile';
import { GroupBrowser } from './components/group/GroupBrowser';
import { EnvironmentBadge } from './components/common/EnvironmentBadge';
import { ContactButton } from './components/common/ContactButton';
import { DiagnosticPanel } from './components/common/DiagnosticPanel';
import { LogOut } from 'lucide-react';

type ViewType = 'player' | 'group' | 'browse' | 'notifications' | 'mygroup' | 'rate' | 'profile';

/**
 * DUNE: AWAKENING PLAYER MATCHING - VERSÃO BETA
 * 
 * Sistema completo de autenticação e matching para formar grupos no Deep Desert.
 * 
 * FLUXO COMPLETO:
 * 1. LOGIN/CADASTRO: Autenticação segura com Supabase Auth
 * 2. CADASTRO (aba "Cadastro"): Jogador preenche perfil completo
 * 3. CRIAR ANÚNCIO (aba "Criar Anúncio"): Define grupo, funções e filtros
 * 4. NAVEGAR GRUPOS (aba "Explorar Grupos"): Lista grupos abertos para candidatura
 * 5. MATCHING AUTOMÁTICO: Sistema encontra jogadores compatíveis
 * 6. NOTIFICAÇÕES (aba "Notificações"): Jogadores recebem convites
 * 7. MEU GRUPO (aba "Meu Grupo"): Criador gerencia interessados
 * 8. FARMING: Grupo vai farmar no Deep Desert
 * 9. AVALIAR (aba "Avaliar Jogadores"): Membros se avaliam (30 min)
 * 10. PERFIL (aba "Perfil"): Reputação pública do jogador
 * 
 * TECNOLOGIAS:
 * - React + TypeScript + Vite
 * - Tailwind CSS + Lucide Icons
 * - Supabase (Auth + Database)
 * 
 * VERSÃO: Beta v2.1 (Janeiro 2025) - Com Navegação de Grupos
 */

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('player');
  const { user, signOut, loading } = useAuth();

  // Get environment from Vite env vars with fallback
  const environment = import.meta.env.VITE_ENV || import.meta.env.ENV || 'BETA';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderCurrentView = () => {
    try {
      switch (currentView) {
        case 'player':
          return <PlayerForm />; // Cadastro completo do jogador
        case 'group':
          return <GroupAdForm />; // Criação de anúncios de grupo
        case 'browse':
          return <GroupBrowser />; // NOVA: Navegação de grupos abertos
        case 'notifications':
          return <NotificationList />; // Convites recebidos
        case 'mygroup':
          return <MyGroup />; // Gerenciamento do grupo ativo
        case 'rate':
          return <RatePlayers />; // Avaliação pós-grupo (30 min)
        case 'profile':
          return <PlayerProfile />; // Perfil público com reputação
        default:
          return <PlayerForm />;
      }
    } catch (error) {
      console.error('Erro ao renderizar view:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center text-orange-200">
            <h2 className="text-2xl font-bold mb-4">Erro no Sistema</h2>
            <p>Ocorreu um erro inesperado. Recarregue a página.</p>
          </div>
        </div>
      );
    }
  };

  const navigationItems = [
    { id: 'player', label: 'Cadastro', icon: '👤' },
    { id: 'group', label: 'Criar Anúncio', icon: '⚔️' },
    { id: 'browse', label: 'Explorar Grupos', icon: '🔍' },
    { id: 'notifications', label: 'Notificações', icon: '📡' },
    { id: 'mygroup', label: 'Meu Grupo', icon: '🏛️' },
    { id: 'rate', label: 'Avaliar', icon: '⭐' },
    { id: 'profile', label: 'Perfil', icon: '🏆' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-200 text-lg tracking-wide">Conectando ao sistema imperial...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!user) {
    return <LoginForm />;
  }

  // Authenticated - show main app
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background épico com imagem do deserto */}
      <div className="fixed inset-0 z-0">
        {/* Imagem de fundo do deserto */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
          }}
        ></div>
        
        {/* Gradiente escuro no topo para contraste com o texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/40"></div>
        
        {/* Efeito de tempestade de areia sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-amber-600/10"></div>
        
        {/* Partículas flutuantes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-orange-300 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse delay-700"></div>
        </div>
      </div>

      {/* Environment Badge */}
      <EnvironmentBadge environment={environment} />

      {/* Header Épico - Inspirado em Dune */}
      <div className="relative z-10 bg-black/50 backdrop-blur-md border-b border-orange-500/30 shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          {/* User info and logout */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-orange-200 font-medium">{user.email || 'Usuário'}</p>
                <p className="text-orange-300/70 text-xs">Guerreiro Autenticado</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

          {/* Cabeçalho Principal */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-6 mb-4">
              {/* Ícone Ornicóptero/Tribal à esquerda */}
              <div className="relative">
                <svg 
                  className="w-12 h-12 text-orange-400" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  {/* Ornicóptero estilizado */}
                  <path d="M12 2L8 6v4l4-2 4 2V6l-4-4z"/>
                  <path d="M4 8l4 2v8l-4-2V8z"/>
                  <path d="M20 8v8l-4 2v-8l4-2z"/>
                  <path d="M8 18l4 4 4-4"/>
                </svg>
                <div className="absolute inset-0 bg-orange-400/30 blur-lg animate-pulse"></div>
              </div>
              
              {/* Título Principal */}
              <h1 className="text-6xl md:text-8xl font-black tracking-widest transform hover:scale-105 transition-transform duration-500 cursor-default"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 25%, #D97706 50%, #B45309 75%, #92400E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 30px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.3)',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))'
                  }}
              >
                DUNE: AWAKENING
              </h1>
              
              {/* Ícone Ornicóptero/Tribal à direita */}
              <div className="relative">
                <svg 
                  className="w-12 h-12 text-orange-400 transform scale-x-[-1]" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  {/* Ornicóptero estilizado espelhado */}
                  <path d="M12 2L8 6v4l4-2 4 2V6l-4-4z"/>
                  <path d="M4 8l4 2v8l-4-2V8z"/>
                  <path d="M20 8v8l-4 2v-8l4-2z"/>
                  <path d="M8 18l4 4 4-4"/>
                </svg>
                <div className="absolute inset-0 bg-orange-400/30 blur-lg animate-pulse"></div>
              </div>
            </div>
            
            {/* Subtítulo com animação fade-in */}
            <div className="animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              <p className="text-2xl md:text-3xl font-bold tracking-[0.3em] opacity-80"
                 style={{
                   color: '#E2C89E',
                   textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                   filter: 'drop-shadow(0 0 10px rgba(226, 200, 158, 0.3))'
                 }}
              >
                ✺ DEEP DESERT ALLIANCE ✺
              </p>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-center gap-2 flex-wrap">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewType)}
                className={`group relative px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-black/40 text-orange-200 hover:bg-orange-900/60 hover:text-orange-100 border border-orange-500/30'
                }`}
              >
                {/* Efeito de brilho para item ativo */}
                {currentView === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg blur opacity-50 -z-10 animate-pulse"></div>
                )}
                
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline tracking-wide">{item.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {renderCurrentView()}
      </div>

      {/* Contact Button - Redesenhado */}
      <ContactButton />

      {/* Diagnostic Panel - Novo */}
      <DiagnosticPanel />
    </div>
  );
};

function App() {
  try {
    return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    );
  } catch (error) {
    console.error('Erro crítico na aplicação:', error);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-orange-200">
          <h1 className="text-3xl font-bold mb-4">Sistema Temporariamente Indisponível</h1>
          <p className="mb-4">Ocorreu um erro crítico no sistema imperial.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            Recarregar Sistema
          </button>
        </div>
      </div>
    );
  }
}

export default App;