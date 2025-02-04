import { supabase } from "@/lib/supabaseClient";

export async function checkBlockedStatus() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from("users")
      .select("is_blocked")
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    return data.is_blocked;
  } catch (error) {
    console.error("Error checking blocked status:", error);
    return null;
  }
}
a;
