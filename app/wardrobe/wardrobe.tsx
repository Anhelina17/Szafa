import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SvgXml } from "react-native-svg";
import TabBar from "../../components/TabBar";
import { createFolder, deleteFolder, getFolders, renameFolder } from "../../services/folders";

const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <path d="M15 28.125C22.2487 28.125 28.125 22.2487 28.125 15C28.125 7.75126 22.2487 1.875 15 1.875C7.75126 1.875 1.875 7.75126 1.875 15C1.875 22.2487 7.75126 28.125 15 28.125Z" fill="#A37D5D"/>
  <path d="M7.8374 15H22.1624" stroke="white" stroke-width="2.06897" stroke-miterlimit="10" stroke-linecap="round"/>
  <path d="M15 7.8374V22.1624" stroke="white" stroke-width="2.06897" stroke-miterlimit="10" stroke-linecap="round"/>
</svg>`;

const favoritesIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M20 10.0004C17.001 6.50536 11.9896 5.42525 8.23205 8.62565C4.47447 11.826 3.94545 17.1769 6.8963 20.9621C9.34973 24.1091 16.7747 30.7466 19.2082 32.8949C19.4803 33.1352 19.6165 33.2554 19.7753 33.3026C19.9138 33.3437 20.0655 33.3437 20.2042 33.3026C20.363 33.2554 20.499 33.1352 20.7713 32.8949C23.2048 30.7466 30.6297 24.1091 33.0832 20.9621C36.034 17.1769 35.5695 11.7924 31.7473 8.62565C27.9252 5.45892 22.999 6.50536 20 10.0004Z" stroke="#A37D5D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6.99505 7.00627C6.60452 7.3968 6.60452 8.02996 6.99505 8.42049L10.5802 12.0056L6.99505 15.5908C6.60452 15.9813 6.60452 16.6145 6.99505 17.005C7.38557 17.3955 8.01874 17.3955 8.40926 17.005L11.9944 13.4198L15.5796 17.005C15.9701 17.3955 16.6033 17.3955 16.9938 17.005C17.3843 16.6145 17.3843 15.9813 16.9938 15.5908L13.4086 12.0056L16.9938 8.4205C17.3843 8.02998 17.3843 7.39681 16.9938 7.00629C16.6032 6.61576 15.9701 6.61576 15.5796 7.00629L11.9944 10.5914L8.40926 7.00627C8.01874 6.61575 7.38557 6.61575 6.99505 7.00627Z" fill="#0F0F0F"/>
</svg>`;

export default function WardrobeScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [folderOptionsModalVisible, setFolderOptionsModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderName, setCreateFolderName] = useState("");

  useEffect(() => { loadFolders(); }, []);

  const loadFolders = async () => {
    try {
      const data = await getFolders();
      setFolders(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
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

  const handleLongPress = (folder: any) => {
    setSelectedFolder(folder);
    setFolderOptionsModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedFolder) return;
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
    if (newFolderName.trim() === selectedFolder.name) return;
    try {
      await renameFolder(selectedFolder.id, newFolderName.trim());
      setRenameModalVisible(false);
      setSelectedFolder(null);
      await loadFolders();
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się zmienić nazwy folderu");
    }
  };

  // Czy nazwa zmieniona
  const renameChanged = newFolderName.trim() !== "" && newFolderName.trim() !== selectedFolder?.name;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A37D5D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubrania</Text>

      <TouchableOpacity style={styles.createButton} onPress={() => setCreateModalVisible(true)}>
        <SvgXml xml={plusIcon} width={30} height={30} />
        <Text style={styles.createButtonText}>Stwórz folder</Text>
      </TouchableOpacity>

      <FlatList
        data={[{ id: 'ulubione', name: 'Ulubione', isSpecial: true }, ...folders]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }: { item: any }) => {
          if (item.isSpecial) {
            return (
              <TouchableOpacity style={styles.folder} onPress={() => router.push("/wardrobe/favorites/favorites")}>
                <SvgXml xml={favoritesIcon} width={40} height={40} />
                <Text style={styles.folderText}>Ulubione</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              style={styles.folder}
              onPress={() => router.push({ pathname: "/wardrobe/folderView", params: { folderId: item.id, folderName: item.name } })}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <Text style={styles.folderText}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal opcji folderu */}
      <Modal visible={folderOptionsModalVisible} transparent animationType="fade" onRequestClose={() => setFolderOptionsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedFolder?.name}</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setFolderOptionsModalVisible(false)}>
                <SvgXml xml={closeIcon} width={24} height={24} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Co chcesz zrobić z tym folderem?</Text>
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={() => {
              setFolderOptionsModalVisible(false);
              setNewFolderName(selectedFolder?.name ?? "");
              setRenameModalVisible(true);
            }}>
              <Text style={styles.modalButtonPrimaryText}>Zmień nazwę</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonDanger} onPress={handleDelete}>
              <Text style={styles.modalButtonDangerText}>Usuń folder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal potwierdzenia usunięcia */}
      <Modal visible={deleteConfirmModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteConfirmModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalBox}>
            <Text style={styles.deleteModalTitle}>Czy na pewno chcesz usunąć folder "{selectedFolder?.name}"?</Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity style={styles.deleteModalButtonSafe} onPress={() => setDeleteConfirmModalVisible(false)}>
                <Text style={styles.deleteModalButtonSafeText}>Zostaw</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteModalButtonDanger} onPress={handleDeleteConfirm}>
                <Text style={styles.deleteModalButtonDangerText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal tworzenia folderu */}
      <Modal visible={createModalVisible} transparent animationType="fade" onRequestClose={() => setCreateModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Stwórz folder</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => { setCreateModalVisible(false); setCreateFolderName(""); }}>
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
      <Modal visible={renameModalVisible} transparent animationType="fade" onRequestClose={() => setRenameModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Zmień nazwę</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setRenameModalVisible(false)}>
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
              {/* Aktywna tylko gdy nazwa zmieniona */}
              <TouchableOpacity
                style={[styles.modalButton, renameChanged ? styles.modalButtonActive : styles.modalButtonInactive]}
                onPress={handleRenameConfirm}
                disabled={!renameChanged}
              >
                <Text style={styles.modalButtonText}>Zapisz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFAF6", paddingTop: 56, paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#202C39", fontFamily: "Inter", lineHeight: 26, textAlign: "center", marginBottom: 16 },
  createButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 2, borderColor: "#A37D5D", borderStyle: "dashed", borderRadius: 30, height: 50, marginBottom: 16 },
  createButtonText: { color: "#A37D5D", fontSize: 16, fontWeight: "700", fontFamily: "Inter" },
  row: { justifyContent: "space-between", marginBottom: 19 },
  folder: { width: "47%", aspectRatio: 1, borderRadius: 30, backgroundColor: "rgba(163, 125, 93, 0.2)", alignItems: "center", justifyContent: "center" },
  folderText: { fontSize: 16, fontWeight: "700", color: "#A37D5D", fontFamily: "Inter", marginTop: 6, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#EDE1D7", borderRadius: 30, padding: 24, width: 353, alignItems: "center", gap: 12 },
  modalHeader: { flexDirection: "row", justifyContent: "center", alignItems: "center", width: "100%", position: "relative" },
  modalCloseButton: { position: "absolute", right: 0 },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#202C39", fontFamily: "Inter", flex: 1, textAlign: "center" },
  modalSubtitle: { fontSize: 16, fontWeight: "400", color: "#202C39", fontFamily: "Inter", textAlign: "center" },
  modalButtonPrimary: { width: 305, height: 48, borderRadius: 30, backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  modalButtonPrimaryText: { color: "#FFFAF6", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  modalButtonDanger: { width: 305, height: 48, borderRadius: 30, borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  modalButtonDangerText: { color: "#E05744", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  modalInput: { width: 305, backgroundColor: "#FFFAF6", borderRadius: 30, padding: 12, paddingHorizontal: 20, fontSize: 16, fontFamily: "Inter", color: "#202C39" },
  modalButton: { width: 305, height: 48, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  modalButtonActive: { backgroundColor: "#A37D5D" },
  modalButtonInactive: { backgroundColor: "#9D9D9D" },
  modalButtonText: { color: "#FFFAF6", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  deleteModalBox: { backgroundColor: "#EDE1D7", borderRadius: 30, padding: 24, width: 353, alignItems: "center", gap: 16 },
  deleteModalTitle: { fontSize: 16, fontWeight: "700", color: "#202C39", fontFamily: "Inter", textAlign: "center", lineHeight: 24 },
  deleteModalButtons: { flexDirection: "row", gap: 12 },
  deleteModalButtonSafe: { width: 152, height: 50, borderRadius: 30, backgroundColor: "#A37D5D", justifyContent: "center", alignItems: "center" },
  deleteModalButtonSafeText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
  deleteModalButtonDanger: { width: 152, height: 50, borderRadius: 30, borderWidth: 2, borderColor: "#E05744", justifyContent: "center", alignItems: "center" },
  deleteModalButtonDangerText: { color: "#E05744", fontSize: 16, fontFamily: "Inter", fontWeight: "400" },
});
