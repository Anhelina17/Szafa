import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require("../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf"),
  });

  if (!loaded) return null;

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FFFAF6" },
          headerTintColor: "#A37D5D",
          headerTitleStyle: { fontWeight: "700", fontFamily: "Inter" },
          headerBackTitle: "Wróć",
          headerShadowVisible: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="photoPreview" options={{ headerShown: false }} />
        <Stack.Screen name="selectFolder" options={{ headerShown: false }} />
        <Stack.Screen name="galleryPicker" options={{ title: "Galeria" }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="wardrobe/wardrobe" options={{ headerShown: false }} />
        <Stack.Screen name="wardrobe/folderView" options={{ headerShown: false }} />
        <Stack.Screen name="wardrobe/favorites/favorites" options={{ headerShown: false }} />
        <Stack.Screen name="outfits/selectImages" options={{ headerShown: false }} />
        <Stack.Screen name="outfits/outfits" options={{ headerShown: false }} />
        <Stack.Screen name="outfits/outfitPreview" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}