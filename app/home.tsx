import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Szafa</Text>
      <Text style={styles.subtitle}>Twoja wirtualna szafa</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Dodaj ubrania</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={()=> router.push("/wardrobe/wardrobe")}>
          <Text style={styles.buttonText}>Zobacz szafę</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Stwórz stylizację</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Zobacz stylizacje</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push("/profile")}
      >
        <Text style={styles.profileText}>Profil</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.plus}
  onPress={() => setShowMenu(true)}
>
  <Text style={styles.plusText}>+</Text>
</TouchableOpacity>
{showMenu && (
  <View style={styles.menuOverlay}>
    <View style={styles.menuBox}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          setShowMenu(false);
          router.push("/camera");
        }}
      >
        <Text style={styles.menuText}>Otwórz aparat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          setShowMenu(false);
          router.push("/galleryPicker");
        }}
      >
        <Text style={styles.menuText}>Otwórz galerię</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuCancel}
        onPress={() => setShowMenu(false)}
      >
        <Text style={styles.menuCancelText}>Anuluj</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFF",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    color: "#202C39",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Helvetica",
    color: "#202C39",
    marginBottom: 40,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  button: {
    width: "80%",
    backgroundColor: "#AE847E",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
  },
  profileButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#2c3e50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  profileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  plus: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#AE847E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, 
  },
  
  plusText: {
    position: "absolute",
    bottom: 0.5,
    fontSize: 60,
    color: "#fff",
    fontWeight: "bold",
  },
  menuOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "flex-end",
  alignItems: "center",
},

menuBox: {
  width: "100%",
  backgroundColor: "#fff",
  paddingVertical: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  alignItems: "center",
},

menuItem: {
  width: "90%",
  paddingVertical: 15,
  borderRadius: 10,
  backgroundColor: "#AE847E",
  alignItems: "center",
  marginBottom: 10,
},

menuText: {
  fontSize: 18,
  fontWeight: "600",
  color: "#000",
},

menuCancel: {
  marginTop: 10,
  paddingVertical: 10,
},

menuCancelText: {
  fontSize: 16,
  color: "#202C39",
},

});