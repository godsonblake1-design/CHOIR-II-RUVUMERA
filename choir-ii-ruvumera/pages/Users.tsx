import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockDb';
import { User, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { Trash2, Shield, UserPlus, X, Key, Lock, Unlock, Mail, Edit, Loader2 } from 'lucide-react';

const UsersPage = () => {
  const { user: currentUser, registerUser, resetPassword, updateProfile } = useAuth();
  const [users, setUsers] = useState<(User & { passwordHash?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });

  // State for Editing Email
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState('');

  const refreshUsers = async () => {
      setLoading(true);
      const data = await mockDb.getUsers();
      setUsers(data);
      setLoading(false);
  };

  useEffect(() => {
      refreshUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) return alert("You cannot delete yourself.");
    if (window.confirm('Remove this user?')) {
      await mockDb.deleteUser(id);
      refreshUsers();
    }
  };

  const handleResetPassword = async (id: string, userName: string) => {
    const newPass = prompt(`Enter new password for ${userName}:`);
    if (newPass) {
        try {
            await resetPassword(id, newPass);
            alert(`Password for ${userName} has been updated.`);
        } catch (error) {
            alert('Failed to reset password');
        }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(newUser.name, newUser.email, newUser.password, newUser.role);
      await refreshUsers();
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleChatSuspension = async (user: User) => {
      const newStatus = !user.isChatSuspended;
      const action = newStatus ? 'suspend' : 'unlock';
      if (confirm(`Are you sure you want to ${action} ${user.name} from the chat?`)) {
          await mockDb.toggleChatSuspension(user.id, newStatus);
          refreshUsers();
      }
  };

  const startEditEmail = (user: User) => {
      setEditingEmailId(user.id);
      setTempEmail(user.email);
  };

  const saveEmail = async (userId: string) => {
      try {
          await updateProfile(userId, { email: tempEmail });
          setEditingEmailId(null);
          refreshUsers();
      } catch (e: any) {
          alert(e.message);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 font-serif">User Management</h1>
           <p className="text-gray-500">Manage access, roles, and chat permissions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gold-500" /></div>
        ) : (
            <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Chat Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {u.profileImage ? (
                            <img src={u.profileImage} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                    </td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'EDITOR' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        <Shield size={12} />
                        {u.role}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                    {editingEmailId === u.id ? (
                        <div className="flex items-center gap-2">
                            <input 
                                type="email" 
                                value={tempEmail} 
                                onChange={(e) => setTempEmail(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
                            />
                            <button onClick={() => saveEmail(u.id)} className="text-green-600 font-bold text-xs">SAVE</button>
                            <button onClick={() => setEditingEmailId(null)} className="text-gray-400 text-xs">CANCEL</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            {u.email}
                            <button onClick={() => startEditEmail(u)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600">
                                <Edit size={12} />
                            </button>
                        </div>
                    )}
                    </td>
                    <td className="px-6 py-4">
                        {u.isChatSuspended ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                <Lock size={12} /> Suspended
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                Active
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => toggleChatSuspension(u)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${u.isChatSuspended ? 'text-green-600' : 'text-orange-500'}`}
                            title={u.isChatSuspended ? "Unlock Chat" : "Suspend from Chat"}
                        >
                            {u.isChatSuspended ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                        <button 
                        onClick={() => handleResetPassword(u.id, u.name)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
                        title="Reset Password"
                        >
                        <Key size={16} />
                        </button>
                        {u.id !== currentUser?.id && (
                            <button 
                            onClick={() => handleDelete(u.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
                            title="Remove User"
                            >
                            <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Add New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" required 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" required 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-white"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="USER">User (View Only)</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-2.5 rounded-lg transition-colors mt-4"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;