
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvkocwozalajyweupybm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2a29jd296YWxhanl3ZXVweWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDU1NzUsImV4cCI6MjA4MDc4MTU3NX0.g9Eo4cSEoW1dEC3I61XEvzZUbzYE69gkvV4-UCg690Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
