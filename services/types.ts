
export type Role = 'ADMIN' | 'EDITOR' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string; // Base64 string for profile picture
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  category: string;
  language?: string;
  author?: string;
  createdBy: string; // User ID
  updatedBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export type VoicePart = 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist';

export interface Member {
  id: string;
  name: string;
  voicePart: VoicePart;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'file';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type?: MessageType;
  mediaUrl?: string; // Base64 or URL
  fileName?: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DatabaseExport {
  users: (User & { passwordHash: string })[];
  songs: Song[];
  members: Member[];
  messages: ChatMessage[];
  version: number;
  exportedAt: string;
}

export const SONG_CATEGORIES = [
  'Worship',
  'Praise',
  'Special',
  'Hymn',
  'Traditional',
  'Contemporary',
  'Christmas',
  'Easter'
];

export const VOICE_PARTS: VoicePart[] = [
  'Soprano',
  'Alto',
  'Tenor',
  'Bass',
  'Instrumentalist'
];
