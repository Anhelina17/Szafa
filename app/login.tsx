import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function LoginScreen() {
  const router = useRouter() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!email.trim()) {
      setEmailError("Wpisz adres e-mail");
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError("Wpisz hasło");
      valid = false;
    }
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

  const bothFieldsError = !!(generalError);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Logowanie</Text>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              (emailError && emailError.trim()) || bothFieldsError ? styles.inputError : null,
            ]}
            placeholder="Email"
            placeholderTextColor={(emailError && emailError.trim()) || bothFieldsError ? "#E05744" : "#9D9D9D"}
            autoCapitalize="none"
            autoComplete="off"
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setEmailError("");
              setGeneralError("");
            }}
          />
          {emailError && emailError.trim() ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
          <TextInput
            style={[
              styles.input,
              (passwordError && passwordError.trim()) || bothFieldsError ? styles.inputError : null,
            ]}
            placeholder="Hasło"
            placeholderTextColor={(passwordError && passwordError.trim()) || bothFieldsError ? "#E05744" : "#9D9D9D"}
            secureTextEntry
            autoComplete="off"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setPasswordError("");
              setGeneralError("");
            }}
          />
          {passwordError && passwordError.trim() ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
          {/* generalError вплотную под полем пароля */}
          {generalError ? (
            <Text style={styles.errorText}>{generalError}</Text>
          ) : null}
        </View>

        <View style={{ height: 12 }} />

        {/* Kontynuuj */}
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
          <Text style={styles.buttonPrimaryText}>Kontynuuj</Text>
        </TouchableOpacity>

        {/* Wróć do rejestracji */}
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonSecondaryText}>Wróć do rejestracji</Text>
        </TouchableOpacity>

        {/* Nie pamiętasz hasła — zawsze widoczne */}
        <TouchableOpacity onPress={() => router.push("/resetPassword")}>
          <Text style={styles.forgotPassword}>Nie pamiętasz hasła?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#FFFAF6",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFAF6",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: 32,
    textAlign: "center",
    marginBottom: 24,
  },
  inputWrapper: {
    width: 300,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 30,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "400",
    textAlignVertical: "center",
    includeFontPadding: false,
    color: "#202C39",
    backgroundColor: "#EDE1D7",
    borderWidth: 2,
    borderColor: "#EDE1D7",
  },
  inputError: {
    borderColor: "#E05744",
    backgroundColor: "#FFFAF6",
    color: "#E05744",
  },
  errorText: {
    color: "#E05744",
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 0,
    paddingHorizontal: 8,
  },
  buttonPrimary: {
    width: 300,
    height: 48,
    backgroundColor: "#A37D5D",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter",
    lineHeight: 24,
  },
  buttonSecondary: {
    width: 300,
    height: 48,
    backgroundColor: "#FFFAF6",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#A37D5D",
    marginBottom: 16,
  },
  buttonSecondaryText: {
    color: "#A37D5D",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter",
    lineHeight: 24,
  },
  forgotPassword: {
    color: "#A37D5D",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter",
    lineHeight: 24,
  },
});
