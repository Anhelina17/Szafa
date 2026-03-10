import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bjtjncvcncjrzghtyiok.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdGpuY3ZjbmNqcnpnaHR5aW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTk0NDcsImV4cCI6MjA4ODczNTQ0N30.cwoJ1UBxmF3N210dXtlAlXOEw6v_naLW27vJubUEVZw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);