import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockDb } from '../services/mockDb';
import { Song, SONG_CATEGORIES } from '../types';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SongEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

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
            try {
                const songs = await mockDb.getSongs();
                const song = songs.find(s => s.id === id);
                if (song) {
                    setFormData(song);
                } else {
                    navigate('/songs');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
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

    setSaving(true);
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
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-gold-500"/></div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <Link 
          to="/songs" 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Cancel
        </Link>
        <h1 className="text-2xl font-bold font-serif text-gray-900">
          {isEditMode ? 'Edit Song' : 'Add New Song'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Song Title *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                placeholder="e.g. Amazing Grace"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {SONG_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                placeholder="e.g. John Newton"
                value={formData.author}
                onChange={e => setFormData({...formData, author: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language (Optional)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all"
                placeholder="e.g. English, Kinyarwanda"
                value={formData.language}
                onChange={e => setFormData({...formData, language: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lyrics *</label>
            <div className="relative">
              <textarea
                required
                rows={15}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all resize-y font-serif leading-relaxed"
                placeholder="Enter song lyrics here..."
                value={formData.lyrics}
                onChange={e => setFormData({...formData, lyrics: e.target.value})}
              ></textarea>
              <div className="absolute top-2 right-2 text-xs text-gray-300 font-medium bg-white px-2 rounded">
                 Markdown supported (basic)
              </div>
            </div>
          </div>

        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/songs')}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-all shadow-sm flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Song
          </button>
        </div>
      </form>
    </div>
  );
};

export default SongEditor;