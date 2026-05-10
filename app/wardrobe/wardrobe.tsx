import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import FavoritesIcon from "../../assets/icons/icon_favorites.svg";
import { getFolders } from "../../services/folders";

export default function WardrobeScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    loadFolders();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A37D5D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoja szafa</Text>

      {/* Folder "Ulubione" zawsze na górze — specjalny */}
      <TouchableOpacity
        style={styles.folder}
        onPress={() => router.push("/wardrobe/favorites/favorites")}
      >
        <FavoritesIcon width={40} height={40} color="#A37D5D" />
        <Text style={styles.folderText}>Ulubione</Text>
      </TouchableOpacity>

      {/* Foldery użytkownika z Supabase */}
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
          >
            <Text style={styles.folderText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    paddingTop: 40,
    paddingHorizontal: 16,
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#202C39",
    marginBottom: 25,
    marginTop: 16,
    textAlign: "center",
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
});