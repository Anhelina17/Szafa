import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useBackgroundRemoval } from "../hooks/use-backgroundRemoval";
import { saveImage } from "../services/images";
import { fs, s } from "../utils/scale";

const backIconDark = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M16.0603 2.45407C16.3415 2.73536 16.4995 3.11683 16.4995 3.51457C16.4995 3.91232 16.3415 4.29378 16.0603 4.57507L8.63533 12.0001L16.0603 19.4251C16.3336 19.708 16.4848 20.0869 16.4813 20.4802C16.4779 20.8735 16.3202 21.2497 16.0421 21.5278C15.7639 21.8059 15.3877 21.9637 14.9944 21.9671C14.6011 21.9705 14.2222 21.8193 13.9393 21.5461L5.45383 13.0606C5.17262 12.7793 5.01465 12.3978 5.01465 12.0001C5.01465 11.6023 5.17262 11.2209 5.45383 10.9396L13.9393 2.45407C14.2206 2.17287 14.6021 2.01489 14.9998 2.01489C15.3976 2.01489 15.779 2.17287 16.0603 2.45407Z" fill="#202C39"/>
</svg>`;

export default function PhotoPreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const router = useRouter();
  const { isLoading, error, resultUri, process, reset } = useBackgroundRemoval();

  const convertIfHeic = async (uri: string) => {
    if (!uri.toLowerCase().endsWith(".heic")) return uri;
    const manipulated = await ImageManipulator.manipulateAsync(
      uri, [], { compress: 1, format: ImageManipulator.SaveFormat.PNG }
    );
    return manipulated.uri;
  };

  const handleConfirm = async () => {
    const safeUri = await convertIfHeic(uri);
    const resized = await ImageManipulator.manipulateAsync(
      safeUri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    process(resized.uri);
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

  if (isLoading) {
    return (
      <View style={styles.loadingFullScreen}>
        <ActivityIndicator size="large" color="#A37D5D" />
        <Text style={styles.loadingText}>Usuwanie tła...</Text>
      </View>
    );
  }

  if (resultUri) {
    return (
      <View style={styles.fullScreenBeige}>
        <View style={styles.plainHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerRow}>
            <SvgXml xml={backIconDark} width={s(24)} height={s(24)} />
            <Text style={styles.headerTitleDark}>Podgląd zdjęcia</Text>
          </TouchableOpacity>
        </View>

        <Image source={{ uri: resultUri }} style={styles.image} resizeMode="contain" />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonOutline} onPress={handleDiscard}>
            <Text style={styles.buttonOutlineText}>Zrób zdjęcie ponownie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonFilled} onPress={handleSave}>
            <Text style={styles.buttonFilledText}>Zapisz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullScreenDark}>
      <Image source={{ uri }} style={styles.blurBg} resizeMode="cover" blurRadius={20} />
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />

      <ImageBackground
        source={require("../assets/images/gradient-header.png")}
        style={styles.gradientHeader}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerRow}>
          <SvgXml xml={backIconDark} width={s(24)} height={s(24)} />
          <Text style={styles.headerTitleDark}>Podgląd zdjęcia</Text>
        </TouchableOpacity>
      </ImageBackground>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Błąd: {error}</Text>
        </View>
      )}
      <View style={styles.buttonRowCenter}>
        <TouchableOpacity style={styles.buttonFilled} onPress={handleConfirm}>
          <Text style={styles.buttonFilledText}>Usuń tło</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenDark: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullScreenBeige: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    justifyContent: "space-between",
  },
  blurBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  plainHeader: {
    paddingTop: s(64),
    paddingHorizontal: s(20),
    flexDirection: "row",
    alignItems: "center",
  },
  gradientHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: s(263),
    zIndex: 10,
    justifyContent: "flex-start",
    paddingTop: s(64),
    paddingHorizontal: s(20),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
  },
  headerTitleDark: {
    fontSize: fs(24),
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: fs(32),
  },
  image: {
    flex: 1,
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: s(10),
    paddingHorizontal: s(20),
    paddingBottom: s(32),
  },
  buttonRowCenter: {
    position: "absolute",
    bottom: s(32),
    left: s(20),
    right: s(20),
    alignItems: "center",
  },
  buttonFilled: {
    height: s(50),
    paddingHorizontal: s(20),
    backgroundColor: "#A37D5D",
    borderRadius: s(30),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonFilledText: {
    color: "#FFFFFF",
    fontSize: fs(16),
    fontWeight: "400",
    fontFamily: "Inter",
    lineHeight: fs(24),
  },
  buttonOutline: {
    height: s(50),
    paddingHorizontal: s(20),
    backgroundColor: "transparent",
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#A37D5D",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  buttonOutlineText: {
    color: "#A37D5D",
    fontSize: fs(16),
    fontWeight: "400",
    fontFamily: "Inter",
    lineHeight: fs(24),
  },
  loadingFullScreen: {
    flex: 1,
    backgroundColor: "#FFFAF6",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#A37D5D",
    marginTop: s(12),
    fontSize: fs(16),
    fontWeight: "600",
    fontFamily: "Inter",
  },
  errorBanner: {
    position: "absolute",
    bottom: s(120),
    left: s(20),
    right: s(20),
    backgroundColor: "rgba(200,0,0,0.8)",
    padding: s(12),
    borderRadius: s(8),
  },
  errorText: {
    color: "white",
    textAlign: "center",
  },
});
