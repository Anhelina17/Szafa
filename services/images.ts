import { supabase } from "../supabaseClient";

export const saveImage = async (uri: string) => {
  try {
    const fileName = `item-${Date.now()}.png`;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Brak użytkownika");

    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    console.log("arrayBuffer size:", arrayBuffer.byteLength);

    const { error: uploadError } = await supabase.storage
      .from("clothes")
      .upload(fileName, arrayBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.log("UPLOAD ERROR:", JSON.stringify(uploadError));
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("clothes")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    console.log("IMAGE URL:", imageUrl);

    const { data: imageData, error: dbError } = await supabase
      .from("images")
      .insert({
        image_url: imageUrl,
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.log("DB ERROR:", JSON.stringify(dbError));
      throw dbError;
    }

    return imageData;
  } catch (err) {
    console.log("SAVE IMAGE ERROR:", err);
    throw err;
  }
};

export const addImageToFolders = async (
  imageId: string,
  folderIds: string[]
) => {
  const relations = folderIds.map((folderId) => ({
    image_id: imageId,
    folder_id: folderId,
  }));

  const { error } = await supabase.from("image_folders").insert(relations);

  if (error) {
    console.log("RELATION ERROR:", error);
    throw error;
  }
};

export const getImagesByFolder = async (folderId: string) => {
  const { data, error } = await supabase
    .from("image_folders")
    .select("images(id, image_url, is_favorite)")
    .eq("folder_id", folderId);

  if (error) {
    console.log("GET IMAGES ERROR:", error);
    throw error;
  }

  return data?.map((item: any) => item.images).filter(Boolean) ?? [];
};

export const deleteImage = async (imageId: string, imageUrl: string) => {
  console.log("Usuwam powiązania zdjęcia:", imageId);

  const { error: relationsError } = await supabase
    .from("image_folders")
    .delete()
    .eq("image_id", imageId);

  if (relationsError) {
    console.log("RELATIONS ERROR:", JSON.stringify(relationsError));
    throw relationsError;
  }

  console.log("Powiązania usunięte, usuwam rekord...");

  const { error: dbError } = await supabase
    .from("images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    console.log("DB ERROR:", JSON.stringify(dbError));
    throw dbError;
  }

  console.log("Rekord usunięty, usuwam plik ze Storage...");

  const fileName = imageUrl.split("/").pop();
  if (fileName) {
    const { error: storageError } = await supabase.storage
      .from("clothes")
      .remove([fileName]);

    if (storageError) {
      console.log("STORAGE ERROR:", JSON.stringify(storageError));
    }
  }

  console.log("Zdjęcie usunięte!");
};

// Proce przełączenia pomiędzy ulubione/nie ulubione
export const toggleFavorite = async (imageId: string, currentValue: boolean) => {
  const { error } = await supabase
    .from("images")
    .update({ is_favorite: !currentValue })
    .eq("id", imageId);

  if (error) {
    console.log("TOGGLE FAVORITE ERROR:", JSON.stringify(error));
    throw error;
  }
};

export const getFavoriteImages = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Brak użytkownika");

  const { data, error } = await supabase
    .from("images")
    .select("id, image_url, is_favorite")
    .eq("user_id", userData.user.id)
    .eq("is_favorite", true);

  if (error) {
    console.log("GET FAVORITES ERROR:", JSON.stringify(error));
    throw error;
  }

  return data ?? [];
};