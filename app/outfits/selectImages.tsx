import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { getFolders } from "../../services/folders";
import { getImagesByFolder } from "../../services/images";


type ImageItem = {
  id: string;
  image_url: string;
  is_favorite: boolean;
};


type Folder = {
  id: string;
  name: string;
};

export default function SelectImagesScreen() {
  const router = useRouter();

  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeFolderName, setActiveFolderName] = useState<string>("");
  const [folderImages, setFolderImages] = useState<ImageItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setIsLoadingFolders(true);
      const data = await getFolders();
      setFolders(data ?? []);
    } catch (e) {
      console.error("Błąd ładowania folderów:", e);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const openFolder = async (folder: Folder) => {
    try {
      setActiveFolderId(folder.id);
      setActiveFolderName(folder.name);
      setIsLoadingImages(true);
      const data = await getImagesByFolder(folder.id);
      setFolderImages(data);
    } catch (e) {
      console.error("Błąd ładowania zdjęć:", e);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const goBackToFolders = () => {
    setActiveFolderId(null);
    setActiveFolderName("");
    setFolderImages([]);
  };

  // Zaznaczanie/odznaczanie zdjęcia
  const toggleImage = useCallback((image: ImageItem) => {
    setSelectedImages((prev) => {
      const isAlreadySelected = prev.some((img) => img.id === image.id);
      if (isAlreadySelected) {
        return prev.filter((img) => img.id !== image.id);
      } else {
        return [...prev, image];
      }
    });
  }, []);

  const isSelected = useCallback(
    (imageId: string) => selectedImages.some((img) => img.id === imageId),
    [selectedImages]
  );

  const handleNext = () => {
    if (selectedImages.length === 0) return;
    router.push({
      pathname: "/outfits/outfitPreview",
      params: {
        selectedImages: JSON.stringify(selectedImages),
      },
    });
  };

  if (!activeFolderId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#202C39" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wybierz zdjęcia</Text>
          <TouchableOpacity
            onPress={handleNext}
            disabled={selectedImages.length === 0}
          >
            <Text
              style={[
                styles.nextButton,
                selectedImages.length === 0 && styles.nextButtonDisabled,
              ]}
            >
              Dalej
            </Text>
          </TouchableOpacity>
        </View>

        {isLoadingFolders ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#A37D5D" />
          </View>
        ) : (
          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.folder}
                onPress={() => openFolder(item)}
              >
                <Ionicons name="folder-outline" size={36} color="#A37D5D" />
                <Text style={styles.folderText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Brak folderów</Text>
              </View>
            }
          />
        )}

        {selectedImages.length > 0 && (
          <SelectedBar
            selectedImages={selectedImages}
            onRemove={(id) =>
              setSelectedImages((prev) => prev.filter((img) => img.id !== id))
            }
          />
        )}
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToFolders}>
          <Ionicons name="arrow-back" size={24} color="#202C39" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeFolderName}</Text>
        <TouchableOpacity
          onPress={handleNext}
          disabled={selectedImages.length === 0}
        >
          <Text
            style={[
              styles.nextButton,
              selectedImages.length === 0 && styles.nextButtonDisabled,
            ]}
          >
            Dalej
          </Text>
        </TouchableOpacity>
      </View>

      {isLoadingImages ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A37D5D" />
        </View>
      ) : (
        <FlatList
          data={folderImages}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            selectedImages.length > 0 && { paddingBottom: 110 },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.imageContainer,
                isSelected(item.id) && styles.imageContainerSelected,
              ]}
              onPress={() => toggleImage(item)}
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="contain"
              />
              <View style={styles.checkbox}>
                {isSelected(item.id) ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={26}
                    color="#A37D5D"
                  />
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={26}
                    color="#A37D5D"
                  />
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Brak zdjęć w tym folderze</Text>
            </View>
          }
        />
      )}

      {/* Pasek wybranych zdjęć */}
      {selectedImages.length > 0 && (
        <SelectedBar
          selectedImages={selectedImages}
          onRemove={(id) =>
            setSelectedImages((prev) => prev.filter((img) => img.id !== id))
          }
        />
      )}
    </View>
  );
}

// Pasek wybranych zdjęć
function SelectedBar({
  selectedImages,
  onRemove,
}: {
  selectedImages: ImageItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <View style={styles.selectedBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedImages.map((img) => (
          <View key={img.id} style={styles.selectedThumb}>
            <Image
              source={{ uri: img.image_url }}
              style={styles.selectedThumbImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(img.id)}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#FFFAF6",
    borderBottomWidth: 1,
    borderBottomColor: "#E8DDD4",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#202C39",
  },
  nextButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#A37D5D",
  },
  nextButtonDisabled: {
    color: "#C4B8AE",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  folder: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: "rgba(163, 125, 93, 0.1)",
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8CFC4",
  },
  folderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A37D5D",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  imageContainer: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#F5EFE9",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  imageContainerSelected: {
    borderColor: "#A37D5D",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  checkbox: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 13,
  },
  emptyText: {
    color: "#A37D5D",
    fontSize: 16,
  },
  selectedBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#202C39",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  selectedThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  selectedThumbImage: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#A37D5D",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});