import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockDb } from '../services/mockDb';
import { Song } from '../types';
import { ArrowLeft, Edit2, Printer, MonitorPlay, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [fontSize, setFontSize] = useState(2); // 1-4 scale

  useEffect(() => {
    const fetchSong = async () => {
      if (id) {
        try {
            const songs = await mockDb.getSongs();
            const found = songs.find(s => s.id === id);
            if (found) {
                setSong(found);
            } else {
                navigate('/songs');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
      }
    };
    fetchSong();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" /></div>;
  if (!song) return null;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  const handlePrint = () => {
    window.print();
  };

  const togglePresentation = () => {
    setIsPresentationMode(!isPresentationMode);
  };

  // Presentation Mode View
  if (isPresentationMode) {
    const fontSizes = ['text-xl', 'text-3xl', 'text-5xl', 'text-7xl'];
    
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-y-auto flex flex-col">
        {/* Presentation Controls */}
        <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
           <div className="flex gap-2">
             <button onClick={() => setFontSize(Math.max(0, fontSize - 1))} className="text-white/70 hover:text-white p-2 border border-white/30 rounded">A-</button>
             <button onClick={() => setFontSize(Math.min(3, fontSize + 1))} className="text-white/70 hover:text-white p-2 border border-white/30 rounded">A+</button>
           </div>
           <button onClick={togglePresentation} className="text-white/70 hover:text-red-400 flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
             <X size={20} />
             Exit Read Mode
           </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 md:p-20 text-center">
          <h1 className="text-gold-500 font-serif font-bold text-4xl mb-12 opacity-80">{song.title}</h1>
          <div className={`text-white font-serif leading-relaxed whitespace-pre-line max-w-5xl mx-auto ${fontSizes[fontSize]}`}>
            {song.lyrics}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Link 
          to="/songs" 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Library
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePresentation}
            className="flex items-center gap-2 bg-gold-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors shadow-sm"
          >
            <MonitorPlay size={16} />
            Read Mode
          </button>
          <button 
             onClick={handlePrint}
             className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
             title="Print"
          >
            <Printer size={20} />
          </button>
          {canEdit && (
            <Link 
              to={`/songs/${song.id}/edit`}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Song Content */}
      <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden print:shadow-none">
        {/* Header */}
        <div className="bg-gold-50 border-b border-gold-100 p-8 text-center print:bg-white print:border-none print:p-0 print:mb-8">
          <div className="inline-block px-3 py-1 bg-white/80 rounded-full text-gold-700 text-xs font-bold uppercase tracking-widest mb-4 print:border print:border-gray-200">
            {song.category}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">{song.title}</h1>
          <div className="flex flex-col items-center gap-1 text-gray-600 italic font-serif">
             {song.author && <span>Written by {song.author}</span>}
             {song.language && <span>({song.language})</span>}
          </div>
        </div>

        {/* Lyrics */}
        <div className="p-8 md:p-12 md:pb-20 min-h-[400px]">
          <div className="prose prose-lg mx-auto text-center lyrics-text text-gray-800 leading-loose whitespace-pre-line">
            {song.lyrics}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 flex justify-between items-center text-xs text-gray-400 print:hidden">
          <span>Added: {new Date(song.createdAt).toLocaleDateString()}</span>
          <span>Choir II Ruvumera</span>
        </div>
      </div>
    </div>
  );
};

export default SongDetail;