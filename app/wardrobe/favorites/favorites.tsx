import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SvgXml } from "react-native-svg";
import TabBar from "../../../components/TabBar";
import { deleteImage, getFavoriteImages, toggleFavorite } from "../../../services/images";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0603 2.45407C16.3415 2.73536 16.4995 3.11683 16.4995 3.51457C16.4995 3.91232 16.3415 4.29378 16.0603 4.57507L8.63533 12.0001L16.0603 19.4251C16.3336 19.708 16.4848 20.0869 16.4813 20.4802C16.4779 20.8735 16.3202 21.2497 16.0421 21.5278C15.7639 21.8059 15.3877 21.9637 14.9944 21.9671C14.6011 21.9705 14.2222 21.8193 13.9393 21.5461L5.45383 13.0606C5.17262 12.7793 5.01465 12.3978 5.01465 12.0001C5.01465 11.6023 5.17262 11.2209 5.45383 10.9396L13.9393 2.45407C14.2206 2.17287 14.6021 2.01489 14.9998 2.01489C15.3976 2.01489 15.779 2.17287 16.0603 2.45407Z" fill="#202C39"/>
</svg>`;

const heartFilledIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" fill="#A37D5D" stroke="#A37D5D" stroke-width="2.06897" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function FavoritesScreen() {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [removeFavoriteModalVisible, setRemoveFavoriteModalVisible] = useState(false);
  const [deleteOptionsModalVisible, setDeleteOptionsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const data = await getFavoriteImages();
      setImages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (item: any) => {
    setSelectedItem(item);
    setRemoveFavoriteModalVisible(true);
  };

  const handleRemoveFavoriteConfirm = async () => {
    if (!selectedItem) return;
    setRemoveFavoriteModalVisible(false);
    try {
      await toggleFavorite(selectedItem.id, selectedItem.is_favorite ?? false);
      setImages((prev) => prev.filter((img) => img.id !== selectedItem.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLongPress = (item: any) => {
    setSelectedItem(item);
    setDeleteOptionsModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setDeleteConfirmModalVisible(false);
    try {
      await deleteImage(selectedItem.id, selectedItem.image_url);
      await loadFavorites();
    } catch (e) {
      console.error(e);
    }
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SvgXml xml={backIcon} width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Ulubione</Text>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tutaj jeszcze nic nie ma</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageContainer}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => handleToggleFavorite(item)}
              >
                <SvgXml xml={heartFilledIcon} width={24} height={24} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={removeFavoriteModalVisible} transparent animationType="fade" onRequestClose={() => setRemoveFavoriteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Czy na pewno chcesz usunąć to zdjęcie z "Ulubionych"?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonSafe} onPress={() => setRemoveFavoriteModalVisible(false)}>
                <Text style={styles.modalButtonSafeText}>Nie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonDanger} onPress={handleRemoveFavoriteConfirm}>
                <Text style={styles.modalButtonDangerText}>Tak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteOptionsModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteOptionsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Co chcesz zrobić z tym zdjęciem?</Text>
            <TouchableOpacity style={styles.modalButtonDangerFull} onPress={() => { setDeleteOptionsModalVisible(false); setDeleteConfirmModalVisible(true); }}>
              <Text style={styles.modalButtonDangerText}>Usuń zdjęcie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonSafeFull} onPress={() => setDeleteOptionsModalVisible(false)}>
              <Text style={styles.modalButtonSafeFullText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteConfirmModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteConfirmModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Czy na pewno chcesz usunąć to zdjęcie?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonSafe} onPress={() => setDeleteConfirmModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: "#FFFAF6", paddingHorizontal: 20, paddingTop: 64 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 },
  emptyText: { color: "#A37D5D", fontSize: 16, fontFamily: "Inter", fontWeight: "400", lineHeight: 24, textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backButton: { marginRight: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#202C39", fontFamily: "Inter", lineHeight: 32 },
  row: { justifyContent: "space-between", marginBottom: 19 },
  imageContainer: { width: "47%", height: 230, borderRadius: 30, backgroundColor: "#FFFAF6", borderWidth: 2, borderColor: "#EDE1D7", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  heartButton: { position: "absolute", top: 12, right: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#EDE1D7", borderRadius: 30, padding: 24, width: 353, alignItems: "center", gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#202C39", fontFamily: "Inter", textAlign: "center", lineHeight: 24 },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalButtonSafe: { width: 152, height: 50, borderRadius: 30, backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonSafeText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  modalButtonDanger: { width: 152, height: 50, borderRadius: 30, borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  modalButtonDangerText: { color: "#E05744", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  modalButtonDangerFull: { width: 305, height: 48, borderRadius: 30, borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  modalButtonSafeFull: { width: 305, height: 48, borderRadius: 30, backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonSafeFullText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
});
