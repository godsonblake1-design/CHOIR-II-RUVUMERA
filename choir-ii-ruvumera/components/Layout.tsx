import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Music, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  LayoutDashboard,
  PlusCircle,
  Mic2,
  Database,
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive(path) 
          ? 'bg-gold-500 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gold-50 hover:text-gold-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="p-8 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-white shadow-md">
              <Music size={24} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-gray-900 leading-none">Choir II</h1>
              <p className="text-xs text-gold-600 font-medium tracking-widest uppercase mt-1">Ruvumera</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {user?.role === 'ADMIN' && (
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            )}
            
            <NavItem path="/songs" icon={Music} label="Song Library" />
            
            {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
              <NavItem path="/songs/new" icon={PlusCircle} label="Add New Song" />
            )}

            <NavItem path="/members" icon={Mic2} label="Choir Members" />
            
            <NavItem path="/chat" icon={MessageCircle} label="Choir Chat" />

            <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</div>
            <NavItem path="/profile" icon={UserCircle} label="My Profile" />

            {user?.role === 'ADMIN' && (
              <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Administration</div>
                <NavItem path="/users" icon={Users} label="User Management" />
                <NavItem path="/settings" icon={Database} label="Backup & Settings" />
              </>
            )}
          </nav>

          {/* Footer Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Developed by GNTS Burundi</p>
            <p className="text-xs text-gold-600 font-medium mt-1">+257 65 120 154</p>
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-100">
            <Link to="/profile" className="flex items-center gap-3 mb-4 px-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-gold-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role.toLowerCase()}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-white shadow-sm">
              <Music size={16} />
            </div>
            <span className="font-serif font-bold text-lg">Choir II Ruvumera</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
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