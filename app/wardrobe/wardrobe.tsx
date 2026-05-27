import { Ionicons } from "@expo/vector-icons";
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
  useWindowDimensions,
  View
} from "react-native";
import FavoritesIcon from "../../assets/icons/icon_favorites.svg";
import { createFolder, deleteFolder, getFolders, renameFolder } from "../../services/folders";

export default function WardrobeScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { height } = useWindowDimensions();

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderName, setCreateFolderName] = useState("");

  useEffect(() => {
    loadFolders();
  }, []);

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
    Alert.alert(
      folder.name,
      "Co chcesz zrobić z tym folderem?",
      [
        {
          text: "Zmień nazwę",
          onPress: () => {
            setSelectedFolder(folder);
            setNewFolderName(folder.name);
            setRenameModalVisible(true);
          },
        },
        {
          text: "Usuń folder",
          style: "destructive",
          onPress: () => handleDelete(folder),
        },
        {
          text: "Anuluj",
          style: "cancel",
        },
      ]
    );
  };

  const handleDelete = (folder: any) => {
    Alert.alert(
      "Usuń folder",
      `Czy na pewno chcesz usunąć folder "${folder.name}"? Zdjęcia nie zostaną usunięte.`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFolder(folder.id);
              await loadFolders();
            } catch (e) {
              Alert.alert("Błąd", "Nie udało się usunąć folderu");
            }
          },
        },
      ]
    );
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A37D5D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Przycisk tworzenia nowego folderu */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setCreateModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={22} color="#A37D5D" />
        <Text style={styles.createButtonText}>Stwórz folder</Text>
      </TouchableOpacity>

      {/* Folder "Ulubione" zawsze na górze */}
      <TouchableOpacity
        style={styles.folder}
        onPress={() => router.push("/wardrobe/favorites/favorites")}
      >
        <FavoritesIcon width={40} height={40} color="#A37D5D" />
        <Text style={styles.folderText}>Ulubione</Text>
      </TouchableOpacity>

      {/* Foldery użytkownika — long press otwiera menu */}
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.folder}
            onPress={() =>
              router.push({
                pathname: "/wardrobe/folderView",
                params: { folderId: item.id, folderName: item.name },
              })
            }
            onLongPress={() => handleLongPress(item)}
            delayLongPress={500}
          >
            <Text style={styles.folderText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal tworzenia nowego folderu */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Nowy folder</Text>
              <TextInput
                style={styles.modalInput}
                value={createFolderName}
                onChangeText={setCreateFolderName}
                placeholder="Nazwa folderu"
                placeholderTextColor="#aaa"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => {
                    setCreateModalVisible(false);
                    setCreateFolderName("");
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={handleCreateConfirm}
                >
                  <Text style={styles.modalButtonConfirmText}>Stwórz</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal zmiany nazwy folderu */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Zmień nazwę folderu</Text>
              <TextInput
                style={styles.modalInput}
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder="Nowa nazwa"
                placeholderTextColor="#aaa"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setRenameModalVisible(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonConfirm}
                  onPress={handleRenameConfirm}
                >
                  <Text style={styles.modalButtonConfirmText}>Zapisz</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#A37D5D",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  createButtonText: {
    color: "#A37D5D",
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  folder: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "rgba(163, 125, 93, 0.2)",
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8CFC4",
  },
  folderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#A37D5D",
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  modalBox: {
    backgroundColor: "#FFFAF6",
    borderRadius: 16,
    padding: 24,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202C39",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D8CFC4",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#202C39",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A37D5D",
    alignItems: "center",
  },
  modalButtonCancelText: {
    color: "#A37D5D",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#A37D5D",
    alignItems: "center",
  },
  modalButtonConfirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});