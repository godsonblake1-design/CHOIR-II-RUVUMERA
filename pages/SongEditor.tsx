import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockDb } from '../services/mockDb';
import { Song, SONG_CATEGORIES } from '../types';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SongEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<Song>>({
    title: '',
    category: 'Worship',
    lyrics: '',
    language: '',
    author: ''
  });

  useEffect(() => {
    const loadSong = async () => {
        if (isEditMode && id) {
            const songs = await mockDb.getSongs();
            const song = songs.find(s => s.id === id);
            if (song) {
                setFormData(song);
            } else {
                navigate('/songs');
            }
        }
    }
    loadSong();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.lyrics || !formData.category) {
      alert('Please fill in required fields');
      return;
    }

    try {
      if (isEditMode && id) {
        await mockDb.updateSong(id, {
          title: formData.title,
          lyrics: formData.lyrics,
          category: formData.category,
          language: formData.language,
          author: formData.author,
          updatedBy: user?.id
        });
      } else {
        await mockDb.createSong({
          title: formData.title!,
          lyrics: formData.lyrics!,
          category: formData.category!,
          language: formData.language,
          author: formData.author,
          createdBy: user?.id!,
          updatedBy: user?.id!
        });
      }
      navigate('/songs');
    } catch (error) {
      console.error(error);
      alert('Error saving song');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <Link 
          to="/songs" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Cancel
        </Link>
        <h1 className="text-2xl font-bold font-serif text-gray-900">
          {isEditMode ? 'Edit Song' : 'Add New Song'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Song Title *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="e.g. Amazing Grace"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Category *</label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all bg-gray-50 focus:bg-white text-black font-semibold"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {SONG_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Author (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="e.g. John Newton"
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Language (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-black font-semibold placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="e.g. English, Kinyarwanda"
                value={formData.language}
                onChange={e => setFormData({...formData, language: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Lyrics *</label>
            <div className="relative">
              <textarea
                required
                rows={15}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all resize-y font-serif leading-relaxed text-black font-medium bg-gray-50 focus:bg-white placeholder-gray-400"
                placeholder="Enter song lyrics here..."
                value={formData.lyrics}
                onChange={e => setFormData({...formData, lyrics: e.target.value})}
              ></textarea>
              <div className="absolute top-2 right-2 text-xs text-gray-500 font-bold bg-white/80 px-2 py-1 rounded border border-gray-200">
                 Markdown supported
              </div>
            </div>
          </div>

        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/songs')}
            className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-gold-500 text-white font-bold hover:bg-gold-600 transition-all shadow-md flex items-center gap-2"
          >
            <Save size={18} />
            Save Song
          </button>
        </div>
      </form>
    </div>
  );
};

export default SongEditor;