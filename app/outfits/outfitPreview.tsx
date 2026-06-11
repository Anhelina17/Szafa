import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { supabase } from "../../supabaseClient";
import { fs, s } from "../../utils/scale";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0604 2.45407C16.3417 2.73536 16.4996 3.11683 16.4996 3.51457C16.4996 3.91232 16.3417 4.29378 16.0604 4.57507L8.63545 12.0001L16.0604 19.4251C16.3337 19.708 16.4849 20.0869 16.4815 20.4802C16.478 20.8735 16.3203 21.2497 16.0422 21.5278C15.7641 21.8059 15.3878 21.9637 14.9946 21.9671C14.6013 21.9705 14.2224 21.8193 13.9395 21.5461L5.45395 13.0606C5.17274 12.7793 5.01477 12.3978 5.01477 12.0001C5.01477 11.6023 5.17274 11.2209 5.45395 10.9396L13.9395 2.45407C14.2207 2.17287 14.6022 2.01489 15 2.01489C15.3977 2.01489 15.7792 2.17287 16.0604 2.45407Z" fill="#202C39"/>
</svg>`;

type ImageItem = {
  id: string;
  image_url: string;
  is_favorite: boolean;
};

type MoodboardItem = {
  image: ImageItem;
  position: "top" | "middle" | "bottom" | "accent";
};

export default function OutfitPreviewScreen() {
  const router = useRouter();
  const { selectedImages } = useLocalSearchParams<{ selectedImages: string }>();
  const images: ImageItem[] = selectedImages ? JSON.parse(selectedImages) : [];

  const [moodboard, setMoodboard] = useState<MoodboardItem[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoLayout, setIsAutoLayout] = useState(false);
  const [noClothingDetected, setNoClothingDetected] = useState(false);
  const [savedModalVisible, setSavedModalVisible] = useState(false);

  useEffect(() => {
    if (images.length > 0) {
      generateMoodboard();
    }
  }, []);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateMoodboard = async () => {
    try {
      setIsLoadingAI(true);
      setIsAutoLayout(false);
      setNoClothingDetected(false);

      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) throw new Error("Brak klucza OpenAI API");

      const imageData = await Promise.all(
        images.map(async (img) => {
          const response = await fetch(img.image_url);
          const blob = await response.blob();
          const base64 = await blobToBase64(blob);
          return { img, base64 };
        })
      );

      const imageParts = imageData.map(({ base64 }) => ({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${base64}` },
      }));

      const prompt = `Jesteś stylistą mody. Przeanalizuj te ${images.length} zdjęcia i ułóż je w stylizację jako moodboard.

Dla każdego zdjęcia (numerowane od 0) zdecyduj pozycję:
- "top" — górna część ciała (koszulka, bluza, sweter, kurtka, sukienka)
- "middle" — dolna część ciała (spodnie, spódnica, szorty)
- "bottom" — obuwie (buty, sneakersy, sandały)
- "accent" — dodatki, akcesoria lub przedmioty które nie są odzieżą

Zasady:
1. Jeśli zdjęcie przedstawia odzież — przypisz odpowiednią pozycję
2. Jeśli zdjęcie NIE przedstawia odzieży — przypisz "accent"
3. Jeśli ŻADNE zdjęcie nie przedstawia odzieży — przypisz pozycje równomiernie i dodaj "noClothing": true
4. Zawsze zwróć pozycję dla KAŻDEGO zdjęcia

Zwróć TYLKO JSON, bez żadnego dodatkowego tekstu:
{"items":[{"id":"0","position":"top"},{"id":"1","position":"accent"}],"noClothing":false}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: [{ type: "text", text: prompt }, ...imageParts] }],
          max_tokens: 500,
          temperature: 0.1,
        }),
      });

      if (!response.ok) throw new Error("Błąd odpowiedzi OpenAI API");

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed: { items: { id: string; position: string }[]; noClothing: boolean } = JSON.parse(clean);

      if (parsed.noClothing) setNoClothingDetected(true);

      const result: MoodboardItem[] = parsed.items.map((item) => ({
        image: images[parseInt(item.id)],
        position: item.position as MoodboardItem["position"],
      }));

      setMoodboard(result);
    } catch (e) {
      console.error("Błąd generowania moodboardu:", e);
      setIsAutoLayout(true);
      setMoodboard(images.map((img) => ({ image: img, position: "top" as const })));
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Brak użytkownika");

      const { data: outfit, error: outfitError } = await supabase
        .from("outfits")
        .insert({ user_id: userData.user.id })
        .select()
        .single();

      if (outfitError) throw outfitError;

      const items = moodboard.map((item) => ({
        outfit_id: outfit.id,
        image_id: item.image.id,
        position: item.position,
      }));

      const { error: itemsError } = await supabase.from("outfit_items").insert(items);
      if (itemsError) throw itemsError;

      setSavedModalVisible(true);
    } catch (e) {
      console.error("Błąd zapisywania:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const topItems = moodboard.filter((i) => i.position === "top");
  const middleItems = moodboard.filter((i) => i.position === "middle");
  const mainItems = [...topItems, ...middleItems];
  const accentItems = moodboard.filter((i) => i.position === "accent");
  const bottomItems = moodboard.filter((i) => i.position === "bottom");
  const hasSideItems = accentItems.length > 0 || bottomItems.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <SvgXml xml={backIcon} width={s(24)} height={s(24)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tworzenie stylizacji</Text>
      </View>

      {isLoadingAI ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A37D5D" />
          <Text style={styles.loadingText}>AI układa Twoją stylizację...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {(isAutoLayout || noClothingDetected) && (
            <View style={styles.autoBanner}>
              <Text style={styles.autoText}>
                {noClothingDetected
                  ? "Nie rozpoznano odzieży — przedmioty zostały ułożone automatycznie."
                  : "AI nie odpowiedziało — stylizacja została ułożona automatycznie."}
              </Text>
              <TouchableOpacity onPress={generateMoodboard}>
                <Text style={styles.retryText}>Spróbuj ponownie</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Duży prostokąt ze stylizacją */}
          <View style={styles.moodboardCard}>
            {isAutoLayout ? (
              <View style={styles.autoGrid}>
                {moodboard.map((item) => (
                  <Image
                    key={item.image.id}
                    source={{ uri: item.image.image_url }}
                    style={styles.autoGridImage}
                    resizeMode="contain"
                  />
                ))}
              </View>
            ) : (
              <View style={styles.layout}>
                <View style={styles.leftColumn}>
                  {mainItems.map((item) => (
                    <Image
                      key={item.image.id}
                      source={{ uri: item.image.image_url }}
                      style={styles.leftColumnImage}
                      resizeMode="contain"
                    />
                  ))}
                </View>
                {hasSideItems && (
                  <View style={styles.rightColumn}>
                    <View style={styles.rightSlot}>
                      {accentItems.length > 0 ? (
                        accentItems.map((item) => (
                          <Image
                            key={item.image.id}
                            source={{ uri: item.image.image_url }}
                            style={styles.rightColumnImage}
                            resizeMode="contain"
                          />
                        ))
                      ) : (
                        <View style={styles.emptySlot} />
                      )}
                    </View>
                    <View style={styles.rightSlot}>
                      {bottomItems.length > 0 ? (
                        bottomItems.map((item) => (
                          <Image
                            key={item.image.id}
                            source={{ uri: item.image.image_url }}
                            style={styles.rightColumnImage}
                            resizeMode="contain"
                          />
                        ))
                      ) : (
                        <View style={styles.emptySlot} />
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Kнопка zapisz — 8px od karty */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Zapisz stylizację</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal
        visible={savedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSavedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Stylizacja została zapisana!</Text>
            <TouchableOpacity
              style={styles.modalButtonSafeFull}
              onPress={() => {
                setSavedModalVisible(false);
                router.push({ pathname: "/outfits/outfits", params: { fromCreation: "true" } });
              }}
            >
              <Text style={styles.modalButtonSafeFullText}>Zobacz stylizacje</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonDangerFull}
              onPress={() => {
                setSavedModalVisible(false);
                router.push("/wardrobe/wardrobe");
              }}
            >
              <Text style={styles.modalButtonDangerText}>Wróć na ekran główny</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    paddingTop: s(60),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(20),
    paddingBottom: s(32),
    gap: s(8),
  },
  headerTitle: {
    fontSize: fs(24),
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: fs(32),
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: s(16),
  },
  loadingText: {
    fontSize: fs(16),
    color: "#A37D5D",
    textAlign: "center",
    fontFamily: "Inter",
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingBottom: s(40),
    alignItems: "center",
  },
  autoBanner: {
    backgroundColor: "#FFF3E0",
    borderRadius: s(10),
    padding: s(12),
    marginBottom: s(16),
    alignItems: "center",
    gap: s(6),
    borderWidth: 1,
    borderColor: "#A37D5D",
    width: s(331),
  },
  autoText: {
    color: "#A37D5D",
    fontSize: fs(14),
    textAlign: "center",
    fontFamily: "Inter",
  },
  retryText: {
    color: "#A37D5D",
    fontWeight: "700",
    fontSize: fs(14),
    textDecorationLine: "underline",
    fontFamily: "Inter",
  },
  moodboardCard: {
    width: s(331),
    height: s(558),
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#EDE1D7",
    overflow: "hidden",
    backgroundColor: "#FFFAF6",
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    flex: 1.3,
    flexDirection: "column",
  },
  leftColumnImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#FFFAF6",
  },
  rightColumn: {
    flex: 0.7,
    flexDirection: "column",
  },
  rightSlot: {
    flex: 1,
    height: 200,
  },
  rightColumnImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFAF6",
  },
  emptySlot: {
    flex: 1,
    backgroundColor: "#FFFAF6",
  },
  autoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  autoGridImage: {
    width: "50%",
    height: 180,
    backgroundColor: "#FFFAF6",
  },
  saveButton: {
    width: s(331),
    height: s(48),
    backgroundColor: "#A37D5D",
    borderRadius: s(30),
    justifyContent: "center",
    alignItems: "center",
    marginTop: s(8),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFAF6",
    fontSize: fs(16),
    fontWeight: "400",
    fontFamily: "Inter",
    lineHeight: fs(24),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#EDE1D7",
    borderRadius: s(30),
    padding: s(24),
    width: s(353),
    alignItems: "center",
    gap: s(12),
  },
  modalTitle: {
    fontSize: fs(16),
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    textAlign: "center",
    lineHeight: fs(24),
  },
  modalButtonSafeFull: {
    width: s(305),
    height: s(48),
    borderRadius: s(30),
    backgroundColor: "#A37D5D",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonSafeFullText: {
    color: "#FFFFFF",
    fontSize: fs(16),
    fontFamily: "Inter",
    fontWeight: "400",
  },
  modalButtonDangerFull: {
    width: s(305),
    height: s(48),
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#E05744",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonDangerText: {
    color: "#E05744",
    fontSize: fs(16),
    fontFamily: "Inter",
    fontWeight: "400",
  },
});
