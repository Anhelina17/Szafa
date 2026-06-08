import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fs, s } from "../utils/scale";

export default function StartScreen() {
  const router = useRouter() as any;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Otwórz swoją Szafę</Text>
      <Text style={styles.subtitle}>Dodawaj ubrania i twórz stylizacje</Text>

      <TouchableOpacity
        style={styles.buttonLog}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonLogText}>Zaloguj się</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonReg}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.buttonRegText}>Zarejestruj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFAF6",
    paddingHorizontal: s(20),
  },
  title: {
    fontSize: fs(24),
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: fs(32),
    textAlign: "center",
    marginBottom: s(8),
  },
  subtitle: {
    fontSize: fs(16),
    fontWeight: "400",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: fs(24),
    textAlign: "center",
    marginBottom: s(40),
  },
  buttonLog: {
    width: s(300),
    height: s(48),
    backgroundColor: "#A37D5D",
    borderRadius: s(30),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: s(12),
  },
  buttonLogText: {
    color: "#FFFFFF",
    fontSize: fs(16),
    fontWeight: "400",
    fontFamily: "Inter",
  },
  buttonReg: {
    width: s(300),
    height: s(48),
    backgroundColor: "#FFFAF6",
    borderRadius: s(30),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#A37D5D",
  },
  buttonRegText: {
    color: "#A37D5D",
    fontSize: fs(16),
    fontWeight: "400",
    fontFamily: "Inter",
  },
});
