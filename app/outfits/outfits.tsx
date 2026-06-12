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
import TabBar from "../../components/TabBar";
import { Outfit, OutfitImage, deleteOutfit, getOutfits } from "../../services/outfits";
import { fs, s } from "../../utils/scale";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0604 2.45407C16.3417 2.73536 16.4996 3.11683 16.4996 3.51457C16.4996 3.91232 16.3417 4.29378 16.0604 4.57507L8.63545 12.0001L16.0604 19.4251C16.3337 19.708 16.4849 20.0869 16.4815 20.4802C16.478 20.8735 16.3203 21.2497 16.0422 21.5278C15.7641 21.8059 15.3878 21.9637 14.9946 21.9671C14.6013 21.9705 14.2224 21.8193 13.9395 21.5461L5.45395 13.0606C5.17274 12.7793 5.01477 12.3978 5.01477 12.0001C5.01477 11.6023 5.17274 11.2209 5.45395 10.9396L13.9395 2.45407C14.2207 2.17287 14.6022 2.01489 15 2.01489C15.3977 2.01489 15.7792 2.17287 16.0604 2.45407Z" fill="#202C39"/>
</svg>`;

export default function OutfitsScreen() {
  const router = useRouter();
  const { fromCreation } = useLocalSearchParams<{ fromCreation?: string }>();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
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
      setIsOffline(false);
    } catch (e) {
      setIsOffline(true);
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
    if (isOffline) return;
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

  const MoodboardLayout = ({ images }: { images: OutfitImage[] }) => {
    const mainItems = images.filter((i) => i.position === "top" || i.position === "middle");
    const accentItems = images.filter((i) => i.position === "accent");
    const bottomItems = images.filter((i) => i.position === "bottom");
    const hasSideItems = accentItems.length > 0 || bottomItems.length > 0;

    if (!hasSideItems) {
      return (
        <View style={{ flex: 1, backgroundColor: "#FFFAF6" }}>
          {mainItems.map((img) => (
            <Image key={img.id} source={{ uri: img.image_url }} style={{ width: "100%", flex: 1, backgroundColor: "#FFFAF6" }} resizeMode="contain" />
          ))}
        </View>
      );
    }

    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#FFFAF6" }}>
        <View style={{ flex: 1.3 }}>
          {mainItems.map((img) => (
            <Image key={img.id} source={{ uri: img.image_url }} style={{ width: "100%", flex: 1, backgroundColor: "#FFFAF6" }} resizeMode="contain" />
          ))}
        </View>
        <View style={{ flex: 0.7 }}>
          <View style={{ flex: 1 }}>
            {accentItems.length > 0 ? accentItems.map((img) => (
              <Image key={img.id} source={{ uri: img.image_url }} style={{ width: "100%", flex: 1, backgroundColor: "#FFFAF6" }} resizeMode="contain" />
            )) : <View style={{ flex: 1, backgroundColor: "#FFFAF6" }} />}
          </View>
          <View style={{ flex: 1 }}>
            {bottomItems.length > 0 ? bottomItems.map((img) => (
              <Image key={img.id} source={{ uri: img.image_url }} style={{ width: "100%", flex: 1, backgroundColor: "#FFFAF6" }} resizeMode="contain" />
            )) : <View style={{ flex: 1, backgroundColor: "#FFFAF6" }} />}
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
          <SvgXml xml={backIcon} width={s(24)} height={s(24)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stylizacje</Text>
      </View>

      {outfits.length === 0 ? (
        <View style={styles.center}>
          {isOffline ? (
            <>
              <Ionicons name="wifi-outline" size={64} color="#D8CFC4" />
              <Text style={styles.emptyTitle}>Brak połączenia</Text>
              <Text style={styles.emptySubtitle}>Połącz się z internetem aby zobaczyć stylizacje.</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>Brak stylizacji</Text>
              <Text style={styles.emptySubtitle}>Stwórz swoją pierwszą stylizację!</Text>
              <TouchableOpacity style={styles.createButton} onPress={() => router.push("/outfits/selectImages")}>
                <Text style={styles.createButtonText}>Stwórz stylizację</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.outfitCard}
              onPress={() => setSelectedOutfit(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <MoodboardLayout images={item.images} />
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={selectedOutfit !== null} animationType="slide" onRequestClose={() => setSelectedOutfit(null)}>
        {selectedOutfit && (
          <View style={styles.fullscreenContainer}>
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity onPress={() => setSelectedOutfit(null)}>
                <SvgXml xml={backIcon} width={s(24)} height={s(24)} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Stylizacje</Text>
            </View>
            <View style={styles.fullscreenContent}>
              <View style={styles.fullscreenCard}>
                <MoodboardLayout images={selectedOutfit.images} />
              </View>
            </View>
          </View>
        )}
      </Modal>

      <Modal visible={deleteOptionsVisible} transparent animationType="fade" onRequestClose={() => setDeleteOptionsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Co chcesz zrobić z tą stylizacją?</Text>
            <TouchableOpacity style={styles.modalButtonDangerFull} onPress={() => { setDeleteOptionsVisible(false); setDeleteConfirmVisible(true); }}>
              <Text style={styles.modalButtonDangerText}>Usuń stylizację</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSafeFull} onPress={() => setDeleteOptionsVisible(false)}>
              <Text style={styles.modalButtonSafeFullText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteConfirmVisible} transparent animationType="fade" onRequestClose={() => setDeleteConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Czy na pewno chcesz usunąć tę stylizację?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonSafe} onPress={() => setDeleteConfirmVisible(false)}>
                <Text style={styles.modalButtonSafeText}>Zostaw</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonDanger} onPress={handleDeleteConfirm}>
                <Text style={styles.modalButtonDangerText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAF6", paddingTop: s(60) },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: s(20), paddingBottom: s(32), gap: s(8) },
  headerTitle: { fontSize: fs(24), fontWeight: "700", color: "#202C39", fontFamily: "Inter", lineHeight: fs(32) },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: s(12), paddingHorizontal: s(20) },
  emptyTitle: { fontSize: fs(20), fontWeight: "700", color: "#202C39", fontFamily: "Inter" },
  emptySubtitle: { fontSize: fs(15), color: "#A37D5D", textAlign: "center", fontFamily: "Inter" },
  createButton: { marginTop: s(8), backgroundColor: "#A37D5D", paddingVertical: s(14), paddingHorizontal: s(32), borderRadius: s(30) },
  createButtonText: { color: "#fff", fontSize: fs(16), fontWeight: "600", fontFamily: "Inter" },
  listContent: { paddingHorizontal: s(20), paddingBottom: s(120), gap: s(19) },
  row: { gap: s(19) },
  outfitCard: { width: s(167), height: s(230), borderRadius: s(30), borderWidth: 2, borderColor: "#EDE1D7", overflow: "hidden", backgroundColor: "#FFFAF6" },
  fullscreenContainer: { flex: 1, backgroundColor: "#FFFAF6", paddingTop: s(60) },
  fullscreenHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: s(20), paddingBottom: s(32), gap: s(8) },
  fullscreenContent: { flex: 1, paddingHorizontal: s(20), alignItems: "center" },
  fullscreenCard: { width: s(331), height: s(558), borderRadius: s(30), borderWidth: 2, borderColor: "#EDE1D7", overflow: "hidden", backgroundColor: "#FFFAF6" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#EDE1D7", borderRadius: s(30), padding: s(24), width: s(353), alignItems: "center", gap: s(12) },
  modalTitle: { fontSize: fs(16), fontWeight: "700", color: "#202C39", fontFamily: "Inter", textAlign: "center", lineHeight: fs(24) },
  modalButtons: { flexDirection: "row", gap: s(12) },
  modalButtonSafe: { width: s(152), height: s(50), borderRadius: s(30), backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonSafeText: { color: "#FFFFFF", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  modalButtonDanger: { width: s(152), height: s(50), borderRadius: s(30), borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  modalButtonDangerText: { color: "#E05744", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  modalButtonDangerFull: { width: s(305), height: s(48), borderRadius: s(30), borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  modalButtonSafeFull: { width: s(305), height: s(48), borderRadius: s(30), backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonSafeFullText: { color: "#FFFFFF", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
});