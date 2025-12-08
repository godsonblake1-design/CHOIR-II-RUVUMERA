export type Role = 'ADMIN' | 'EDITOR' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  profileImage?: string; // Base64 string for profile picture
  isChatSuspended?: boolean; // If true, user cannot send messages
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
  isActive: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string; // Text or Base64 data
  type: 'text' | 'image' | 'file';
  fileName?: string; // For files
  createdAt: string;
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