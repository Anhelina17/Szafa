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

      <TouchableOpacity style={styles.buttonCont} onPress={handleRegister}>
        <Text style={styles.buttonContText}>Kontynuuj</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonLog} onPress={() => {
          router.push("/login");
        }}>
        <Text style={styles.buttonLogText}>Masz już konto? Zaloguj się</Text>
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
    backgroundColor: "#FFFAF6",
  },
  title: {
    width: "100%",
    fontSize: 24,
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    fontFamily: "Inter",
    width: '70%',
    paddingVertical: 15,
    borderRadius: 30,
    marginVertical: 10,
    padding: 16,
    marginBottom: 10,
    color: '#000',
    backgroundColor: '#EDE1D7',
    borderWidth: 1,
    borderColor: "#EDE1D7",
    shadowColor: "#EDE1D7",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordContainer: {
    width: "70%",
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
  buttonContText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400'
  },
  buttonCont: {
    width: '70%',
    backgroundColor: '#A37D5D',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#A37D5D",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonLog: {
    width: '70%',
    backgroundColor: '##FFFAF6',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: "#A37D5D",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonLogText: {
    color: '#A37D5D',
    fontSize: 18,
    fontWeight: '400'
  }
});