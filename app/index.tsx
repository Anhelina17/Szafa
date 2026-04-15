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
    backgroundColor: "#FFFAF6",
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
    backgroundColor: '#A37D5D33',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#A37D5D33",
    shadowColor: "#A37D5D",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#A37D5D',
    fontSize: 18,
    fontWeight: '600'
  }
});