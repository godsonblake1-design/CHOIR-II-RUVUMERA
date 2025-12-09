
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Music, Lock, Mail, AlertTriangle } from 'lucide-react';
import { mockDb } from '../services/mockDb';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dbError, setDbError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if database tables exist on mount
    mockDb.checkConnection().then(isConnected => {
      if (!isConnected) setDbError(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
        style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
        }}
    >
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-gold-600 to-gold-400 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gold-600 mx-auto mb-4 shadow-lg ring-4 ring-white/30">
               <Music size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white font-serif tracking-wide drop-shadow-sm">Choir II Ruvumera</h1>
            <p className="text-gold-50 text-sm mt-1 font-medium tracking-wider uppercase drop-shadow-sm">Management System</p>
          </div>
        </div>

        <div className="p-8 pb-6">
          {dbError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
                <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle size={18} />
                    <span>Database Not Found</span>
                </div>
                <p className="text-sm">
                    The application cannot connect to the database tables. Please copy the <strong>SQL Schema</strong> and run it in your Supabase Dashboard's SQL Editor.
                </p>
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-900 font-medium text-sm p-3 rounded-lg border border-red-200 text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-800">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold bg-gray-50 focus:bg-white"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-800">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg"
            >
              Sign In
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Developed by GNTS Burundi</p>
           <p className="text-xs text-gold-700 font-bold mt-1">+257 65 120 154</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
