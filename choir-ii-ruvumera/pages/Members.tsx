import React, { useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';
import { Member, VOICE_PARTS, VoicePart } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, Edit2, Phone, Mic2, X, Loader2 } from 'lucide-react';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    voicePart: 'Soprano',
    phone: '',
    isActive: true
  });

  const fetchMembers = async () => {
      setLoading(true);
      const data = await mockDb.getMembers();
      setMembers(data);
      setLoading(false);
  };

  useEffect(() => {
      fetchMembers();
  }, []);

  const isAdminOrEditor = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const resetForm = () => {
    setFormData({
      name: '',
      voicePart: 'Soprano',
      phone: '',
      isActive: true
    });
    setEditingId(null);
  };

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setFormData(member);
      setEditingId(member.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await mockDb.deleteMember(id);
      fetchMembers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await mockDb.updateMember(editingId, {
          name: formData.name,
          voicePart: formData.voicePart as VoicePart,
          phone: formData.phone,
          isActive: formData.isActive
        });
      } else {
        await mockDb.createMember({
          name: formData.name!,
          voicePart: formData.voicePart as VoicePart,
          phone: formData.phone,
          isActive: formData.isActive!
        });
      }
      fetchMembers();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert('Failed to save member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 font-serif">Choir Members</h1>
           <p className="text-gray-500">Directory of singers and instrumentalists</p>
        </div>
        {isAdminOrEditor && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={18} />
            Add Member
          </button>
        )}
      </div>

      {/* Grid of Members */}
      {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gold-500" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <Mic2 size={32} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <span className="inline-block bg-gold-50 text-gold-700 text-xs font-bold px-2 py-1 rounded-full mt-1 mb-3 uppercase tracking-wide">
                    {member.voicePart}
                </span>
                
                {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Phone size={14} />
                    <span>{member.phone}</span>
                    </div>
                )}
                </div>
                
                {isAdminOrEditor && (
                <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-center gap-4">
                    <button 
                    onClick={() => handleOpenModal(member)}
                    className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-white transition-colors"
                    title="Edit"
                    >
                    <Edit2 size={18} />
                    </button>
                    <button 
                    onClick={() => handleDelete(member.id)}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-white transition-colors"
                    title="Delete"
                    >
                    <Trash2 size={18} />
                    </button>
                </div>
                )}
            </div>
            ))}

            {members.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No members added yet.</p>
            </div>
            )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">{editingId ? 'Edit Member' : 'Add New Member'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voice Part *</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-white"
                  value={formData.voicePart}
                  onChange={e => setFormData({...formData, voicePart: e.target.value as VoicePart})}
                >
                  {VOICE_PARTS.map(part => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none"
                  placeholder="+257..."
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active Member</label>
              </div>

              <button 
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-2.5 rounded-lg transition-colors mt-4"
              >
                {editingId ? 'Update Member' : 'Add Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;