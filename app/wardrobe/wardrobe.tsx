import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WardrobeScreen() {
  const router = useRouter();

const folders = [
    { name: "Ulubione", path: "/wardrobe/favorites/favorites" },
    { name: "Góra", path: "/wardrobe/top/wardrobe_top" },
    { name: "Dół", path: "/wardrobe/bottom/wardrobe_bottom" },
    { name: "Buty", path: "/wardrobe/shoes/wardrobe_shoes" },
    { name: "Akcesoria", path: "/wardrobe/accessories/wardrobe_accessories" },
  ];

   return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoja szafa</Text>

      {folders.map((f) => (
        <TouchableOpacity
          key={f.name}
          style={styles.folder}
          onPress={() => router.push(f.path)}
        >
          <Text style={styles.folderText}>{f.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#202C39",
    marginBottom: 40,
  },
  folder: {
    width: "80%",
    backgroundColor: "#AE847E",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  folderText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
});
