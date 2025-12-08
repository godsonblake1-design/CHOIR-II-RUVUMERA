import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ftpxwoqmxduztxkrumts.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cHh3b3FteGR1enR4a3J1bXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDA4MTcsImV4cCI6MjA4MDUxNjgxN30.43HMT6ANSudRyzKpTOaBM4-sgJ5hke5RC4vPVjuW1v0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
