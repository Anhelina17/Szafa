import { useFocusEffect, useRouter } from "expo-router";
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
import { SvgXml } from "react-native-svg";
import TabBar from "../../../components/TabBar";
import { deleteImage, getFavoriteImages, toggleFavorite } from "../../../services/images";

const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <g clip-path="url(#clip0_192_1772)">
    <mask id="mask0_192_1772" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <path d="M24 0H0V24H24V0Z" fill="white"/>
    </mask>
    <g mask="url(#mask0_192_1772)">
      <path d="M14 7L9 12" stroke="#202C39" stroke-width="2.58621" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 12L14 17" stroke="#202C39" stroke-width="2.58621" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
  <defs>
    <clipPath id="clip0_192_1772">
      <rect width="24" height="24" fill="white"/>
    </clipPath>
  </defs>
</svg>`;

const heartFilledIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z" fill="#A37D5D" stroke="#A37D5D" stroke-width="2.06897" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function FavoritesScreen() {
  const router = useRouter();
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
    Alert.alert(
      "Ulubione",
      "Czy chcesz usunąć to zdjęcie z ulubionych?",
      [
        { text: "Nie", style: "cancel" },
        {
          text: "Tak",
          onPress: async () => {
            try {
              await toggleFavorite(item.id, item.is_favorite ?? false);
              setImages((prev) => prev.filter((img) => img.id !== item.id));
            } catch (e) {
              console.error(e);
            }
          },
        },
      ]
    );
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
        { text: "Anuluj", style: "cancel" },
      ]
    );
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      "Usuń zdjęcie",
      "Czy na pewno chcesz usunąć to zdjęcie?",
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SvgXml xml={backIcon} width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Ulubione</Text>
      </View>

      {images.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Tutaj jeszcze nic nie ma</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageContainer}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={500}
            >
              <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => handleToggleFavorite(item)}
              >
                <SvgXml xml={heartFilledIcon} width={24} height={24} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: 32,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 19,
  },
  imageContainer: {
    width: "47%",
    height: 230,
    borderRadius: 30,
    backgroundColor: "#FFFAF6",
    borderWidth: 2,
    borderColor: "#EDE1D7",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  emptyText: {
    color: "#A37D5D",
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "400",
    lineHeight: 24,
    textAlign: "center",
  },
});