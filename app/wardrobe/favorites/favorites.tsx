import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { getFavoriteImages, toggleFavorite } from "../../../services/images";

export default function FavoritesScreen() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useFocusEffect odświeża listę gdy wracamy na ten ekran
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
      // Usuwamy zdjęcie z listy gdy odznaczamy ulubione
      setImages((prev) => prev.filter((img) => img.id !== item.id));
    } catch (e) {
      console.error(e);
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
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => handleToggleFavorite(item)}
>
                <Ionicons
                  name="heart"
                  size={22}
                  color="#A37D5D"
                />
              </TouchableOpacity>
            </View>
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