import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockDb';
import { Music, Users, Clock, Mic2, Loader2 } from 'lucide-react';
import { Song, User } from '../types';

const Dashboard = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedSongs, fetchedUsers] = await Promise.all([
          mockDb.getSongs(),
          mockDb.getUsers()
        ]);
        setSongs(fetchedSongs);
        setUsers(fetchedUsers);
      } catch (e) {
        console.error("Error loading dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subText && <p className="text-xs text-gray-400 mt-2">{subText}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  const recentSongs = songs
    .slice(0, 5); // Already sorted by DB query

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold-500" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Dashboard</h1>
        <p className="text-gray-500">Welcome back to Choir II Ruvumera Administration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Songs" 
          value={songs.length} 
          icon={Music} 
          colorClass="bg-gold-500" 
          subText="In the library"
        />
        <StatCard 
          title="Active Users" 
          value={users.length} 
          icon={Users} 
          colorClass="bg-blue-500"
          subText="Admin, Editors, Users" 
        />
        <StatCard 
          title="Categories" 
          value={new Set(songs.map(s => s.category)).size} 
          icon={Mic2} 
          colorClass="bg-purple-500"
          subText="Unique genres" 
        />
        <StatCard 
          title="Last Updated" 
          value="Today" 
          icon={Clock} 
          colorClass="bg-green-500" 
          subText="System active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">Recently Added Songs</h3>
          <div className="space-y-4">
            {recentSongs.map(song => (
              <div key={song.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                <div>
                  <h4 className="font-medium text-gray-900">{song.title}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {song.category}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(song.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recentSongs.length === 0 && (
              <p className="text-gray-400 text-center py-4">No songs added yet.</p>
            )}
          </div>
        </div>

        <div className="bg-gold-50 rounded-xl p-6 border border-gold-100">
           <h3 className="text-lg font-bold text-gold-800 mb-2 font-serif">Choir Vision</h3>
           <p className="text-gold-700 leading-relaxed italic">
             "To sing with passion, worship with truth, and bring light through our melodies."
           </p>
           <div className="mt-6 flex gap-4">
             <div className="bg-white/60 p-4 rounded-lg flex-1">
               <p className="text-xs font-bold text-gold-800 uppercase tracking-wide">Next Rehearsal</p>
               <p className="text-lg font-semibold text-gray-800">Friday, 6:00 PM</p>
             </div>
             <div className="bg-white/60 p-4 rounded-lg flex-1">
               <p className="text-xs font-bold text-gold-800 uppercase tracking-wide">Upcoming Service</p>
               <p className="text-lg font-semibold text-gray-800">Sunday, 9:00 AM</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;