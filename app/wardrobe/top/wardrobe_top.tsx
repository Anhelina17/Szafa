import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TopScreen() {
  const router = useRouter();

const folders = [
    { name: "długi rękaw", path: "/wardrobe/top/longsleeves" },
    { name: "krótki rękaw", path: "/wardrobe/top/shortsleeves" },
    { name: "na ramiączka", path: "/wardrobe/top/nosleeves" },
    { name: "swetry", path: "/wardrobe/top/sweaters" },
    { name: "kurtki", path: "/wardrobe/top/jakcets" },
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
