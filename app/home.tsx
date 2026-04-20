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
        <TouchableOpacity style={styles.buttonV1}
            onPress={() => setShowMenu(true)}
            >
          <Text style={styles.buttonV1Text}>Dodaj ubrania</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonV2} onPress={()=> router.push("/wardrobe/wardrobe")}>
          <Text style={styles.buttonV2Text}>Zobacz szafę</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonV1}>
          <Text style={styles.buttonV1Text}>Stwórz stylizację</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonV2}>
          <Text style={styles.buttonV2Text}>Zobacz stylizacje</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push("/profile")}
      >
        <Text style={styles.profileText}>Profil</Text>
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
    backgroundColor: "#FFFAF6",
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
    gap: 1,
  },
  buttonV1: {
    width: '70%',
    backgroundColor: '#A37D5D',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#A37D5D",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonV1Text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: "Inter"
  },
  buttonV2: {
    width: '70%',
    backgroundColor: '##FFFAF6',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: "#A37D5D",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonV2Text: {
    color: '#A37D5D',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: "Inter"
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
    fontFamily: "Inter"
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
  backgroundColor: "#FFFAF6",
  paddingVertical: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  alignItems: "center",
},

menuItem: {
  borderRadius: 10,
  marginBottom: 10,
  width: "80%",
    backgroundColor: "#A37D5D33",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A37D5D33",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
},

menuText: {
  color: "#A37D5D",
    fontSize: 18,
    fontWeight: "600",
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