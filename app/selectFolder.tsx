import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { createFolder, deleteFolder, getFolders, renameFolder } from "../services/folders";
import { addImageToFolders } from "../services/images";
import { fs, s } from "../utils/scale";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0603 2.45383C16.3415 2.73512 16.4995 3.11658 16.4995 3.51433C16.4995 3.91207 16.3415 4.29354 16.0603 4.57483L8.63533 11.9998L16.0603 19.4248C16.3336 19.7077 16.4848 20.0866 16.4813 20.4799C16.4779 20.8732 16.3202 21.2494 16.0421 21.5276C15.7639 21.8057 15.3877 21.9634 14.9944 21.9668C14.6011 21.9703 14.2222 21.8191 13.9393 21.5458L5.45383 13.0603C5.17262 12.779 5.01465 12.3976 5.01465 11.9998C5.01465 11.6021 5.17262 11.2206 5.45383 10.9393L13.9393 2.45383C14.2206 2.17262 14.6021 2.01465 14.9998 2.01465C15.3976 2.01465 15.779 2.17262 16.0603 2.45383Z" fill="#202C39"/>
</svg>`;

const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <path d="M15 28.125C22.2487 28.125 28.125 22.2487 28.125 15C28.125 7.75126 22.2487 1.875 15 1.875C7.75126 1.875 1.875 7.75126 1.875 15C1.875 22.2487 7.75126 28.125 15 28.125Z" fill="#A37D5D"/>
  <path d="M7.8374 15H22.1624" stroke="white" stroke-width="2.06897" stroke-miterlimit="10" stroke-linecap="round"/>
  <path d="M15 7.8374V22.1624" stroke="white" stroke-width="2.06897" stroke-miterlimit="10" stroke-linecap="round"/>
</svg>`;

const checkCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#A37D5D"/>
  <path d="M10.9999 16.0002C10.8683 16.0009 10.7379 15.9757 10.616 15.926C10.4942 15.8762 10.3834 15.8029 10.2899 15.7102L7.28994 12.7102C7.1967 12.6169 7.12274 12.5063 7.07228 12.3844C7.02182 12.2626 6.99585 12.132 6.99585 12.0002C6.99585 11.7339 7.10164 11.4785 7.28994 11.2902C7.47825 11.1019 7.73364 10.9961 7.99994 10.9961C8.26624 10.9961 8.52164 11.1019 8.70994 11.2902L10.9999 13.5902L15.2899 9.29018C15.4782 9.10188 15.7336 8.99609 15.9999 8.99609C16.2662 8.99609 16.5216 9.10188 16.7099 9.29018C16.8982 9.47849 17.004 9.73388 17.004 10.0002C17.004 10.2665 16.8982 10.5219 16.7099 10.7102L11.7099 15.7102C11.6165 15.8029 11.5057 15.8762 11.3838 15.926C11.262 15.9757 11.1315 16.0009 10.9999 16.0002Z" fill="white"/>
</svg>`;

const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6.99505 7.00627C6.60452 7.3968 6.60452 8.02996 6.99505 8.42049L10.5802 12.0056L6.99505 15.5908C6.60452 15.9813 6.60452 16.6145 6.99505 17.005C7.38557 17.3955 8.01874 17.3955 8.40926 17.005L11.9944 13.4198L15.5796 17.005C15.9701 17.3955 16.6033 17.3955 16.9938 17.005C17.3843 16.6145 17.3843 15.9813 16.9938 15.5908L13.4086 12.0056L16.9938 8.4205C17.3843 8.02998 17.3843 7.39681 16.9938 7.00629C16.6032 6.61576 15.9701 6.61576 15.5796 7.00629L11.9944 10.5914L8.40926 7.00627C8.01874 6.61575 7.38557 6.61575 6.99505 7.00627Z" fill="#0F0F0F"/>
</svg>`;

export default function SelectFolderScreen() {
  const router = useRouter();
  const { imageId } = useLocalSearchParams<{ imageId: string }>();
  const safeImageId = Array.isArray(imageId) ? imageId[0] : imageId;
  const [folders, setFolders] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createFolderName, setCreateFolderName] = useState("");
  const [folderOptionsModalVisible, setFolderOptionsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFolder = async (folderId: string) => {
    setSelected([folderId]);
    // Krótka chwila z checkmarkiem, potem zapis i przejście
    setTimeout(async () => {
      try {
        if (!safeImageId) return;
        await addImageToFolders(safeImageId, [folderId]);
        router.replace("/wardrobe/wardrobe");
      } catch (e) {
        console.error(e);
        alert("Błąd zapisu");
        setSelected([]);
      }
    }, 600);
  };

  const handleLongPress = (folder: any) => {
    setSelectedFolder(folder);
    setFolderOptionsModalVisible(true);
  };



  const handleCreateConfirm = async () => {
    if (!createFolderName.trim()) return;
    try {
      await createFolder(createFolderName.trim());
      setCreateModalVisible(false);
      setCreateFolderName("");
      await loadFolders();
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się stworzyć folderu");
    }
  };

  const handleDelete = () => {
    setFolderOptionsModalVisible(false);
    setDeleteConfirmModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFolder) return;
    setDeleteConfirmModalVisible(false);
    try {
      await deleteFolder(selectedFolder.id);
      await loadFolders();
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się usunąć folderu");
    }
  };

  const handleRenameConfirm = async () => {
    if (!newFolderName.trim() || !selectedFolder) return;
    try {
      await renameFolder(selectedFolder.id, newFolderName.trim());
      setRenameModalVisible(false);
      setSelectedFolder(null);
      await loadFolders();
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się zmienić nazwy folderu");
    }
  };

  // Grupowanie po 2 w wierszu
  const pairs: any[][] = [];
  for (let i = 0; i < folders.length; i += 2) {
    pairs.push(folders.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <SvgXml xml={backIcon} width={s(24)} height={s(24)} />
        </TouchableOpacity>
        <Text style={styles.title}>Dodaj zdjęcie do folderu</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Przycisk stwórz folder */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <SvgXml xml={plusIcon} width={s(30)} height={s(30)} />
          <Text style={styles.createButtonText}>Stwórz folder</Text>
        </TouchableOpacity>

        {/* Siatka folderów */}
        <View style={styles.grid}>
          {pairs.map((pair, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {pair.map((folder) => {
                const isSelected = selected.includes(folder.id);
                return (
                  <TouchableOpacity
                    key={folder.id}
                    style={[styles.folderCard, isSelected && styles.folderCardSelected]}
                    onPress={() => toggleFolder(folder.id)}
                    onLongPress={() => handleLongPress(folder)}
                    delayLongPress={500}
                  >
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <SvgXml xml={checkCircleIcon} width={s(24)} height={s(24)} />
                      </View>
                    )}
                    <Text style={styles.folderName}>{folder.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {pair.length === 1 && <View style={styles.folderCardEmpty} />}
            </View>
          ))}
        </View>


      </ScrollView>

      {/* Modal opcji folderu */}
      <Modal
        visible={folderOptionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFolderOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedFolder?.name}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setFolderOptionsModalVisible(false)}
              >
                <SvgXml xml={closeIcon} width={24} height={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Co chcesz zrobić z tym folderem?</Text>
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={() => {
                setFolderOptionsModalVisible(false);
                setNewFolderName(selectedFolder?.name ?? "");
                setRenameModalVisible(true);
              }}
            >
              <Text style={styles.modalButtonPrimaryText}>Zmień nazwę</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonDanger}
              onPress={handleDelete}
            >
              <Text style={styles.modalButtonDangerText}>Usuń folder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal potwierdzenia usunięcia */}
      <Modal
        visible={deleteConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalBox}>
            <Text style={styles.deleteModalTitle}>
              Czy na pewno chcesz usunąć folder "{selectedFolder?.name}"?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalButtonSafe}
                onPress={() => setDeleteConfirmModalVisible(false)}
              >
                <Text style={styles.deleteModalButtonSafeText}>Zostaw</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalButtonDanger}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.deleteModalButtonDangerText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal tworzenia folderu */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Stwórz folder</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => { setCreateModalVisible(false); setCreateFolderName(""); }}
                >
                  <SvgXml xml={closeIcon} width={24} height={24} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                value={createFolderName}
                onChangeText={setCreateFolderName}
                placeholder="Wpisz..."
                placeholderTextColor="#9D9D9D"
                autoFocus
              />
              <TouchableOpacity
                style={[styles.modalButton, createFolderName.trim() ? styles.modalButtonActive : styles.modalButtonInactive]}
                onPress={handleCreateConfirm}
                disabled={!createFolderName.trim()}
              >
                <Text style={styles.modalButtonText}>Stwórz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal zmiany nazwy */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Zmień nazwę</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setRenameModalVisible(false)}
                >
                  <SvgXml xml={closeIcon} width={24} height={24} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder="Wpisz..."
                placeholderTextColor="#9D9D9D"
                autoFocus
              />
              <TouchableOpacity
                style={[styles.modalButton, newFolderName.trim() ? styles.modalButtonActive : styles.modalButtonInactive]}
                onPress={handleRenameConfirm}
                disabled={!newFolderName.trim()}
              >
                <Text style={styles.modalButtonText}>Zapisz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAF6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: s(60),
    paddingHorizontal: s(20),
    gap: s(8),
  },
  backButton: { width: s(24), height: s(24), justifyContent: "center", alignItems: "center" },
  title: { fontSize: fs(24), fontWeight: "700", color: "#202C39", fontFamily: "Inter", lineHeight: fs(32) },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: s(20), paddingTop: s(48), paddingBottom: s(40) },
  createButton: {
    flexDirection: "row",
    height: s(50),
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#A37D5D",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: s(8),
    marginBottom: s(16),
  },
  createButtonText: { color: "#A37D5D", fontSize: fs(16), fontWeight: "700", fontFamily: "Inter", lineHeight: fs(24) },
  grid: { gap: s(19) },
  row: { flexDirection: "row", gap: s(19) },
  folderCard: {
    width: s(167), height: s(167), borderRadius: s(30),
    backgroundColor: "rgba(163, 125, 93, 0.20)",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  folderCardSelected: { backgroundColor: "rgba(163, 125, 93, 0.50)" },
  checkIcon: { position: "absolute", top: s(16), right: s(16) },
  folderCardEmpty: { width: s(167), height: s(167) },
  folderName: { color: "#A37D5D", fontSize: fs(16), fontWeight: "700", fontFamily: "Inter", lineHeight: fs(24), textAlign: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#EDE1D7", borderRadius: s(30), padding: s(24), width: s(353), alignItems: "center", gap: s(12) },
  modalHeader: { flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", position: "relative" },
  modalCloseButton: { position: "absolute", right: 0 },
  modalTitle: { fontSize: fs(16), fontWeight: "700", color: "#202C39", fontFamily: "Inter", flex: 1, textAlign: "center" },
  modalSubtitle: { fontSize: fs(16), fontWeight: "400", color: "#202C39", fontFamily: "Inter", textAlign: "center" },
  modalButtonPrimary: { width: s(305), height: s(48), borderRadius: s(30), backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonPrimaryText: { color: "#FFFAF6", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  modalButtonDanger: { width: s(305), height: s(48), borderRadius: s(30), borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  modalButtonDangerText: { color: "#E05744", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  modalInput: { width: s(305), backgroundColor: "#FFFAF6", borderRadius: s(30), padding: s(12), paddingHorizontal: s(20), fontSize: fs(16), fontFamily: "Inter", color: "#202C39" },
  modalButton: { width: s(305), height: s(48), borderRadius: s(30), justifyContent: "center", alignItems: "center" },
  modalButtonActive: { backgroundColor: "#A37D5D" },
  modalButtonInactive: { backgroundColor: "#9D9D9D" },
  modalButtonText: { color: "#FFFAF6", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  deleteModalBox: { backgroundColor: "#EDE1D7", borderRadius: s(30), padding: s(24), width: s(353), alignItems: "center", gap: s(16) },
  deleteModalTitle: { fontSize: fs(16), fontWeight: "700", color: "#202C39", fontFamily: "Inter", textAlign: "center", lineHeight: fs(24) },
  deleteModalButtons: { flexDirection: "row", gap: s(12) },
  deleteModalButtonSafe: { width: s(152), height: s(50), borderRadius: s(30), backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  deleteModalButtonSafeText: { color: "#FFFFFF", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
  deleteModalButtonDanger: { width: s(152), height: s(50), borderRadius: s(30), borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  deleteModalButtonDangerText: { color: "#E05744", fontSize: fs(16), fontFamily: "Inter", fontWeight: "400" },
});
