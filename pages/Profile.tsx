import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, Lock, User, Mail } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(user.id, {
        name: user.role === 'ADMIN' ? formData.name : undefined, // Only admin can change name here per requirement implies users only change pwd/photo, but usually names too. I'll allow name if admin, or if we want flexibility. Let's strictly follow prompt: "admin... change his email and pasword... users... change their paswords". Prompt also says "add their photo profile".
        email: user.role === 'ADMIN' ? formData.email : undefined,
        password: formData.password || undefined,
        avatar: avatarPreview
      });
      alert("Profile updated successfully");
      setFormData(prev => ({...prev, password: '', confirmPassword: ''}));
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">My Profile</h1>
        <p className="text-gray-500">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header / Avatar Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-8 flex flex-col items-center border-b border-gray-100">
           <div className="relative group">
             <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    user?.name.charAt(0).toUpperCase()
                )}
             </div>
             <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-gold-500 transition-colors shadow-md"
                title="Upload Photo"
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
           <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
           <span className="text-sm font-medium text-gold-600 bg-gold-50 px-3 py-1 rounded-full mt-2 uppercase tracking-wide">
             {user?.role}
           </span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Admin Specific Fields */}
          {isAdmin && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
             </div>
          )}

          {!isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Full Name</label>
                  <input
                      type="text"
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                      value={formData.name}
                    />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Email Address</label>
                  <input
                      type="text"
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                      value={formData.email}
                    />
                </div>
            </div>
          )}

          <hr className="border-gray-100" />
          
          <div className="bg-yellow-50/50 p-6 rounded-xl border border-yellow-100/50">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={18} className="text-gold-600" />
                Change Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold"
                    placeholder="Leave blank to keep current"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;