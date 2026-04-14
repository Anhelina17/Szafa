import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function GalleryPickerScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Zapytaj o uprawnienia
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Brak dostępu do galerii");
        router.back();
        return;
      }

      // Otwórz galerię
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        router.push({
          pathname: "/photoPreview",
          params: { uri },
        });
      } else {
        router.back();
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Otwieranie galerii...</Text>
    </View>
  );
}