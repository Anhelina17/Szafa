import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../supabaseClient";

export default function LoginScreen() {
  const router = useRouter() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      router.replace("home");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logowanie</Text>

      <TextInput 
      style={styles.input} 
      placeholder="Email" 
      placeholderTextColor='#525252' 
      onChangeText={setEmail} />
      
      <TextInput 
      style={styles.input} 
      placeholder="Hasło" 
      placeholderTextColor='#525252' 
      secureTextEntry 
      onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Zaloguj</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#FFFAF6",
  },
  title: {
    width: "100%",
    fontSize: 28,
    fontWeight: "500",
    color: "#202C39",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: '#000',
    backgroundColor: '#A37D5D22',
    borderWidth: 1,
    borderColor: "#A37D5D33",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#A37D5D33',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A37D5D33",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: "#A37D5D",
  }
});