import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SvgXml } from "react-native-svg";
import TabBar from "../../components/TabBar";
import { FOLDER_IMAGES_CACHE_KEY, loadFromCache, saveToCache } from "../../services/cache";
import { deleteImage, getImagesByFolder, toggleFavorite } from "../../services/images";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0603 2.45407C16.3415 2.73536 16.4995 3.11683 16.4995 3.51457C16.4995 3.91232 16.3415 4.29378 16.0603 4.57507L8.63533 12.0001L16.0603 19.4251C16.3336 19.708 16.4848 20.0869 16.4813 20.4802C16.4779 20.8735 16.3202 21.2497 16.0421 21.5278C15.7639 21.8059 15.3877 21.9637 14.9944 21.9671C14.6011 21.9705 14.2222 21.8193 13.9393 21.5461L5.45383 13.0606C5.17262 12.7793 5.01465 12.3978 5.01465 12.0001C5.01465 11.6023 5.17262 11.2209 5.45383 10.9396L13.9393 2.45407C14.2206 2.17287 14.6021 2.01489 14.9998 2.01489C15.3976 2.01489 15.779 2.17287 16.0603 2.45407Z" fill="#202C39"/>
</svg>`;

const heartFilledIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" fill="#A37D5D" stroke="#A37D5D" stroke-width="2.06897" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const heartOutlineIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#A37D5D" stroke-width="2.06897" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6.99486 7.00627C6.60433 7.3968 6.60433 8.02996 6.99486 8.42049L10.58 12.0056L6.99486 15.5908C6.60433 15.9813 6.60433 16.6145 6.99486 17.005C7.38538 17.3955 8.01855 17.3955 8.40907 17.005L11.9942 13.4198L15.5794 17.005C15.9699 17.3955 16.6031 17.3955 16.9936 17.005C17.3841 16.6145 17.3841 15.9813 16.9936 15.5908L13.4084 12.0056L16.9936 8.4205C17.3841 8.02998 17.3841 7.39681 16.9936 7.00629C16.603 6.61576 15.9699 6.61576 15.5794 7.00629L11.9942 10.5914L8.40907 7.00627C8.01855 6.61575 7.38538 6.61575 6.99486 7.00627Z" fill="#0F0F0F"/>
</svg>`;

export default function FolderViewScreen() {
  const { folderId, folderName } = useLocalSearchParams<{
    folderId: string;
    folderName: string;
  }>();
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteOptionsModalVisible, setDeleteOptionsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);

  useEffect(() => {
    if (folderId) loadImages();
  }, [folderId]);

  const loadImages = async () => {
    try {
      const data = await getImagesByFolder(folderId);
      setImages(data);
      setIsOffline(false);
      await saveToCache(FOLDER_IMAGES_CACHE_KEY(folderId), data);
    } catch (e) {
      const cached = await loadFromCache<any[]>(FOLDER_IMAGES_CACHE_KEY(folderId));
      if (cached) {
        setImages(cached);
        setIsOffline(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (item: any) => {
    if (isOffline) return;
    try {
      await toggleFavorite(item.id, item.is_favorite ?? false);
      setImages((prev) =>
        prev.map((img) =>
          img.id === item.id ? { ...img, is_favorite: !img.is_favorite } : img
        )
      );
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się zmienić ulubionych");
    }
  };

  const handleLongPress = (item: any) => {
    if (isOffline) return;
    setSelectedItem(item);
    setDeleteOptionsModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setDeleteConfirmModalVisible(false);
    try {
      await deleteImage(selectedItem.id, selectedItem.image_url);
      await loadImages();
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się usunąć zdjęcia");
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
        <TouchableOpacity onPress={() => router.back()}>
          <SvgXml xml={backIcon} width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{folderName}</Text>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Brak połączenia — dane z ostatniej sesji</Text>
        </View>
      )}

      {images.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Tutaj jeszcze nic nie ma</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
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
                <SvgXml
                  xml={item.is_favorite ? heartFilledIcon : heartOutlineIcon}
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

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
  container: { flex: 1, backgroundColor: "#FFFAF6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingTop: 64, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#202C39", fontFamily: "Inter", lineHeight: 32 },
  offlineBanner: { backgroundColor: "#FFF3E0", borderRadius: 10, padding: 10, marginHorizontal: 20, marginBottom: 12, alignItems: "center", borderWidth: 1, borderColor: "#A37D5D" },
  offlineText: { color: "#A37D5D", fontSize: 13, fontFamily: "Inter", fontWeight: "500" },
  row: { justifyContent: "space-between", marginBottom: 19 },
  imageContainer: { width: "47%", height: 230, borderRadius: 30, backgroundColor: "#FFFAF6", borderWidth: 2, borderColor: "#EDE1D7", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  heartButton: { position: "absolute", top: 12, right: 12 },
  emptyText: { color: "#A37D5D", fontSize: 16, fontFamily: "Inter", fontWeight: "400", textAlign: "center" },
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