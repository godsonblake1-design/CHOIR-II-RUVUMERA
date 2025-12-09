import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { mockDb } from '../services/mockDb';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (name: string, email: string, password: string, role: string) => Promise<void>;
  resetPassword: (userId: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, data: { name?: string, email?: string, avatar?: string, password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'choir_app_session';

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // Safety Timer: If DB takes too long, force load finished so user sees Login page
      const safetyTimer = setTimeout(() => {
        if (mounted && state.isLoading) {
            console.warn("Auth initialization timed out, forcing load completion.");
            setState(prev => ({ ...prev, isLoading: false }));
        }
      }, 3000); // 3 seconds max wait

      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const sessionUser = JSON.parse(savedSession);
          // Verify session against real DB
          const freshUser = await mockDb.getUserById(sessionUser.id);
          
          if (mounted) {
            if (freshUser) {
               const { passwordHash, ...safeUser } = freshUser;
               setState({
                 user: safeUser,
                 isAuthenticated: true,
                 isLoading: false
               });
            } else {
               // User deleted from DB or invalid session
               localStorage.removeItem(SESSION_KEY);
               setState(prev => ({ ...prev, isLoading: false }));
            }
          }
        } else {
          if (mounted) setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (e) {
         console.error("Auth init error:", e);
         if (mounted) setState(prev => ({ ...prev, isLoading: false }));
      } finally {
        clearTimeout(safetyTimer);
      }
    };

    initAuth();

    return () => {
        mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const userWithPass = await mockDb.getUserByEmail(email);

    if (!userWithPass) {
      throw new Error('User not found. Please check credentials or run SQL Schema.');
    }

    if (userWithPass.passwordHash !== password) {
      throw new Error('Invalid credentials');
    }

    const { passwordHash, ...safeUser } = userWithPass;
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    setState({
      user: safeUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const registerUser = async (name: string, email: string, password: string, role: string) => {
      await mockDb.createUser({
          name,
          email,
          passwordHash: password,
          role: role as any
      });
  }

  const resetPassword = async (userId: string, newPassword: string) => {
    await mockDb.resetUserPassword(userId, newPassword);
  }

  const updateProfile = async (userId: string, data: { name?: string, email?: string, avatar?: string, password?: string }) => {
     // Handle password separately
     if (data.password) {
       await mockDb.resetUserPassword(userId, data.password);
     }
     
     // Handle other fields
     const { password, ...otherUpdates } = data;
     if (Object.keys(otherUpdates).length > 0) {
       const updatedUser = await mockDb.updateUser(userId, otherUpdates);
       // Update session
       localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
       setState(prev => ({
         ...prev,
         user: updatedUser
       }));
     }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, registerUser, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};