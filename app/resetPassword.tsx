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
import { SvgXml } from "react-native-svg";
import { supabase } from "../supabaseClient";

const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="#40A421" stroke-width="2"/>
  <path d="M11.0002 15.9999C10.8686 16.0007 10.7381 15.9755 10.6163 15.9257C10.4944 15.8759 10.3836 15.8026 10.2902 15.7099L7.29019 12.7099C7.19695 12.6167 7.12299 12.506 7.07253 12.3842C7.02207 12.2624 6.99609 12.1318 6.99609 11.9999C6.99609 11.7336 7.10188 11.4782 7.29019 11.2899C7.47849 11.1016 7.73388 10.9958 8.00019 10.9958C8.26649 10.9958 8.52188 11.1016 8.71019 11.2899L11.0002 13.5899L15.2902 9.28994C15.4785 9.10164 15.7339 8.99585 16.0002 8.99585C16.2665 8.99585 16.5219 9.10164 16.7102 9.28994C16.8985 9.47824 17.0043 9.73364 17.0043 9.99994C17.0043 10.2662 16.8985 10.5216 16.7102 10.7099L11.7102 15.7099C11.6167 15.8026 11.5059 15.8759 11.3841 15.9257C11.2623 15.9755 11.1318 16.0007 11.0002 15.9999Z" fill="#40A421"/>
</svg>`;

type Step = "email" | "code" | "newPassword";

export default function ResetPasswordScreen() {
  const router = useRouter() as any;

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeOk, setCodeOk] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordOk, setPasswordOk] = useState(false);
  const [confirmOk, setConfirmOk] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Wpisz poprawny adres e-mail");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setEmailError("Nie udało się wysłać kodu");
      return;
    }
    setStep("code");
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length < 4) {
      setCodeError("Wpisz poprawny kod");
      setCodeOk(false);
      return;
    }
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });
    if (error) {
      setCodeError("Wpisz poprawny kod");
      setCodeOk(false);
      return;
    }
    setCodeOk(true);
    setStep("newPassword");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Hasło musi mieć min. 6 znaków");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Hasła nie pasują do siebie");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError("Nie udało się zmienić hasła");
      return;
    }
    router.replace("/login");
  };

  // ── STEP 1: Email ──────────────────────────────────────────────
  if (step === "email") {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Zresetuj hasło</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Email"
              placeholderTextColor="#9D9D9D"
              autoCapitalize="none"
              autoComplete="off"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setEmailError("");
              }}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSendCode}>
            <Text style={styles.buttonPrimaryText}>Wyślij kod</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.buttonSecondaryText}>Wróć do rejestracji</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── STEP 2: Code ───────────────────────────────────────────────
  if (step === "code") {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Zresetuj hasło</Text>

          <View style={styles.inputWrapper}>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  codeError ? styles.inputError : codeOk ? styles.inputOk : null,
                ]}
                placeholder="Wpisz kod"
                placeholderTextColor="#9D9D9D"
                autoComplete="off"
                keyboardType="number-pad"
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setCodeError("");
                  setCodeOk(t.length >= 4);
                }}
              />
              {codeOk && !codeError && (
                <View style={styles.checkIcon}>
                  <SvgXml xml={checkIcon} width={24} height={24} />
                </View>
              )}
            </View>
            {codeError ? (
              <Text style={styles.errorText}>{codeError}</Text>
            ) : null}
          </View>

          <TouchableOpacity style={styles.buttonPrimary} onPress={handleVerifyCode}>
            <Text style={styles.buttonPrimaryText}>Potwierdź</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.buttonSecondaryText}>Wróć do rejestracji</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── STEP 3: New password ───────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Ustaw nowe hasło</Text>

        {/* Hasło */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                passwordError ? styles.inputError : passwordOk ? styles.inputOk : null,
              ]}
              placeholder="Hasło"
              placeholderTextColor="#9D9D9D"
              secureTextEntry
              autoComplete="off"
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                setPasswordError("");
                setPasswordOk(t.length >= 6);
                if (confirmPassword) {
                  setConfirmOk(t === confirmPassword);
                }
              }}
            />
            {passwordOk && !passwordError && (
              <View style={styles.checkIcon}>
                <SvgXml xml={checkIcon} width={24} height={24} />
              </View>
            )}
          </View>
        </View>

        {/* Powtórz hasło */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                passwordError ? styles.inputError : confirmOk ? styles.inputOk : null,
              ]}
              placeholder="Powtórz hasło"
              placeholderTextColor="#9D9D9D"
              secureTextEntry
              autoComplete="off"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setPasswordError("");
                setConfirmOk(t === newPassword && t.length > 0);
              }}
            />
            {confirmOk && !passwordError && (
              <View style={styles.checkIcon}>
                <SvgXml xml={checkIcon} width={24} height={24} />
              </View>
            )}
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleChangePassword}>
          <Text style={styles.buttonPrimaryText}>Zmień hasło</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonSecondaryText}>Wróć do rejestracji</Text>
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
  inputRow: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "400",
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
  inputOk: {
    borderColor: "#EDE1D7",
    backgroundColor: "#EDE1D7",
    color: "#202C39",
  },
  checkIcon: {
    position: "absolute",
    right: 12,
  },
  errorText: {
    color: "#E05744",
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "400",
    lineHeight: 20,
    marginTop: 4,
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
  },
  buttonSecondaryText: {
    color: "#A37D5D",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter",
    lineHeight: 24,
  },
});
