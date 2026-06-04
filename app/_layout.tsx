import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require("../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf"),
  });

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFAF6" },
        headerTintColor: "#A37D5D",
        headerTitleStyle: { fontWeight: "700", fontFamily: "Inter" },
        headerBackTitle: "Wróć",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="camera" options={{ title: "Aparat" }} />
      <Stack.Screen name="photoPreview" options={{ title: "Podgląd zdjęcia" }} />
      <Stack.Screen name="selectFolder" options={{ title: "Wybierz folder" }} />
      <Stack.Screen name="galleryPicker" options={{ title: "Galeria" }} />
      <Stack.Screen name="profile" options={{ title: "Profil" }} />
      <Stack.Screen name="wardrobe/wardrobe" options={{ headerShown: false }} />
      <Stack.Screen name="wardrobe/folderView" options={{ title: "" }} />
      <Stack.Screen name="wardrobe/favorites/favorites" options={{ headerShown: false }} />
      <Stack.Screen name="outfits/selectImages" options={{ headerShown: false }} />
      <Stack.Screen name="outfits/outfits" options={{ headerShown: false }} />
      <Stack.Screen name="outfits/outfitPreview" options={{ headerShown: false }} />
    </Stack>
  );
}