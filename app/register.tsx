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

export default function RegisterScreen() {
  const router = useRouter() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailOk, setEmailOk] = useState(false);
  const [passwordOk, setPasswordOk] = useState(false);
  const [confirmOk, setConfirmOk] = useState(false);
  // флаги — пользователь сам печатал (не автозаполнение iOS)
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const validateEmail = (val: string) => {
    setEmail(val);
    setEmailError("");
    const ok = val.includes("@") && val.includes(".") && val.length > 5;
    setEmailOk(ok);
  };

  const validatePassword = (val: string, prev: string = password) => {
    // touched только если пользователь печатал сам (изменение на 1 символ)
    const isManualInput = Math.abs(val.length - prev.length) === 1;
    if (isManualInput) setPasswordTouched(true);
    setPassword(val);
    setPasswordError("");
    const ok = val.length >= 6;
    setPasswordOk(ok);
    if (confirmPassword) {
      setConfirmOk(val === confirmPassword && ok);
    }
  };

  const validateConfirm = (val: string, prev: string = confirmPassword) => {
    const isManualInput = Math.abs(val.length - prev.length) === 1;
    if (isManualInput) setConfirmTouched(true);
    setConfirmPassword(val);
    setPasswordError("");
    if (val.length === 0) {
      setConfirmOk(false);
      return;
    }
    setConfirmOk(val === password && passwordOk);
  };

  const handleRegister = async () => {
    let valid = true;
    setPasswordError("");

    const emailValid = email.includes("@") && email.includes(".") && email.length > 5;
    if (!email.trim()) {
      setEmailError("Wpisz adres e-mail");
      setEmailOk(false);
      valid = false;
    } else if (!emailValid) {
      setEmailError("Wpisz poprawny adres e-mail");
      setEmailOk(false);
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim() || password.length < 6) {
      setPasswordError("Hasło musi mieć min. 6 znaków");
      setPasswordOk(false);
      setConfirmOk(false);
      valid = false;
    } else if (password !== confirmPassword) {
      setPasswordError("Hasła nie pasują do siebie");
      setPasswordOk(false);
      setConfirmOk(false);
      valid = false;
    }

    if (!valid) return;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes("already registered")) {
        setEmailError("Ten e-mail jest już zarejestrowany");
      } else {
        setEmailError(error.message);
      }
      setEmailOk(false);
      return;
    }
    router.replace("/login");
  };

  const passwordHasError = !!passwordError;
  // галочка только если пользователь сам печатал
  const showPasswordCheck = passwordOk && !passwordHasError && passwordTouched;
  const showConfirmCheck = confirmOk && !passwordHasError && confirmTouched;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Rejestracja</Text>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                emailError ? styles.inputError : emailOk ? styles.inputOk : null,
              ]}
              placeholder="Email"
              placeholderTextColor={emailError ? "#E05744" : "#9D9D9D"}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={validateEmail}
            />
            {emailOk && !emailError && (
              <View style={styles.checkIcon}>
                <SvgXml xml={checkIcon} width={24} height={24} />
              </View>
            )}
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Hasło */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                passwordHasError ? styles.inputError : (showPasswordCheck ? styles.inputOk : null),
              ]}
              placeholder="Hasło"
              placeholderTextColor={passwordHasError ? "#E05744" : "#9D9D9D"}
              secureTextEntry
              autoComplete="off"
              autoCorrect={false}
              textContentType="newPassword"
              value={password}
              onChangeText={(val) => validatePassword(val, password)}
            />
            {showPasswordCheck && (
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
                passwordHasError ? styles.inputError : (showConfirmCheck ? styles.inputOk : null),
              ]}
              placeholder="Powtórz hasło"
              placeholderTextColor={passwordHasError ? "#E05744" : "#9D9D9D"}
              secureTextEntry
              autoComplete="off"
              autoCorrect={false}
              textContentType="newPassword"
              value={confirmPassword}
              onChangeText={(val) => validateConfirm(val, confirmPassword)}
            />
            {showConfirmCheck && (
              <View style={styles.checkIcon}>
                <SvgXml xml={checkIcon} width={24} height={24} />
              </View>
            )}
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* Kontynuuj */}
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister}>
          <Text style={styles.buttonPrimaryText}>Kontynuuj</Text>
        </TouchableOpacity>

        {/* Masz już konto */}
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonSecondaryText}>Masz już konto? Zaloguj się</Text>
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
    marginTop: 4,
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
