import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useBackgroundRemoval } from "../hooks/use-backgroundRemoval";

export default function PhotoPreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();
  const { isLoading, error, resultUri, process, reset } =
    useBackgroundRemoval();

  const handleConfirm = () => {
    process(uri);
  };

  const handleDiscard = () => {
    reset();
    router.back();
  };

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
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              alert("Gotowe do zapisania!");
            }}
          >
            <Text style={styles.buttonText}>Zapisz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri }} style={{ flex: 1 }} resizeMode="contain" />

      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Usuwanie tła...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Błąd: {error}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleDiscard}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Wróć</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirm}
          disabled={isLoading}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
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