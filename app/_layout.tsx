import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require("../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf"),
  });

  if (!loaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
