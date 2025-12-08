import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, Lock, Mail, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) { // 2MB limit
        alert("Image is too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfile(user!.id, { profileImage: base64String })
          .then(() => setMessage({ type: 'success', text: 'Profile photo updated!' }))
          .catch(() => setMessage({ type: 'error', text: 'Failed to update photo.' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setIsLoading(false);
      return;
    }

    try {
      const updates: any = {};
      if (password) updates.password = password;
      
      // Only Admin can change email here, though logic exists in backend
      if (user?.role === 'ADMIN' && email !== user.email) {
          updates.email = email;
      }

      if (Object.keys(updates).length > 0) {
          await updateProfile(user!.id, updates);
          setMessage({ type: 'success', text: 'Profile updated successfully.' });
          setPassword('');
          setConfirmPassword('');
      } else {
          setMessage({ type: 'info', text: 'No changes to save.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">My Profile</h1>
        <p className="text-gray-500">Manage your account settings and appearance</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-gold-400 to-gold-600 relative"></div>
        
        <div className="px-8 pb-8">
          {/* Profile Image */}
          <div className="relative -mt-16 mb-6 flex justify-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden flex items-center justify-center shadow-md">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">{user?.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                title="Change Photo"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 mt-2 uppercase tracking-wide">
              {user?.role}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-6 max-w-lg mx-auto">
            {message.text && (
              <div className={`p-4 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={user?.role !== 'ADMIN'}
                  className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all ${user?.role !== 'ADMIN' ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                />
              </div>
              {user?.role !== 'ADMIN' && (
                <p className="text-xs text-gray-400 mt-1">Only Administrators can change email addresses.</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="font-medium text-gray-900">Change Password</h3>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm mt-6"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;