import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StartScreen() {
  const router = useRouter() as any;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Szafa</Text>
      <Text style={styles.subtitle}>Twoja wirtualna szafa</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Logowanie</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/register")}>
        <Text style={styles.buttonText}>Rejestracja</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
    paddingHorizontal: 20
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#202C39',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#202C39',
    marginBottom: 40
  },
  button: {
    width: '70%',
    backgroundColor: '#AE847E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600'
  }
});