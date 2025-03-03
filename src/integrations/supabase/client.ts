
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tihibpfypycjsraijtcd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaGlicGZ5cHljanNyYWlqdGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTYxOTYsImV4cCI6MjA1NjU3MjE5Nn0.cWdp3lWbaBVNKDfwFbrGhx4q1X0Vl4zyVu__CzO2gQM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
