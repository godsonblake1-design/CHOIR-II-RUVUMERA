import React, { useState, useMemo, useEffect } from 'react';
import { mockDb } from '../services/mockDb';
import { Song, SONG_CATEGORIES } from '../types';
import { Search, Filter, BookOpen, Edit2, Trash2, Music, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Songs = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');

  const fetchSongs = async () => {
    const data = await mockDb.getSongs();
    setSongs(data);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      await mockDb.deleteSong(id);
      fetchSongs();
    }
  };

  const filteredSongs = useMemo(() => {
    let result = songs.filter(song => {
      const matchesSearch = 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        song.lyrics.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || song.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [songs, searchTerm, selectedCategory, sortBy]);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 font-serif">Song Library</h1>
           <p className="text-gray-500">Browse and search the choir repertoire</p>
        </div>
        {canEdit && (
            <Link 
              to="/songs/new" 
              className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Add New Song
            </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title or lyrics..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 appearance-none bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {SONG_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="md:w-48 relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 appearance-none bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">Newest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map(song => (
          <div key={song.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col group overflow-hidden">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gold-600 bg-gold-50 px-2 py-1 rounded uppercase tracking-wider">
                  {song.category}
                </span>
                {song.language && (
                  <span className="text-xs text-gray-400 font-medium">{song.language}</span>
                )}
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 line-clamp-1">{song.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-3 font-serif italic opacity-80">
                "{song.lyrics.slice(0, 100)}..."
              </p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <Link 
                to={`/songs/${song.id}`}
                className="text-gray-600 hover:text-gold-600 font-medium text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform"
              >
                <BookOpen size={16} />
                View Lyrics
              </Link>
              
              {canEdit && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    to={`/songs/${song.id}/edit`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(song.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Music size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No songs found</h3>
          <p className="text-gray-500">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
};

export default Songs;