import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabaseClient";
import { fs, s } from "../utils/scale";

export default function LoginScreen() {
  const router = useRouter() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    checkOfflineAndBiometrics();
  }, []);

  const checkOfflineAndBiometrics = async () => {
    // Sprawdź czy jest zapisana sesja
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setHasSession(true);
    }

    // Sprawdź czy urządzenie ma biometrię
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometrics(compatible && enrolled);

    // Sprawdź czy jest internet
    try {
      await fetch("https://www.google.com", { method: "HEAD" });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
    }
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Zaloguj się do Szafy",
      fallbackLabel: "Użyj PIN-u",
      cancelLabel: "Anuluj",
    });

    if (result.success) {
      router.replace("/wardrobe/wardrobe");
    } else {
      setGeneralError("Uwierzytelnianie nie powiodło się");
    }
  };

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
    if (!email.trim()) { setEmailError("Wpisz adres e-mail"); valid = false; }
    if (!password.trim()) { setPasswordError("Wpisz hasło"); valid = false; }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setGeneralError("Nieprawidłowy e-mail lub hasło");
    } else {
      router.replace("/wardrobe/wardrobe");
    }
  };

  const bothFieldsError = !!generalError;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Logowanie</Text>

        {/* Baner offline */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Brak połączenia z internetem</Text>
          </View>
        )}

        {/* Przycisk biometryczny — tylko gdy offline + jest sesja + jest biometria */}
        {isOffline && hasSession && hasBiometrics && (
          <TouchableOpacity style={styles.buttonBiometric} onPress={handleBiometricLogin}>
            <Text style={styles.buttonBiometricText}>
              {Platform.OS === "ios" ? "Zaloguj się przez Face ID / Touch ID" : "Zaloguj się odciskiem palca"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Formularz logowania — tylko gdy jest internet */}
        {!isOffline && (
          <>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, (emailError && emailError.trim()) || bothFieldsError ? styles.inputError : null]}
                placeholder="Email"
                placeholderTextColor={(emailError && emailError.trim()) || bothFieldsError ? "#E05744" : "#9D9D9D"}
                autoCapitalize="none"
                autoComplete="off"
                keyboardType="email-address"
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(""); setGeneralError(""); }}
              />
              {emailError && emailError.trim() ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
              <TextInput
                style={[styles.input, (passwordError && passwordError.trim()) || bothFieldsError ? styles.inputError : null]}
                placeholder="Hasło"
                placeholderTextColor={(passwordError && passwordError.trim()) || bothFieldsError ? "#E05744" : "#9D9D9D"}
                secureTextEntry
                autoComplete="off"
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(""); setGeneralError(""); }}
              />
              {passwordError && passwordError.trim() ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
            </View>

            <View style={{ height: s(12) }} />

            <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
              <Text style={styles.buttonPrimaryText}>Kontynuuj</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push("/register")}>
              <Text style={styles.buttonSecondaryText}>Wróć do rejestracji</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/resetPassword")}>
              <Text style={styles.forgotPassword}>Nie pamiętasz hasła?</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Gdy offline ale nie ma sesji */}
        {isOffline && !hasSession && (
          <View style={styles.center}>
            <Text style={styles.offlineNoSession}>
              Brak połączenia z internetem. Zaloguj się online przynajmniej raz aby móc korzystać z aplikacji offline.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFFAF6" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: s(20),
    backgroundColor: "#FFFAF6",
  },
  title: {
    fontSize: fs(24),
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: fs(32),
    textAlign: "center",
    marginBottom: s(24),
  },
  offlineBanner: {
    backgroundColor: "#FFF3E0",
    borderRadius: s(10),
    padding: s(10),
    marginBottom: s(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A37D5D",
    width: s(300),
  },
  offlineText: {
    color: "#A37D5D",
    fontSize: fs(13),
    fontFamily: "Inter",
    fontWeight: "500",
  },
  buttonBiometric: {
    width: s(300),
    height: s(48),
    backgroundColor: "#202C39",
    borderRadius: s(30),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: s(12),
  },
  buttonBiometricText: {
    color: "#FFFFFF",
    fontSize: fs(16),
    fontWeight: "400",
    fontFamily: "Inter",
  },
  inputWrapper: { width: s(300), marginBottom: s(12) },
  input: {
    width: "100%",
    height: s(48),
    borderRadius: s(30),
    paddingHorizontal: s(16),
    fontSize: fs(16),
    fontFamily: "Inter",
    fontWeight: "400",
    textAlignVertical: "center",
    includeFontPadding: false,
    color: "#202C39",
    backgroundColor: "#EDE1D7",
    borderWidth: 2,
    borderColor: "#EDE1D7",
  },
  inputError: { borderColor: "#E05744", backgroundColor: "#FFFAF6", color: "#E05744" },
  errorText: {
    color: "#E05744",
    fontSize: fs(12),
    fontFamily: "Inter",
    fontWeight: "400",
    lineHeight: fs(20),
    marginTop: 0,
    paddingHorizontal: s(8),
  },
  buttonPrimary: {
    width: s(300),
    height: s(48),
    backgroundColor: "#A37D5D",
    borderRadius: s(30),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: s(8),
  },
  buttonPrimaryText: { color: "#FFFFFF", fontSize: fs(16), fontWeight: "400", fontFamily: "Inter" },
  buttonSecondary: {
    width: s(300),
    height: s(48),
    backgroundColor: "#FFFAF6",
    borderRadius: s(30),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#A37D5D",
    marginBottom: s(16),
  },
  buttonSecondaryText: { color: "#A37D5D", fontSize: fs(16), fontWeight: "400", fontFamily: "Inter" },
  forgotPassword: { color: "#A37D5D", fontSize: fs(16), fontWeight: "400", fontFamily: "Inter" },
  center: { width: s(300), alignItems: "center" },
  offlineNoSession: {
    color: "#A37D5D",
    fontSize: fs(14),
    fontFamily: "Inter",
    textAlign: "center",
    lineHeight: fs(22),
  },
});