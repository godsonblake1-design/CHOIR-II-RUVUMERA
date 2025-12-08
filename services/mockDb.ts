import { User, Song, Member, DatabaseExport, ChatMessage } from '../types';

const STORAGE_KEYS = {
  USERS: 'choir_app_users',
  SONGS: 'choir_app_songs',
  MEMBERS: 'choir_app_members',
  MESSAGES: 'choir_app_messages'
};

class DbService {
  constructor() {
    this.seedAdmin();
  }

  private seedAdmin() {
    const users = this.getUsersSync();
    if (!users.find(u => u.email === 'linox257@gmail.com')) {
      const admin: User & { passwordHash: string } = {
        id: '1',
        name: 'Main Admin',
        email: 'linox257@gmail.com',
        role: 'ADMIN',
        passwordHash: 'My company1',
        createdAt: new Date().toISOString()
      };
      users.push(admin);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      console.log('Admin account seeded.');
    }
  }

  // --- Users ---

  getUsersSync(): (User & { passwordHash: string })[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  async getUsers(): Promise<(User & { passwordHash: string })[]> {
    return this.getUsersSync();
  }

  async getUserById(id: string) {
    return this.getUsersSync().find(u => u.id === id);
  }

  async getUserByEmail(email: string) {
    return this.getUsersSync().find(u => u.email === email);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }): Promise<User> {
    const users = this.getUsersSync();
    if (users.find(u => u.email === user.email)) {
      throw new Error('User already exists');
    }
    const newUser = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'role'>>): Promise<User> {
    const users = this.getUsersSync();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser;
  }

  async deleteUser(id: string) {
    let users = this.getUsersSync();
    users = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  async resetUserPassword(id: string, newPasswordHash: string) {
    const users = this.getUsersSync();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        users[userIndex].passwordHash = newPasswordHash;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  // --- Songs ---

  getSongsSync(): Song[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SONGS) || '[]');
  }

  async getSongs(): Promise<Song[]> {
    return this.getSongsSync().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSong(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> {
    const songs = this.getSongsSync();
    const newSong: Song = {
      ...song,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    songs.push(newSong);
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    return newSong;
  }

  async updateSong(id: string, updates: Partial<Omit<Song, 'id' | 'createdAt' | 'createdBy'>>): Promise<Song> {
    const songs = this.getSongsSync();
    const index = songs.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Song not found');

    const updatedSong = {
      ...songs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    songs[index] = updatedSong;
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    return updatedSong;
  }

  async deleteSong(id: string) {
    let songs = this.getSongsSync();
    songs = songs.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
  }

  // --- Members ---

  getMembersSync(): Member[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
  }

  async getMembers(): Promise<Member[]> {
    return this.getMembersSync().sort((a, b) => a.name.localeCompare(b.name));
  }

  async createMember(member: Omit<Member, 'id' | 'createdAt'>): Promise<Member> {
    const members = this.getMembersSync();
    const newMember: Member = {
      ...member,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return newMember;
  }

  async updateMember(id: string, updates: Partial<Omit<Member, 'id' | 'createdAt'>>): Promise<Member> {
    const members = this.getMembersSync();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Member not found');
    
    const updatedMember = { ...members[index], ...updates };
    members[index] = updatedMember;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    return updatedMember;
  }

  async deleteMember(id: string) {
    let members = this.getMembersSync();
    members = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }

  // --- Chat ---

  getMessagesSync(): ChatMessage[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  }

  async getMessages(): Promise<ChatMessage[]> {
    return this.getMessagesSync().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const messages = this.getMessagesSync();
    const newMessage: ChatMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return newMessage;
  }

  async deleteMessage(id: string) {
    let messages = this.getMessagesSync();
    messages = messages.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }

  // --- Backup ---

  async exportDatabase(): Promise<string> {
    const data: DatabaseExport = {
      users: this.getUsersSync(),
      songs: this.getSongsSync(),
      members: this.getMembersSync(),
      messages: this.getMessagesSync(),
      version: 1,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data);
  }

  async importDatabase(jsonString: string) {
    try {
      const data: DatabaseExport = JSON.parse(jsonString);
      if (Array.isArray(data.users)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (Array.isArray(data.songs)) localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(data.songs));
      if (Array.isArray(data.members)) localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
      if (Array.isArray(data.messages)) localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(data.messages));
      return true;
    } catch (e) {
      throw new Error('Invalid backup file');
    }
  }
}

export const mockDb = new DbService();