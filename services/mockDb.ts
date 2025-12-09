
import { supabase } from '../lib/supabaseClient';
import { User, Song, Member, DatabaseExport, ChatMessage } from '../types';

class DbService {
  constructor() {
    // Fire and forget, but catch errors to prevent crashing main thread
    this.seedAdmin().catch(e => console.error("Init Error:", e));
  }

  // Helper to check if tables exist
  async checkConnection(): Promise<boolean> {
    const { error } = await supabase.from('users').select('id').limit(1);
    // If error code is 42P01 (undefined_table), tables are missing
    if (error && error.code === '42P01') return false;
    // Other errors might be network, but we assume connected if not 42P01
    return true;
  }

  // Check if Admin exists in Supabase, if not create it
  private async seedAdmin() {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'linox257@gmail.com');

      if (error) return; // Database likely not set up yet

      if (!users || users.length === 0) {
        console.log('Seeding admin...');
        await supabase.from('users').insert([{
          name: 'Main Admin',
          email: 'linox257@gmail.com',
          role: 'ADMIN',
          passwordHash: 'My company1'
        }]);
      }
    } catch (e) {
      console.error("Error seeding admin", e);
    }
  }

  // --- Users ---

  async getUsers(): Promise<(User & { passwordHash: string })[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  }

  async getUserById(id: string) {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    
    // Auto-fix: Create admin if missing during login attempt
    if (!data && email === 'linox257@gmail.com') {
         console.log("Admin missing during login. Attempting to create...");
         const adminPayload = {
            name: 'Main Admin',
            email: 'linox257@gmail.com',
            role: 'ADMIN',
            passwordHash: 'My company1'
        };
        const { data: newAdmin, error: createError } = await supabase.from('users').insert([adminPayload]).select().single();
        if (!createError) return newAdmin;
    }
    return data;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }): Promise<User> {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    const { passwordHash, ...safeUser } = data;
    return safeUser;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'role'>>): Promise<User> {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    const { passwordHash, ...safeUser } = data;
    return safeUser;
  }

  async deleteUser(id: string) {
    await supabase.from('users').delete().eq('id', id);
  }

  async resetUserPassword(id: string, newPasswordHash: string) {
    await supabase.from('users').update({ passwordHash: newPasswordHash }).eq('id', id);
  }

  // --- Songs ---

  async getSongs(): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSong(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> {
    const { data, error } = await supabase.from('songs').insert([song]).select().single();
    if (error) throw error;
    return data;
  }

  async updateSong(id: string, updates: Partial<Omit<Song, 'id' | 'createdAt' | 'createdBy'>>): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteSong(id: string) {
    await supabase.from('songs').delete().eq('id', id);
  }

  // --- Members ---

  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createMember(member: Omit<Member, 'id' | 'createdAt'>): Promise<Member> {
    const { data, error } = await supabase.from('members').insert([member]).select().single();
    if (error) throw error;
    return data;
  }

  async updateMember(id: string, updates: Partial<Omit<Member, 'id' | 'createdAt'>>): Promise<Member> {
    const { data, error } = await supabase.from('members').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteMember(id: string) {
    await supabase.from('members').delete().eq('id', id);
  }

  // --- Chat ---

  async getMessages(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    // Note: ID and Timestamp are handled by Default DB values in SQL Schema
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteMessage(id: string) {
    await supabase.from('messages').delete().eq('id', id);
  }

  // --- Backup (Export JSON) ---

  async exportDatabase(): Promise<string> {
    const { data: users } = await supabase.from('users').select('*');
    const { data: songs } = await supabase.from('songs').select('*');
    const { data: members } = await supabase.from('members').select('*');
    const { data: messages } = await supabase.from('messages').select('*');

    const data: DatabaseExport = {
      users: users || [],
      songs: songs || [],
      members: members || [],
      messages: messages || [],
      version: 1,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data);
  }

  async importDatabase(jsonString: string) {
    try {
      const data: DatabaseExport = JSON.parse(jsonString);
      
      if (Array.isArray(data.users) && data.users.length > 0) {
        await supabase.from('users').upsert(data.users);
      }
      if (Array.isArray(data.songs) && data.songs.length > 0) {
        await supabase.from('songs').upsert(data.songs);
      }
      if (Array.isArray(data.members) && data.members.length > 0) {
        await supabase.from('members').upsert(data.members);
      }
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        await supabase.from('messages').upsert(data.messages);
      }
      return true;
    } catch (e) {
      throw new Error('Invalid backup file or database error');
    }
  }
}

export const mockDb = new DbService();
