import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { deleteOutfit, getOutfits, Outfit, OutfitImage } from "../../services/outfits";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0603 2.45407C16.3415 2.73536 16.4995 3.11683 16.4995 3.51457C16.4995 3.91232 16.3415 4.29378 16.0603 4.57507L8.63533 12.0001L16.0603 19.4251C16.3336 19.708 16.4848 20.0869 16.4813 20.4802C16.4779 20.8735 16.3202 21.2497 16.0421 21.5278C15.7639 21.8059 15.3877 21.9637 14.9944 21.9671C14.6011 21.9705 14.2222 21.8193 13.9393 21.5461L5.45383 13.0606C5.17262 12.7793 5.01465 12.3978 5.01465 12.0001C5.01465 11.6023 5.17262 11.2209 5.45383 10.9396L13.9393 2.45407C14.2206 2.17287 14.6021 2.01489 14.9998 2.01489C15.3976 2.01489 15.779 2.17287 16.0603 2.45407Z" fill="#202C39"/>
</svg>`;

export default function OutfitsScreen() {
  const router = useRouter();
  const { fromCreation } = useLocalSearchParams<{ fromCreation?: string }>();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [deleteOptionsVisible, setDeleteOptionsVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState<Outfit | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadOutfits();
    }, [])
  );

  const loadOutfits = async () => {
    try {
      setIsLoading(true);
      const data = await getOutfits();
      setOutfits(data);
    } catch (e) {
      console.error("Błąd ładowania stylizacji:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (fromCreation === "true") {
      router.push("/wardrobe/wardrobe");
    } else {
      router.back();
    }
  };

  const handleLongPress = (outfit: Outfit) => {
    setOutfitToDelete(outfit);
    setDeleteOptionsVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!outfitToDelete) return;
    setDeleteConfirmVisible(false);
    try {
      await deleteOutfit(outfitToDelete.id);
      setSelectedOutfit(null);
      setOutfitToDelete(null);
      await loadOutfits();
    } catch (e) {
      console.error("Błąd usuwania stylizacji:", e);
    }
  };

  const MoodboardLayout = ({
    images,
    imageHeight,
  }: {
    images: OutfitImage[];
    imageHeight: number;
  }) => {
    const mainItems = images.filter(
      (i) => i.position === "top" || i.position === "middle"
    );
    const accentItems = images.filter((i) => i.position === "accent");
    const bottomItems = images.filter((i) => i.position === "bottom");
    const hasSideItems = accentItems.length > 0 || bottomItems.length > 0;

    if (!hasSideItems) {
      return (
        <View style={styles.previewSingle}>
          {mainItems.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.image_url }}
              style={[styles.previewImageFull, { height: imageHeight }]}
              resizeMode="contain"
            />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.previewLayout}>
        <View style={styles.previewLeft}>
          {mainItems.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.image_url }}
              style={[styles.previewImageLeft, { height: imageHeight }]}
              resizeMode="contain"
            />
          ))}
        </View>
        <View style={styles.previewRight}>
          <View style={{ flex: 1 }}>
            {accentItems.length > 0 ? (
              accentItems.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.image_url }}
                  style={[styles.previewImageRight, { height: imageHeight }]}
                  resizeMode="contain"
                />
              ))
            ) : (
              <View style={{ height: imageHeight, backgroundColor: "#ffffff" }} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            {bottomItems.length > 0 ? (
              bottomItems.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.image_url }}
                  style={[styles.previewImageRight, { height: imageHeight }]}
                  resizeMode="contain"
                />
              ))
            ) : (
              <View style={{ height: imageHeight, backgroundColor: "#ffffff" }} />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A37D5D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <SvgXml xml={backIcon} width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moje Stylizacje</Text>
      </View>

      {outfits.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="shirt-outline" size={64} color="#D8CFC4" />
          <Text style={styles.emptyTitle}>Brak stylizacji</Text>
          <Text style={styles.emptySubtitle}>
            Stwórz swoją pierwszą stylizację!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/outfits/selectImages")}
          >
            <Text style={styles.createButtonText}>Stwórz stylizację</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.outfitCard}
              onPress={() => setSelectedOutfit(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <MoodboardLayout images={item.images} imageHeight={120} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal pełnego ekranu */}
      <Modal
        visible={selectedOutfit !== null}
        animationType="slide"
        onRequestClose={() => setSelectedOutfit(null)}
      >
        {selectedOutfit && (
          <View style={styles.fullscreenContainer}>
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedOutfit(null)}
              >
                <Ionicons name="close" size={26} color="#202C39" />
              </TouchableOpacity>
            </View>
            <View style={styles.fullscreenMoodboard}>
              <MoodboardLayout images={selectedOutfit.images} imageHeight={200} />
            </View>
          </View>
        )}
      </Modal>

      {/* Modal opcji long press */}
      <Modal
        visible={deleteOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteOptionsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Co chcesz zrobić z tą stylizacją?</Text>
            <TouchableOpacity
              style={styles.modalButtonDangerFull}
              onPress={() => {
                setDeleteOptionsVisible(false);
                setDeleteConfirmVisible(true);
              }}
            >
              <Text style={styles.modalButtonDangerText}>Usuń stylizację</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSafeFull}
              onPress={() => setDeleteOptionsVisible(false)}
            >
              <Text style={styles.modalButtonSafeFullText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal potwierdzenia usunięcia */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Czy na pewno chcesz usunąć tę stylizację?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSafe}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.modalButtonSafeText}>Zostaw</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonDanger}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.modalButtonDangerText}>Usuń</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 56,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#A37D5D",
    textAlign: "center",
    fontFamily: "Inter",
  },
  createButton: {
    marginTop: 8,
    backgroundColor: "#A37D5D",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  outfitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8DDD4",
  },
  previewSingle: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  previewImageFull: {
    width: "100%",
    backgroundColor: "#ffffff",
  },
  previewLayout: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  previewLeft: {
    flex: 1.3,
    flexDirection: "column",
  },
  previewImageLeft: {
    width: "100%",
    backgroundColor: "#ffffff",
  },
  previewRight: {
    flex: 0.7,
    flexDirection: "column",
  },
  previewImageRight: {
    width: "100%",
    backgroundColor: "#ffffff",
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#FFFAF6",
  },
  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  fullscreenMoodboard: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#EDE1D7",
    borderRadius: 30,
    padding: 24,
    width: 353,
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    textAlign: "center",
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonSafe: {
    width: 152,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#A37D5D",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonSafeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "400",
  },
  modalButtonDanger: {
    width: 152,
    height: 50,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E05744",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonDangerText: {
    color: "#E05744",
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "400",
  },
  modalButtonDangerFull: {
    width: 305,
    height: 48,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E05744",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonSafeFull: {
    width: 305,
    height: 48,
    borderRadius: 30,
    backgroundColor: "#A37D5D",
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonSafeFullText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "400",
  },
});