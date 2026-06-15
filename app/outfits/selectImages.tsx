import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SvgXml } from "react-native-svg";
import { getFolders } from "../../services/folders";
import { getFavoriteImages, getImagesByFolder } from "../../services/images";
import { fs, s } from "../../utils/scale";

type ImageItem = {
  id: string;
  image_url: string;
  is_favorite: boolean;
};

type Folder = {
  id: string;
  name: string;
};

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0603 2.45407C16.3415 2.73536 16.4995 3.11683 16.4995 3.51457C16.4995 3.91232 16.3415 4.29378 16.0603 4.57507L8.63533 12.0001L16.0603 19.4251C16.3336 19.708 16.4848 20.0869 16.4813 20.4802C16.4779 20.8735 16.3202 21.2497 16.0421 21.5278C15.7639 21.8059 15.3877 21.9637 14.9944 21.9671C14.6011 21.9705 14.2222 21.8193 13.9393 21.5461L5.45383 13.0606C5.17262 12.7793 5.01465 12.3978 5.01465 12.0001C5.01465 11.6023 5.17262 11.2209 5.45383 10.9396L13.9393 2.45407C14.2206 2.17287 14.6021 2.01489 14.9998 2.01489C15.3976 2.01489 15.779 2.17287 16.0603 2.45407Z" fill="#202C39"/>
</svg>`;

const circleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="#A37D5D" stroke-width="2"/>
</svg>`;

const circleCheckedIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="9" fill="#A37D5D"/>
  <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6.99486 7.00627C6.60433 7.3968 6.60433 8.02996 6.99486 8.42049L10.58 12.0056L6.99486 15.5908C6.60433 15.9813 6.60433 16.6145 6.99486 17.005C7.38538 17.3955 8.01855 17.3955 8.40907 17.005L11.9942 13.4198L15.5794 17.005C15.9699 17.3955 16.6031 17.3955 16.9936 17.005C17.3841 16.6145 17.3841 15.9813 16.9936 15.5908L13.4084 12.0056L16.9936 8.4205C17.3841 8.02998 17.3841 7.39681 16.9936 7.00629C16.603 6.61576 15.9699 6.61576 15.5794 7.00629L11.9942 10.5914L8.40907 7.00627C8.01855 6.61575 7.38538 6.61575 6.99486 7.00627Z" fill="#202C39"/>
</svg>`;

const favoritesIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M20 10.0004C17.001 6.50536 11.9896 5.42525 8.23205 8.62565C4.47447 11.826 3.94545 17.1769 6.8963 20.9621C9.34973 24.1091 16.7747 30.7466 19.2082 32.8949C19.4803 33.1352 19.6165 33.2554 19.7753 33.3026C19.9138 33.3437 20.0655 33.3437 20.2042 33.3026C20.363 33.2554 20.499 33.1352 20.7713 32.8949C23.2048 30.7466 30.6297 24.1091 33.0832 20.9621C36.034 17.1769 35.5695 11.7924 31.7473 8.62565C27.9252 5.45892 22.999 6.50536 20 10.0004Z" stroke="#A37D5D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function SelectImagesScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFolderName, setActiveFolderName] = useState<string>("");
  const [folderImages, setFolderImages] = useState<ImageItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => { loadFolders(); }, []);

  const loadFolders = async () => {
    try {
      setIsLoadingFolders(true);
      const data = await getFolders();
      setFolders(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const openFolder = async (folder: { id: string; name: string }) => {
    try {
      setActiveFolderId(folder.id);
      setActiveFolderName(folder.name);
      setIsLoadingImages(true);
      if (folder.id === 'favorites') {
        const data = await getFavoriteImages();
        setFolderImages(data);
      } else {
        const data = await getImagesByFolder(folder.id);
        setFolderImages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const goBackToFolders = () => {
    setActiveFolderId(null);
    setActiveFolderName("");
    setFolderImages([]);
  };

  const toggleImage = useCallback((image: ImageItem) => {
    setSelectedImages((prev) => {
      const isAlreadySelected = prev.some((img) => img.id === image.id);
      const newSelected = isAlreadySelected ? prev.filter((img) => img.id !== image.id) : [...prev, image];
      setShowBar(newSelected.length > 0);
      return newSelected;
    });
  }, []);

  const isSelected = useCallback(
    (imageId: string) => selectedImages.some((img) => img.id === imageId),
    [selectedImages]
  );

  const handleNext = () => {
    if (selectedImages.length === 0) return;
    router.push({ pathname: "/outfits/outfitPreview", params: { selectedImages: JSON.stringify(selectedImages) } });
  };

  const handleBackPress = () => {
    if (selectedImages.length > 0) { setCancelModalVisible(true); } else { router.back(); }
  };

  const handleCancel = () => {
    if (selectedImages.length > 0) { setCancelModalVisible(true); } else { setShowBar(false); setSelectedImages([]); }
  };

  const handleCancelConfirm = () => {
    setCancelModalVisible(false);
    setShowBar(false);
    setSelectedImages([]);
    setActiveFolderId(null);
    setActiveFolderName("");
    setFolderImages([]);
    router.back();
  };

  const handleRemove = (id: string) => {
    setSelectedImages((prev) => {
      const newSelected = prev.filter((img) => img.id !== id);
      setShowBar(newSelected.length > 0);
      return newSelected;
    });
  };

  if (!activeFolderId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <SvgXml xml={backIcon} width={s(24)} height={s(24)} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stwórz stylizację</Text>
        </View>

        {isLoadingFolders ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#A37D5D" /></View>
        ) : (
          <FlatList
            data={[{ id: 'ulubione', name: 'Ulubione', isSpecial: true }, ...folders] as any[]}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.listContent, showBar && { paddingBottom: s(180) }]}
            renderItem={({ item }: { item: any }) => {
              if (item.isSpecial) {
                return (
                  <TouchableOpacity style={styles.folder} onPress={() => openFolder({ id: 'favorites', name: 'Ulubione' })}>
                    <SvgXml xml={favoritesIcon} width={s(40)} height={s(40)} />
                    <Text style={styles.folderText}>Ulubione</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity style={styles.folder} onPress={() => openFolder(item)}>
                  <Text style={styles.folderText}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>Brak folderów</Text></View>}
          />
        )}

        {showBar && (
          <SelectedBar selectedImages={selectedImages} onRemove={handleRemove} onNext={handleNext} onCancel={handleCancel} count={selectedImages.length} />
        )}

        <Modal visible={cancelModalVisible} transparent animationType="fade" onRequestClose={() => setCancelModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Czy na pewno chcesz przerwać tworzenie stylizacji?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonSafe} onPress={() => setCancelModalVisible(false)}>
                  <Text style={styles.modalButtonSafeText}>Zostaw</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonDanger} onPress={handleCancelConfirm}>
                  <Text style={styles.modalButtonDangerText}>Przerwij</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToFolders}>
          <SvgXml xml={backIcon} width={s(24)} height={s(24)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeFolderName}</Text>
      </View>

      {isLoadingImages ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#A37D5D" /></View>
      ) : (
        <FlatList
          data={folderImages}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.listContent, showBar && { paddingBottom: s(180) }, folderImages.length === 0 && { flex: 1, paddingBottom: s(80) }]}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.imageContainer} onPress={() => toggleImage(item)}>
              <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
              <View style={styles.checkbox}>
                <SvgXml xml={isSelected(item.id) ? circleCheckedIcon : circleIcon} width={s(24)} height={s(24)} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Tutaj jeszcze nic nie ma</Text></View>}
        />
      )}

      {showBar && (
        <SelectedBar selectedImages={selectedImages} onRemove={handleRemove} onNext={handleNext} onCancel={handleCancel} count={selectedImages.length} />
      )}

      <Modal visible={cancelModalVisible} transparent animationType="fade" onRequestClose={() => setCancelModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Czy na pewno chcesz przerwać tworzenie stylizacji?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonSafe} onPress={() => setCancelModalVisible(false)}>
                <Text style={styles.modalButtonSafeText}>Zostaw</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonDanger} onPress={handleCancelConfirm}>
                <Text style={styles.modalButtonDangerText}>Przerwij</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SelectedBar({ selectedImages, onRemove, onNext, onCancel, count }: {
  selectedImages: ImageItem[];
  onRemove: (id: string) => void;
  onNext: () => void;
  onCancel: () => void;
  count: number;
}) {
  return (
    <View style={styles.selectedBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedScroll}>
        {selectedImages.map((img) => (
          <View key={img.id} style={styles.selectedThumb}>
            <Image source={{ uri: img.image_url }} style={styles.selectedThumbImage} resizeMode="contain" />
            <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(img.id)}>
              <SvgXml xml={closeIcon} width={s(16)} height={s(16)} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.selectedBarButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Anuluj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Dalej ({count})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAF6" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: s(20), paddingTop: s(64), paddingBottom: s(16), gap: s(8) },
  headerTitle: { fontSize: fs(24), fontWeight: "700", color: "#202C39", fontFamily: "Inter", lineHeight: fs(32) },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: s(80) },
  listContent: { paddingHorizontal: s(20), paddingTop: s(8) },
  row: { justifyContent: "space-between", marginBottom: s(19) },
  folder: { width: "47%", aspectRatio: 1, borderRadius: s(30), backgroundColor: "rgba(163, 125, 93, 0.2)", alignItems: "center", justifyContent: "center" },
  folderText: { fontSize: fs(16), fontWeight: "700", color: "#A37D5D", fontFamily: "Inter", textAlign: "center" },
  imageContainer: { width: "47%", height: s(230), borderRadius: s(30), backgroundColor: "#FFFAF6", borderWidth: 2, borderColor: "#EDE1D7", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  checkbox: { position: "absolute", top: s(12), right: s(12) },
  emptyText: { color: "#A37D5D", fontSize: fs(16), fontFamily: "Inter" },
  selectedBar: { position: "absolute", bottom: s(14), left: s(12), right: s(12), backgroundColor: "#202C39", paddingTop: s(12), paddingBottom: s(20), paddingHorizontal: s(12), borderRadius: s(30), gap: s(8) },
  selectedScroll: { flexDirection: "row", gap: s(8) },
  selectedThumb: { width: s(84), height: s(70), borderRadius: s(18), backgroundColor: "#EDE1D7", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  selectedThumbImage: { width: "100%", height: "100%" },
  removeButton: { position: "absolute", top: s(4), right: s(4) },
  selectedBarButtons: { flexDirection: "row", gap: s(8) },
  cancelButton: { flex: 1, height: s(50), borderRadius: s(30), borderWidth: 2, borderColor: "#EDE1D7", justifyContent: "center", alignItems: "center" },
  cancelButtonText: { color: "#EDE1D7", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  nextButton: { flex: 1, height: s(50), borderRadius: s(30), backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  nextButtonText: { color: "#FFFFFF", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#EDE1D7", borderRadius: s(30), padding: s(24), width: s(353), alignItems: "center", gap: s(16) },
  modalTitle: { fontSize: fs(16), fontWeight: "700", color: "#202C39", fontFamily: "Inter", textAlign: "center", lineHeight: fs(24) },
  modalButtons: { flexDirection: "row", gap: s(12) },
  modalButtonSafe: { width: s(152), height: s(50), borderRadius: s(30), backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonSafeText: { color: "#FFFFFF", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  modalButtonDanger: { width: s(152), height: s(50), borderRadius: s(30), borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  modalButtonDangerText: { color: "#E05744", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
});
