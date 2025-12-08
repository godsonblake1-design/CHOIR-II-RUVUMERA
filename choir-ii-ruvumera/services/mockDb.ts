import { User, Song, Member, DatabaseExport, ChatMessage } from '../types';
import { supabase } from '../lib/supabaseClient';

class DbService {
  
  // --- Admin Seeding ---
  // Ensures the default admin exists on first run, but respects changes if they edit it later.
  async seedAdmin() {
    try {
      // Use maybeSingle() to avoid error when user doesn't exist
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'linox257@gmail.com')
        .maybeSingle();

      if (error) {
          console.error("Error checking for admin:", error);
          return;
      }

      // If no admin found, create one
      if (!data) {
        console.log("Seeding Default Admin...");
        const { error: insertError } = await supabase.from('users').insert([{
          email: 'linox257@gmail.com',
          name: 'Main Admin',
          role: 'ADMIN',
          passwordHash: 'My company1', // Default password
          isChatSuspended: false,
          createdAt: new Date().toISOString()
        }]);
        
        if (insertError) {
             console.error("Failed to seed admin:", insertError);
        } else {
             console.log("Admin seeded successfully.");
        }
      }
    } catch (e) {
      console.error("Admin seed check failed", e);
    }
  }

  // --- User Methods ---

  async getUsers(): Promise<(User & { passwordHash: string })[]> {
    const { data, error } = await supabase.from('users').select('*').order('createdAt', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle to avoid 406 error if not found
    
    if (error) throw error;
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }): Promise<User> {
    // Check for existing
    const existing = await this.getUserByEmail(user.email);
    if (existing) throw new Error('User already exists');

    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    
    const { passwordHash, ...safeUser } = data;
    return safeUser;
  }

  async updateUser(id: string, updates: Partial<User & { profileImage?: string }>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async adminUpdateUserEmail(id: string, newEmail: string) {
    const existing = await this.getUserByEmail(newEmail);
    if (existing && existing.id !== id) throw new Error('Email is already in use');

    const { data, error } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resetUserPassword(id: string, newPasswordHash: string) {
    const { error } = await supabase
      .from('users')
      .update({ passwordHash: newPasswordHash })
      .eq('id', id);

    if (error) throw error;
  }

  async toggleChatSuspension(id: string, isSuspended: boolean) {
    const { error } = await supabase
      .from('users')
      .update({ isChatSuspended: isSuspended })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Song Methods ---

  async getSongs(): Promise<Song[]> {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSong(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> {
    const { data, error } = await supabase
      .from('songs')
      .insert([song])
      .select()
      .single();

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
    const { error } = await supabase.from('songs').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Member Methods ---

  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createMember(member: Omit<Member, 'id' | 'createdAt'>): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateMember(id: string, updates: Partial<Omit<Member, 'id' | 'createdAt'>>): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMember(id: string) {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Chat Methods ---

  async getMessages(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('createdAt', { ascending: true })
        .limit(200);
        
    if (error) throw error;
    return data || [];
  }

  async sendMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('messages')
      .insert([msg])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMessage(id: string) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Backup / Restore ---
  // Using Supabase data to generate the JSON export

  async exportDatabase(): Promise<string> {
    const [users, songs, members, messages] = await Promise.all([
        this.getUsers(),
        this.getSongs(),
        this.getMembers(),
        this.getMessages()
    ]);

    const data: DatabaseExport = {
      users,
      songs,
      members,
      messages,
      version: 3, // Supabase version
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data);
  }

  async importDatabase(jsonString: string) {
    try {
      const data: DatabaseExport = JSON.parse(jsonString);
      
      if (!Array.isArray(data.songs)) {
        throw new Error('Invalid database format');
      }

      // TRUNCATE AND INSERT
      
      // 1. Clear existing data (Cleanup)
      // Using filter neq '00000000-0000-0000-0000-000000000000' to essentially delete all rows safely
      await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Insert new data
      if (data.users && data.users.length) await supabase.from('users').insert(data.users);
      if (data.songs && data.songs.length) await supabase.from('songs').insert(data.songs);
      if (data.members && data.members.length) await supabase.from('members').insert(data.members);
      if (data.messages && data.messages.length) await supabase.from('messages').insert(data.messages);
      
      return true;
    } catch (e) {
      console.error('Import failed', e);
      throw new Error('Failed to import database. Check console for details.');
    }
  }
}

export const mockDb = new DbService();