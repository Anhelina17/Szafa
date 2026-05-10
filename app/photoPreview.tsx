import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useBackgroundRemoval } from "../hooks/use-backgroundRemoval";
import { saveImage } from "../services/images";

export default function PhotoPreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();

  const { isLoading, error, resultUri, process, reset } =
    useBackgroundRemoval();

  const convertIfHeic = async (uri: string) => {
    if (!uri.toLowerCase().endsWith(".heic")) {
      return uri;
    }
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG }
    );
    return manipulated.uri;
  };

  const handleConfirm = async () => {
    const safeUri = await convertIfHeic(uri);
    process(safeUri);
  };

  const handleDiscard = () => {
    reset();
    router.back();
  };

  const handleSave = async () => {
    try {
      if (!resultUri) return;
      const image = await saveImage(resultUri);
      router.push(`/selectFolder?imageId=${image.id}`);
    } catch (err) {
      console.log(err);
      alert("Błąd zapisu");
    }
  };

  // Pełnoekranowy widok ładowania — zakrywa nagłówek
  if (isLoading) {
    return (
      <View style={styles.loadingFullScreen}>
        <ActivityIndicator size="large" color="#A37D5D" />
        <Text style={styles.loadingText}>Usuwanie tła...</Text>
      </View>
    );
  }

  // Ekran po usunięciu tła
  if (resultUri) {
    return (
      <View style={{ flex: 1, backgroundColor: "#888" }}>
        <Image
          source={{ uri: resultUri }}
          style={{ flex: 1 }}
          resizeMode="contain"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={handleDiscard}>
            <Text style={styles.buttonText}>Odrzuć</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Zapisz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Ekran podglądu przed usunięciem tła
  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri }} style={{ flex: 1 }} resizeMode="contain" />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Błąd: {error}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirm}
        >
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#DDD5D0",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    minWidth: 100,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
  },
  loadingFullScreen: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#A37D5D",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  errorBanner: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: "rgba(200,0,0,0.8)",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "white",
    textAlign: "center",
  },
});