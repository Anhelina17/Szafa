import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
import { deleteImage, getFavoriteImages, toggleFavorite } from "../../../services/images";

export default function FavoritesScreen() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const data = await getFavoriteImages();
      setImages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (item: any) => {
    try {
      await toggleFavorite(item.id, item.is_favorite ?? false);
      setImages((prev) => prev.filter((img) => img.id !== item.id));
    } catch (e) {
      console.error(e);
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
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteImage(item.id, item.image_url);
              await loadFavorites();
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

  return (
    <View style={styles.container}>
      {images.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Brak ulubionych zdjęć</Text>
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
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => handleToggleFavorite(item)}
              >
                <Ionicons name="heart" size={22} color="#A37D5D" />
              </TouchableOpacity>
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
  heartButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 4,
  },
  emptyText: {
    color: "#A37D5D",
    fontSize: 16,
  },
});