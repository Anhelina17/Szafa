import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { deleteImage, getImagesByFolder } from "../../services/images";

export default function FolderViewScreen() {
  const { folderId, folderName } = useLocalSearchParams<{
    folderId: string;
    folderName: string;
  }>();

  const navigation = useNavigation();
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: folderName ?? "Folder",
    });
  }, [folderName]);

  useEffect(() => {
    if (folderId) loadImages();
  }, [folderId]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const data = await getImagesByFolder(folderId);
      setImages(data);
    } catch (e) {
      setError("Nie udało się załadować zdjęć");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLongPress = (item: any) => {
    Alert.alert(
      "Opcje zdjęcia",
      "Co chcesz zrobić z tym zdjęciem?",
      [
        {
          text: "Usuń zdjęcie",
          style: "destructive",
          onPress: () => handleDelete(item),
        },
        {
          text: "Anuluj",
          style: "cancel",
        },
      ]
    );
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      "Usuń zdjęcie",
      "Czy na pewno chcesz usunąć to zdjęcie? Zostanie usunięte ze wszystkich folderów.",
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteImage(item.id, item.image_url);
              await loadImages();
            } catch (e) {
              Alert.alert("Błąd", "Nie udało się usunąć zdjęcia");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A37D5D" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {images.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Brak zdjęć w tym folderze</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageContainer}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  imageContainer: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#f0ebe5",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyText: {
    color: "#A37D5D",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});