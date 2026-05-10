import { supabase } from "../supabaseClient";

export const saveImage = async (uri: string) => {
  try {
    const fileName = `item-${Date.now()}.png`;

    // Pobieramy zalogowanego użytkownika
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Brak użytkownika");

    // Używamy fetch z arrayBuffer
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

    // Zapisujemy URL i user_id do tabeli images
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

// Pobiera wszystkie zdjęcia z danego folderu
export const getImagesByFolder = async (folderId: string) => {
    const { data, error } = await supabase
      .from("image_folders")
      .select("images(id, image_url)")
      .eq("folder_id", folderId);
  
    if (error) {
      console.log("GET IMAGES ERROR:", error);
      throw error;
    }
  
    // Wyciągamy zdjęcia z zagnieżdżonej struktury
    return data?.map((item: any) => item.images).filter(Boolean) ?? [];
  };