import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Gamepad2, Menu, Sun, Moon, LayoutGrid, List, User, LogOut, Bell, CheckCheck, TrendingDown, ExternalLink } from 'lucide-react';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { AppNotification } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  showMonitoredOnly: boolean;
  setShowMonitoredOnly: (val: boolean) => void;
  monitoredCount: number;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  onMarkNotificationsRead: () => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  toggleSidebar,
  showMonitoredOnly,
  setShowMonitoredOnly,
  monitoredCount,
  notifications,
  unreadNotificationsCount,
  onMarkNotificationsRead,
  openAuthModal,
  searchInputRef
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const { theme, toggleTheme, viewMode, toggleViewMode } = useAppSettings();
  const { user, profile, signOut } = useAuth();

  // Display name: profile username > email prefix > 'Usuário'
  const displayName = profile?.username || user?.email?.split('@')[0] || 'Usuário';

  const formatNotificationPrice = (price: number | null) => {
    if (price === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const formatNotificationDate = (value: string) => {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Refs para medir posição real dos botões de tab
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const ofertasRef = useRef<HTMLButtonElement>(null);
  const monitoradosRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Salvar scroll position por aba
  const scrollPositions = useRef({ ofertas: 0, monitorados: 0 });

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateIndicator = useCallback(() => {
    const container = tabsContainerRef.current;
    const activeBtn = showMonitoredOnly ? monitoradosRef.current : ofertasRef.current;
    if (container && activeBtn) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [showMonitoredOnly]);

  useEffect(() => { updateIndicator(); }, [updateIndicator, monitoredCount]);
  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleTabSwitch = (toMonitored: boolean) => {
    if (showMonitoredOnly) {
      scrollPositions.current.monitorados = window.scrollY;
    } else {
      scrollPositions.current.ofertas = window.scrollY;
    }
    setShowMonitoredOnly(toMonitored);
    requestAnimationFrame(() => {
      const targetScroll = toMonitored 
        ? scrollPositions.current.monitorados 
        : scrollPositions.current.ofertas;
      window.scrollTo(0, targetScroll);
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 60 && currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 10) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Header principal */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20">
          <div className="h-16 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleSidebar}
                className="md:hidden text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
                aria-label="Toggle filters"
                id="sidebar-toggle"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center gap-2 text-emerald-400">
                <Gamepad2 size={28} />
                <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
                  Game<span className="text-emerald-400">Deal</span>Central
                </h1>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-zinc-800/80 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-zinc-700/90 sm:text-sm transition-all"
                  placeholder="Buscar jogos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  ref={searchInputRef}
                  id="search-input"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View mode toggle — hidden on mobile */}
              <button
                onClick={toggleViewMode}
                className="hidden sm:flex p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title={viewMode === 'grid' ? 'Mudar para lista' : 'Mudar para grade'}
              >
                {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user && (
                <div className="relative" ref={notificationMenuRef}>
                  <button
                    onClick={() => setShowNotifications(prev => !prev)}
                    className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Notificações"
                    aria-label={`Notificações${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} não lidas)` : ''}`}
                  >
                    <Bell size={18} />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center px-1">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-zinc-900 border border-white/10 shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">Notificações</p>
                          <p className="text-xs text-zinc-500">
                            {unreadNotificationsCount > 0
                              ? `${unreadNotificationsCount} alerta${unreadNotificationsCount === 1 ? '' : 's'} novo${unreadNotificationsCount === 1 ? '' : 's'}`
                              : 'Tudo em dia'}
                          </p>
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={onMarkNotificationsRead}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Marcar como lidas"
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <a
                              key={notification.id}
                              href={notification.url || '#'}
                              target={notification.url ? '_blank' : undefined}
                              rel={notification.url ? 'noopener noreferrer' : undefined}
                              className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                                notification.is_read ? 'bg-transparent' : 'bg-emerald-500/5'
                              }`}
                            >
                              <div className="mt-0.5 h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                <TrendingDown size={15} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-white line-clamp-1">{notification.title}</p>
                                  {!notification.is_read && (
                                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{notification.message}</p>
                                <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-zinc-500">
                                  <span>
                                    {formatNotificationPrice(notification.old_price)}
                                    {notification.old_price !== null && notification.new_price !== null ? ' → ' : ''}
                                    <span className="text-emerald-400">{formatNotificationPrice(notification.new_price)}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {formatNotificationDate(notification.created_at)}
                                    {notification.url && <ExternalLink size={11} />}
                                  </span>
                                </div>
                              </div>
                            </a>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm text-zinc-400">Nenhuma queda de preço ainda.</p>
                            <p className="text-xs text-zinc-500 mt-1">Quando um monitorado baixar, aparece aqui.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth Section */}
              <div className="flex items-center gap-2 ml-2">
                {user ? (
                   <div className="relative" ref={profileMenuRef}>
                     <button
                       onClick={() => setShowProfileMenu(!showProfileMenu)}
                       className="flex items-center justify-center h-10 w-10 md:h-9 md:w-auto md:px-3 rounded-full md:rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition-colors border border-emerald-500/20 overflow-hidden"
                     >
                       {profile?.avatar_url ? (
                         <img 
                           src={profile.avatar_url} 
                           alt={displayName} 
                           className="h-10 w-10 md:h-7 md:w-7 rounded-full object-cover md:mr-2" 
                         />
                       ) : (
                         <User size={18} className="md:mr-2" />
                       )}
                       <span className="hidden md:block text-sm font-medium text-white max-w-[100px] truncate">
                         {displayName}
                       </span>
                     </button>

                     {/* Dropdown Menu */}
                     {showProfileMenu && (
                       <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-white/10 shadow-xl overflow-hidden z-50">
                         <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                           {profile?.avatar_url ? (
                             <img src={profile.avatar_url} alt={displayName} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                           ) : (
                             <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                               <User size={16} className="text-zinc-400" />
                             </div>
                           )}
                           <div className="min-w-0">
                             <p className="text-sm font-medium text-white truncate">{displayName}</p>
                             <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                           </div>
                         </div>
                         <button
                           onClick={() => {
                             signOut();
                             setShowProfileMenu(false);
                           }}
                           className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                         >
                           <LogOut size={16} />
                           Sair da conta
                         </button>
                       </div>
                     )}
                   </div>
                ) : (
                  <>
                    <button 
                      onClick={() => openAuthModal('login')}
                      className="hidden md:block text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => openAuthModal('register')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span className="hidden md:inline">Criar Conta</span>
                      <span className="md:hidden">Entrar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de tabs */}
      <div 
        className={`fixed left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 transition-all duration-300 ${
          isVisible ? 'top-16' : 'top-0'
        }`}
      >
        <div className="flex items-center justify-center w-full px-4">
          <div className="relative flex items-center gap-8" ref={tabsContainerRef}>
            <button
              ref={ofertasRef}
              onClick={() => handleTabSwitch(false)}
              className={`relative py-3 px-2 text-sm font-medium transition-colors ${
                !showMonitoredOnly ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Ofertas
            </button>

            <button
              id="monitored-tab"
              ref={monitoradosRef}
              onClick={() => handleTabSwitch(true)}
              className={`relative py-3 px-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                showMonitoredOnly ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Monitorados
              {monitoredCount > 0 && (
                <span className="text-xs text-zinc-500">
                  ({monitoredCount})
                </span>
              )}
            </button>

            {/* Indicador ativo */}
            <div
              className="absolute bottom-0 h-0.5 bg-white rounded-t-full transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
