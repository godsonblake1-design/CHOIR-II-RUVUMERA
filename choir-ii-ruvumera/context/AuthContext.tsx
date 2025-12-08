import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { mockDb } from '../services/mockDb';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (name: string, email: string, password: string, role: string) => Promise<void>;
  resetPassword: (userId: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: { password?: string, profileImage?: string, email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'choir_app_session';

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshSession = async (userId: string) => {
    try {
        const freshUser = await mockDb.getUserById(userId);
        if (freshUser) {
            const { passwordHash, ...safeUser } = freshUser;
            localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
            setState({
                user: safeUser,
                isAuthenticated: true,
                isLoading: false
            });
        }
    } catch (e) {
        console.error("Failed to refresh session", e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
        // 1. Ensure Admin Exists in Supabase (Idempotent)
        await mockDb.seedAdmin();

        // 2. Check local session
        const savedUserStr = localStorage.getItem(SESSION_KEY);
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          try {
            // Verify user still exists in DB
            const dbUser = await mockDb.getUserById(savedUser.id);
            if (dbUser) {
                const { passwordHash, ...safeUser } = dbUser;
                setState({
                    user: safeUser,
                    isAuthenticated: true,
                    isLoading: false
                });
            } else {
                localStorage.removeItem(SESSION_KEY);
                setState(prev => ({ ...prev, isLoading: false }));
            }
          } catch (e) {
            // If offline, we might want to allow access if localStorage exists, 
            // but for security we logout if we can't verify.
            localStorage.removeItem(SESSION_KEY);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // This now queries Supabase
    const userWithPass = await mockDb.getUserByEmail(email);

    if (!userWithPass) {
      throw new Error('User not found');
    }

    // Verify password (in a real app, use bcrypt.compare)
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

  const updateProfile = async (userId: string, updates: { password?: string, profileImage?: string, email?: string }) => {
    if (updates.password) {
        await mockDb.resetUserPassword(userId, updates.password);
    }
    
    if (updates.profileImage !== undefined) {
        await mockDb.updateUser(userId, { profileImage: updates.profileImage });
    }

    if (updates.email) {
        await mockDb.adminUpdateUserEmail(userId, updates.email);
    }

    await refreshSession(userId);
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
