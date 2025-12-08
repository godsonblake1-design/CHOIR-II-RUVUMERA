import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Songs from './pages/Songs';
import SongDetail from './pages/SongDetail';
import SongEditor from './pages/SongEditor';
import UsersPage from './pages/Users';
import Members from './pages/Members';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gold-600 font-serif font-medium">Loading...</div>
      </div>
  );
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
     // If user is logged in but doesn't have permission, send them to dashboard
     return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard: All Roles */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Songs: All Roles (Read Access handled in component, Edit Access handled here) */}
      <Route path="/songs" element={
        <ProtectedRoute>
          <Songs />
        </ProtectedRoute>
      } />
      
      <Route path="/songs/:id" element={
        <ProtectedRoute>
          <SongDetail />
        </ProtectedRoute>
      } />
      
      {/* Edit/Add Songs: ADMIN & EDITOR only */}
      <Route path="/songs/new" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
          <SongEditor />
        </ProtectedRoute>
      } />
      
      <Route path="/songs/:id/edit" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
          <SongEditor />
        </ProtectedRoute>
      } />

      {/* Members: ADMIN & EDITOR only */}
      <Route path="/members" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EDITOR']}>
          <Members />
        </ProtectedRoute>
      } />
      
      {/* Users & Settings: ADMIN only */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <UsersPage />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Settings />
        </ProtectedRoute>
      } />

      {/* Chat & Profile: All Roles */}
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;