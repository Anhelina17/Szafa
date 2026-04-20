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
      placeholderTextColor='#9D9D9D' 
      onChangeText={setEmail} />
      
      <TextInput 
      style={styles.input} 
      placeholder="Hasło" 
      placeholderTextColor='#9D9D9D' 
      secureTextEntry 
      onChangeText={setPassword} />

      <TouchableOpacity style={styles.buttonCont} onPress={handleLogin}>
        <Text style={styles.buttonContText}>Kontynuuj</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonBack} onPress={() => {
          router.push("/register");
        }}>
        <Text style={styles.buttonBackText}>Wróć do rejestracji</Text>
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
  buttonContText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: "Inter"
  },
  buttonBack: {
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
  buttonBackText: {
    color: '#A37D5D',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: "Inter"
  }
});