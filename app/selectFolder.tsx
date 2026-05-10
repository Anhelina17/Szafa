import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { getFolders } from "../services/folders";
import { addImageToFolders } from "../services/images";

export default function SelectFolderScreen() {
  const router = useRouter();
  const { imageId } = useLocalSearchParams<{ imageId: string }>();

  const safeImageId = Array.isArray(imageId) ? imageId[0] : imageId;

  const [folders, setFolders] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const data = await getFolders();
        setFolders(data || []);
      } catch (e) {
        console.error(e);
      }
    };

    loadFolders();
  }, []);

  const toggleFolder = (folderId: string) => {
    if (selected.includes(folderId)) {
      setSelected(selected.filter((id) => id !== folderId));
    } else {
      setSelected([...selected, folderId]);
    }
  };

  const handleSave = async () => {
    try {
      if (!safeImageId || selected.length === 0) {
        alert("Wybierz przynajmniej jeden folder");
        return;
      }

      await addImageToFolders(safeImageId, selected);

      alert("Zdjęcie dodane do folderów");

      setSelected([]);

      router.replace("/wardrobe/wardrobe");
    } catch (e) {
      console.error(e);
      alert("Błąd zapisu");
    }
  };

  return (
    <View style={styles.container}>
      {/*<Text style={styles.title}>Wybierz foldery</Text>/*/}

      {folders.map((folder) => {
        const isSelected = selected.includes(folder.id);

        return (
          <TouchableOpacity
            key={folder.id}
            style={[
              styles.folder,
              isSelected && styles.selectedFolder,
            ]}
            onPress={() => toggleFolder(folder.id)}
          >
            <Text style={styles.folderText}>
              {isSelected ? "✓ " : ""}
              {folder.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Zapisz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFAF6",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  folder: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedFolder: {
    backgroundColor: "#A37D5D33",
  },
  folderText: {
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#A37D5D",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});