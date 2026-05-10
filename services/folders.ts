import { supabase } from "../supabaseClient";

// 🔥 pobieranie folderów użytkownika
export const getFolders = async () => {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    throw new Error("Brak użytkownika");
  }

  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Błąd pobierania folderów:", error);
    throw error;
  }

  return folders;
};