 import { supabase } from "../supabaseClient";

export type OutfitImage = {
  id: string;
  image_url: string;
  position: "top" | "middle" | "bottom" | "accent";
};

export type Outfit = {
  id: string;
  created_at: string;
  images: OutfitImage[];
};

export const getOutfits = async (): Promise<Outfit[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Brak użytkownika");

  const { data: outfitsData, error: outfitsError } = await supabase
    .from("outfits")
    .select("id, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (outfitsError) {
    console.error("Błąd pobierania stylizacji:", outfitsError);
    throw outfitsError;
  }

  const outfits = await Promise.all(
    (outfitsData ?? []).map(async (outfit) => {
      const { data: itemsData, error: itemsError } = await supabase
        .from("outfit_items")
        .select("image_id, position")
        .eq("outfit_id", outfit.id);

      if (itemsError || !itemsData || itemsData.length === 0) {
        return { ...outfit, images: [] };
      }

      const imageIds = itemsData.map((item: any) => item.image_id);

      const { data: imagesData, error: imagesError } = await supabase
        .from("images")
        .select("id, image_url")
        .in("id", imageIds);

      if (imagesError || !imagesData) {
        return { ...outfit, images: [] };
      }

      const images: OutfitImage[] = itemsData.map((item: any) => {
        const image = imagesData.find((img) => img.id === item.image_id);
        return {
          id: image?.id ?? "",
          image_url: image?.image_url ?? "",
          position: item.position ?? "top",
        };
      });

      return { ...outfit, images };
    })
  );

  return outfits;
};

export const deleteOutfit = async (outfitId: string): Promise<void> => {
  const { error: outfitError } = await supabase
    .from("outfits")
    .delete()
    .eq("id", outfitId);

  if (outfitError) {
    console.error("Błąd usuwania stylizacji:", outfitError);
    throw outfitError;
  }
};