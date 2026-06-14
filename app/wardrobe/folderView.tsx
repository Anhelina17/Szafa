import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { supabase } from "../../supabaseClient";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0603 2.45407C16.3415 2.73536 16.4995 3.11683 16.4995 3.51457C16.4995 3.91232 16.3415 4.29378 16.0603 4.57507L8.63533 12.0001L16.0603 19.4251C16.3336 19.708 16.4848 20.0869 16.4813 20.4802C16.4779 20.8735 16.3202 21.2497 16.0421 21.5278C15.7639 21.8059 15.3877 21.9637 14.9944 21.9671C14.6011 21.9705 14.2222 21.8193 13.9393 21.5461L5.45383 13.0606C5.17262 12.7793 5.01465 12.3978 5.01465 12.0001C5.01465 11.6023 5.17262 11.2209 5.45383 10.9396L13.9393 2.45407C14.2206 2.17287 14.6021 2.01489 14.9998 2.01489C15.3976 2.01489 15.779 2.17287 16.0603 2.45407Z" fill="#202C39"/>
</svg>`;

const heartFilledIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" fill="#A37D5D" stroke="#A37D5D" stroke-width="2.06897" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const heartOutlineIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" stroke="#A37D5D" stroke-width="2.06897" stroke-linecap="round" stroke-linejoin="round"/>
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

  // Undo toast state
  const [undoToastVisible, setUndoToastVisible] = useState(false);
  const [undoToastText, setUndoToastText] = useState("");
  const [undoData, setUndoData] = useState<{ imageId: string; targetFolderId: string } | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (folderId) loadImages();
  }, [folderId]);

  useFocusEffect(
    useCallback(() => {
      if (folderId) loadImages();
    }, [folderId])
  );

  // Sprawdź parametry po powrocie z selectFolder
  const { movedImageId, movedToFolderId, movedToFolderName, addedToFolderNames } = useLocalSearchParams<{
    movedImageId?: string;
    movedToFolderId?: string;
    movedToFolderName?: string;
    addedToFolderNames?: string;
  }>();

  const infoBlurOpacity = useRef(new Animated.Value(0)).current;
  const [infoBlurVisible, setInfoBlurVisible] = useState(false);
  const [infoBlurMessage, setInfoBlurMessage] = useState("");

  useEffect(() => {
    if (movedImageId && movedToFolderId && movedToFolderName) {
      showUndoToast(movedImageId, movedToFolderId, movedToFolderName);
    }
  }, [movedImageId, movedToFolderId, movedToFolderName]);

  useEffect(() => {
    if (addedToFolderNames) {
      setInfoBlurMessage(`Dodano do: ${addedToFolderNames}`);
      setInfoBlurVisible(true);
      infoBlurOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(infoBlurOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(infoBlurOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start(() => setInfoBlurVisible(false));
    }
  }, [addedToFolderNames]);

  const showUndoToast = (imageId: string, targetFolderId: string, targetFolderName: string) => {
    // Anuluj poprzedni timer jeśli istnieje
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    setUndoData({ imageId, targetFolderId });
    setUndoToastText(`Przeniesiono do „${targetFolderName}"`);
    setUndoToastVisible(true);
    progressAnim.setValue(1);

    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 4000,
      useNativeDriver: false,
    }).start();

    undoTimerRef.current = setTimeout(() => {
      hideUndoToast();
    }, 4000);
  };

  const hideUndoToast = () => {
    Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setUndoToastVisible(false);
      setUndoData(null);
    });
  };

  const handleUndo = async () => {
    if (!undoData) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    hideUndoToast();
    try {
      // Cofnij: usuń z folderu docelowego, wróć do obecnego
      await supabase
        .from("image_folders")
        .delete()
        .eq("image_id", undoData.imageId)
        .eq("folder_id", undoData.targetFolderId);
      await supabase
        .from("image_folders")
        .insert({ image_id: undoData.imageId, folder_id: folderId });
      await loadImages();
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się cofnąć akcji");
    }
  };

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
      console.log("Usuwam zdjęcie:", selectedItem.id);
      await deleteImage(selectedItem.id, selectedItem.image_url);
      console.log("Zdjęcie usunięte pomyślnie");
      await loadImages();
    } catch (e) {
      console.log("BŁĄD USUWANIA:", e);
      Alert.alert("Błąd", "Nie udało się usunąć zdjęcia");
    }
  };

  const handleOpenMoveFolder = () => {
    setDeleteOptionsModalVisible(false);
    if (!selectedItem) return;
    router.push({
      pathname: "/selectFolder",
      params: {
        imageId: selectedItem.id,
        moveMode: "true",
        sourceFolderId: folderId,
        sourceFolderName: folderName,
      },
    });
  };

  const handleOpenAddFolder = () => {
    setDeleteOptionsModalVisible(false);
    if (!selectedItem) return;
    router.push({
      pathname: "/selectFolder",
      params: {
        imageId: selectedItem.id,
        moveMode: "false",
        sourceFolderId: folderId,
        sourceFolderName: folderName,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
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
        <View style={styles.emptyContainer}>
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

      {/* Undo toast */}
      {undoToastVisible && (
        <Animated.View style={[styles.undoToast, { opacity: toastOpacity }]}>
          <View style={styles.undoToastContent}>
            <Text style={styles.undoToastText}>{undoToastText}</Text>
            <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
              <Text style={styles.undoButtonText}>Cofnij</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </Animated.View>
      )}

      {/* Blur overlay — dodano do folderów */}
      {infoBlurVisible && (
        <Animated.View style={[styles.blurOverlay, { opacity: infoBlurOpacity }]}>
          <Text style={styles.blurText}>{infoBlurMessage}</Text>
        </Animated.View>
      )}

      {/* Modalne: opcje dla zdjęcia */}
      <Modal visible={deleteOptionsModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteOptionsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Co chcesz zrobić z tym zdjęciem?</Text>
            <TouchableOpacity style={styles.modalButtonMoveFull} onPress={handleOpenMoveFolder}>
              <Text style={styles.modalButtonMoveText}>Przenieś do innego folderu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonMoveFull} onPress={handleOpenAddFolder}>
              <Text style={styles.modalButtonMoveText}>Dodaj do innych folderów</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonDangerFull} onPress={() => { setDeleteOptionsModalVisible(false); setDeleteConfirmModalVisible(true); }}>
              <Text style={styles.modalButtonDangerText}>Usuń zdjęcie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonCancelFull} onPress={() => setDeleteOptionsModalVisible(false)}>
              <Text style={styles.modalButtonCancelText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modalne: potwierdzenie usunięcia */}
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFAF6" },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingTop: 64, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#202C39", fontFamily: "Inter", lineHeight: 32 },
  offlineBanner: { backgroundColor: "#FFF3E0", borderRadius: 10, padding: 10, marginHorizontal: 20, marginBottom: 12, alignItems: "center", borderWidth: 1, borderColor: "#A37D5D" },
  offlineText: { color: "#A37D5D", fontSize: 13, fontFamily: "Inter", fontWeight: "500" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 },
  emptyText: { color: "#A37D5D", fontSize: 16, fontFamily: "Inter", fontWeight: "400", textAlign: "center" },
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
  modalButtonMoveFull: { width: 305, height: 48, borderRadius: 30, backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonMoveText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  modalButtonCancelFull: { width: 305, height: 48, borderRadius: 30, borderWidth: 2, borderColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonCancelText: { color: "#A37D5D", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  undoToast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#EDE1D7",
    borderRadius: 50,
    overflow: "hidden",
    zIndex: 100,
  },
  undoToastContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
  },
  undoToastText: { color: "#202C39", fontSize: 14, fontFamily: "Inter", fontWeight: "400", flex: 1 },
  undoButton: {
    backgroundColor: "#A37D5D",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  undoButtonText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter", fontWeight: "600" },
  blurOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  blurText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EDE1D7",
    fontFamily: "Inter",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  progressBarBg: { height: 3, backgroundColor: "rgba(163,125,93,0.2)", overflow: "hidden" },
  progressBarFill: { height: 3, backgroundColor: "#A37D5D" },
});
