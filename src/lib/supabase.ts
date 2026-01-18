import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gewngtjeujvieqtylxui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdld25ndGpldWp2aWVxdHlseHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTQwNDksImV4cCI6MjA4NDI3MDA0OX0.vdmOwiDg0F8Svai3u7bGyipM2wMmimyjT8-lM1Go2AI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
