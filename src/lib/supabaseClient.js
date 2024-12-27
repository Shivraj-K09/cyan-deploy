import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getRedirectTo = () => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    // Production web environment
    return `${import.meta.env.VITE_SITE_URL}/auth/callback`;
  } else if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    // Local web environment
    return "http://localhost:5173/auth/callback";
  } else {
    // Mobile environment
    return "com.cyan.app://auth/callback";
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    redirectTo: getRedirectTo(),
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
