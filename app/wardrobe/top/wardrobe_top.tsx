import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TopScreen() {
  const router = useRouter();

const folders = [
    { name: "długi rękaw", path: "/wardrobe/top/longsleeves" },
    { name: "krótki rękaw", path: "/wardrobe/top/shortsleeves" },
    { name: "na ramiączka", path: "/wardrobe/top/nosleeves" },
    { name: "swetry", path: "/wardrobe/top/sweaters" },
    { name: "kurtki", path: "/wardrobe/top/jackets" },
    { name: "sukienki", path: "/wardrobe/top/dresses" },
  ];

   return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoja szafa - góra</Text>

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