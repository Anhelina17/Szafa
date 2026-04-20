import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AccessoriesIcon from "../../assets/icons/icon_accessories.svg";
import BottomIcon from "../../assets/icons/icon_bottom.svg";
import FavoritesIcon from "../../assets/icons/icon_favorites.svg";
import ShoesIcon from "../../assets/icons/icon_shoes.svg";
import TopIcon from "../../assets/icons/icon_top.svg";

export default function WardrobeScreen() {
  const router = useRouter();

const folders = [
  { name: "Ulubione", icon: FavoritesIcon, path: "/wardrobe/favorites/favorites" },
  { name: "Góra", icon: TopIcon, path: "/wardrobe/top/wardrobe_top" },
  { name: "Dół", icon: BottomIcon, path: "/wardrobe/bottom/wardrobe_bottom" },
  { name: "Buty", icon: ShoesIcon, path: "/wardrobe/shoes/wardrobe_shoes" },
  { name: "Akcesoria", icon: AccessoriesIcon, path: "/wardrobe/accessories/wardrobe_accessories" },
];


   return (
    <View style={styles.container}>
      <Text style={styles.title}>Twoja szafa</Text>

      {folders.map((f) => (
        <TouchableOpacity
          key={f.name}
          style={styles.folder}
          onPress={() => router.push(f.path as any)}
        >
          <f.icon width={40} height={40} color="#A37D5D"/>
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
