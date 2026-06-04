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

export default function WardrobeScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        { text: "Anuluj", style: "cancel" },
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
      <Text style={styles.title}>Ubrania</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setCreateModalVisible(true)}
      >
        <SvgXml xml={plusIcon} width={30} height={30} />
        <Text style={styles.createButtonText}>Stwórz folder</Text>
      </TouchableOpacity>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.folder}
            onPress={() => router.push("/wardrobe/favorites/favorites")}
          >
            <SvgXml xml={favoritesIcon} width={40} height={40} />
            <Text style={styles.folderText}>Ulubione</Text>
          </TouchableOpacity>
        }
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

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#A37D5D",
    borderStyle: "dashed",
    borderRadius: 30,
    height: 50,
    marginBottom: 16,
  },
  createButtonText: {
    color: "#A37D5D",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  folder: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 30,
    backgroundColor: "rgba(163, 125, 93, 0.2)",
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  folderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#A37D5D",
    fontFamily: "Inter",
    marginTop: 6,
    textAlign: "center",
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