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
  UserCircle
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold ${
        isActive(path) 
          ? 'bg-gold-500 text-white shadow-md' 
          : 'text-gray-800 hover:bg-white/50 hover:text-gold-900 hover:shadow-sm'
      }`}
    >
      <Icon size={20} className={isActive(path) ? 'text-white' : 'text-gray-600'} />
      <span>{label}</span>
    </Link>
  );

  const canSeeMembers = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 border-r border-white/50 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col backdrop-blur-md ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(243,244,246,0.8) 100%)',
            backdropFilter: 'blur(10px)'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="p-8 border-b border-gray-200/50 flex items-center gap-3 bg-white/40">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-white shadow-md ring-2 ring-gold-200">
              <Music size={24} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-gray-900 leading-none">Choir II</h1>
              <p className="text-xs text-gold-700 font-bold tracking-widest uppercase mt-1">Ruvumera</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* All Roles */}
            <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem path="/songs" icon={Music} label="Song Library" />
            
            {/* Chat - All Roles */}
            <NavItem path="/chat" icon={MessageCircle} label="Choir Chat" />

            {/* Editor & Admin Only */}
            {canSeeMembers && (
                <>
                  <NavItem path="/songs/new" icon={PlusCircle} label="Add New Song" />
                  <NavItem path="/members" icon={Mic2} label="Choir Members" />
                </>
            )}

            {/* Admin Only */}
            {user?.role === 'ADMIN' && (
              <>
                <div className="pt-6 pb-2 px-4 text-xs font-black text-gray-500 uppercase tracking-widest">Administration</div>
                <NavItem path="/users" icon={Users} label="User Management" />
                <NavItem path="/settings" icon={SettingsIcon} label="Backup & Settings" />
              </>
            )}
          </nav>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-white/30 border-t border-gray-200/50 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Developed by GNTS Burundi</p>
            <p className="text-xs text-gold-700 font-bold mt-1">+257 65 120 154</p>
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200/50 bg-white/50">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden border-2 border-gold-200">
                {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span>{user?.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate capitalize font-medium">{user?.role.toLowerCase()}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
                <Link 
                    to="/profile"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-xs font-bold shadow-md"
                >
                    <UserCircle size={16} />
                    Profile
                </Link>
                <button
                    onClick={handleLogout}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-white shadow-sm">
              <Music size={16} />
            </div>
            <span className="font-serif font-bold text-lg text-gray-900">Choir II Ruvumera</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;