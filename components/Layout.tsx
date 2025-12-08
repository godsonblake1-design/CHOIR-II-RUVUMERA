
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Music, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  LayoutDashboard,
  PlusCircle,
  Mic2,
  MessageCircle,
  UserCircle,
  X
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <Link
      to={path}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden mb-1 ${
        isActive(path) 
          ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm' 
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} className={`transition-colors duration-300 ${isActive(path) ? 'text-gold-400' : 'text-gray-400 group-hover:text-gold-400'}`} />
      <span className="relative z-10">{label}</span>
      {isActive(path) && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-400 rounded-full" />
      )}
    </Link>
  );

  const canSeeMembers = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="min-h-screen flex bg-[#fdfbf7]">
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] flex flex-col transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:block`}
      >
        {/* Modern Menu Design: Radius 10 (approx 30px), Modern Background, Soft Shadow */}
        <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-r-[30px] shadow-[10px_0_40px_-10px_rgba(0,0,0,0.4)] relative overflow-hidden">
          
          {/* Decorative background elements for modern look */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {/* Logo Area */}
          <div className="p-8 pb-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gold-500/20 transform rotate-3">
                <Music size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif font-bold text-xl text-white leading-none tracking-tight">Choir II</h1>
                <p className="text-[10px] text-gold-400 font-bold tracking-[0.2em] uppercase mt-1.5">Ruvumera</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-2 relative z-10">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-hide relative z-10">
            {/* All Roles */}
            <div className="pb-2 space-y-1">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Menu</p>
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem path="/songs" icon={Music} label="Song Library" />
              <NavItem path="/chat" icon={MessageCircle} label="Choir Chat" />
            </div>

            {/* Editor & Admin Only */}
            {canSeeMembers && (
                <div className="pb-2 space-y-1">
                  <p className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">Manage</p>
                  <NavItem path="/songs/new" icon={PlusCircle} label="Add Song" />
                  <NavItem path="/members" icon={Mic2} label="Choir Members" />
                </div>
            )}

            {/* Admin Only */}
            {user?.role === 'ADMIN' && (
              <div className="space-y-1">
                <p className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">Admin</p>
                <NavItem path="/users" icon={Users} label="Users" />
                <NavItem path="/settings" icon={SettingsIcon} label="Settings" />
              </div>
            )}
          </nav>

          {/* Footer Info */}
          <div className="px-6 py-4 text-center relative z-10">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 shadow-sm">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">Developed by</p>
                <p className="text-xs font-bold text-gray-200">GNTS Burundi</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-gold-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                    <p className="text-[10px] font-bold">+257 65 120 154</p>
                </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm relative z-10">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/10 overflow-hidden">
                {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span>{user?.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate font-semibold">{user?.role}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <Link 
                    to="/profile"
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 border border-white/5 text-gray-200 rounded-lg hover:bg-white/20 hover:text-white transition-all text-xs font-bold"
                >
                    <UserCircle size={14} />
                    Profile
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg hover:bg-red-500/20 hover:text-red-200 transition-all text-xs font-bold"
                >
                    <LogOut size={14} />
                    Log Out
                </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Music size={18} />
            </div>
            <span className="font-serif font-bold text-lg text-gray-900 tracking-tight">Choir II</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-10 scroll-smooth">
            <div className="max-w-7xl mx-auto pb-20">
              {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
