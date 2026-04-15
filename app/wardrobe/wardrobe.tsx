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
    backgroundColor: "#FFFAF6",
    paddingTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  title: {
    width: "100%",
    fontSize: 28,
    fontWeight: "700",
    color: "#202C39",
    marginBottom: 25,
    textAlign: "center",
  },
  folder: {
    width: "48%",
    backgroundColor: "#A37D5D33",
    paddingVertical: 22,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#A37D5D33",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  folderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A37D5D",
    marginTop: 6,
  },
});
