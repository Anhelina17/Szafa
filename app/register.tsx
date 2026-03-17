import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../supabaseClient";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Uzupełnij wszystkie pola");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // zapisujemy imię w user_metadata
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Po rejestracji → przejście do logowania
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rejestracja</Text>

      <TextInput
        style={styles.input}
        placeholder="Imię"
        placeholderTextColor='#525252'
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor='#525252'
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Hasło"
          placeholderTextColor='#525252'
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.showButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showText}>
            {showPassword ? "Ukryj" : "Pokaż"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Zarejestruj</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
  },
  showButton: {
    marginLeft: 10,
  },
  showText: {
    color: "#AE847E",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#AE847E",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});