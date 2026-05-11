import { supabase } from "../supabaseClient";

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

// Zmiana nazwy folderu
export const renameFolder = async (folderId: string, newName: string) => {
  const { error } = await supabase
    .from("folders")
    .update({ name: newName })
    .eq("id", folderId);

  if (error) {
    console.error("Błąd zmiany nazwy:", error);
    throw error;
  }
};

// Usuwanie folderu — najpierw usuwamy powiązania, potem folder
export const deleteFolder = async (folderId: string) => {
  console.log("Usuwam powiązania dla folderu:", folderId);

  const { error: relationsError } = await supabase
    .from("image_folders")
    .delete()
    .eq("folder_id", folderId);

  if (relationsError) {
    console.log("RELATIONS ERROR:", JSON.stringify(relationsError));
    throw relationsError;
  }

  console.log("Powiązania usunięte, usuwam folder...");

  const { error: folderError } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (folderError) {
    console.log("FOLDER ERROR:", JSON.stringify(folderError));
    throw folderError;
  }

  console.log("Folder usunięty!");
};