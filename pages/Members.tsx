import React, { useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';
import { Member, VOICE_PARTS, VoicePart } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, Edit2, Phone, Mic2, X, MapPin } from 'lucide-react';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    voicePart: 'Soprano',
    phone: '',
    address: '',
    isActive: true
  });

  const fetchMembers = async () => {
    const data = await mockDb.getMembers();
    setMembers(data);
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
      address: '',
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
          address: formData.address,
          isActive: formData.isActive
        });
      } else {
        await mockDb.createMember({
          name: formData.name!,
          voicePart: formData.voicePart as VoicePart,
          phone: formData.phone,
          address: formData.address,
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
           <p className="text-gray-600 font-medium">Directory of singers and instrumentalists</p>
        </div>
        {isAdminOrEditor && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <UserPlus size={18} />
            Add Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 ring-4 ring-gray-50">
                <Mic2 size={32} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
              <span className="inline-block bg-gold-50 text-gold-700 text-xs font-bold px-2 py-1 rounded-full mt-1 mb-3 uppercase tracking-wide border border-gold-100">
                {member.voicePart}
              </span>
              
              <div className="space-y-2 w-full px-2">
                {member.phone && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                    <Phone size={14} className="text-gold-500" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                    <MapPin size={14} className="text-gold-500" />
                    <span className="truncate">{member.address}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isAdminOrEditor && (
              <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-center gap-4">
                <button 
                  onClick={() => handleOpenModal(member)}
                  className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-white transition-colors border border-transparent hover:border-gray-200"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-white transition-colors border border-transparent hover:border-gray-200"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white/50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No members added yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-bold text-gray-900 text-lg">{editingId ? 'Edit Member' : 'Add New Member'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Full Name *</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none text-black font-semibold bg-gray-50 focus:bg-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Voice Part *</label>
                <select 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none bg-gray-50 focus:bg-white text-black font-semibold"
                  value={formData.voicePart}
                  onChange={e => setFormData({...formData, voicePart: e.target.value as VoicePart})}
                >
                  {VOICE_PARTS.map(part => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Address</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none text-black font-semibold bg-gray-50 focus:bg-white"
                  placeholder="e.g. 123 Church Avenue"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none text-black font-semibold bg-gray-50 focus:bg-white"
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
                  className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500 border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Member Status</label>
              </div>

              <button 
                type="submit"
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg transition-colors mt-2 shadow-md"
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