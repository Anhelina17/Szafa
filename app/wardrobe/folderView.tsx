import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";
import { getImagesByFolder } from "../../services/images";

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

    if (folderId) loadImages();
  }, [folderId]);

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
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              resizeMode="contain"
            />
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
  image: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#f0ebe5",
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