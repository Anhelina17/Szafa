import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StartScreen() {
  const router = useRouter() as any;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Otwórz swoją Szafę</Text>
      <Text style={styles.subtitle}>Dodawaj ubrania i twórz stylizacje</Text>

      <TouchableOpacity style={styles.buttonLog} onPress={() => router.push("/login")}>
        <Text style={styles.buttonLogText}>Zaloguj się</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonReg} onPress={() => router.push("/register")}>
        <Text style={styles.buttonRegText}>Zarejestruj się</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202C39',
    fontFamily: "Inter",
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#202C39',
    fontFamily: "Inter",
    marginBottom: 40
  },
  buttonLog: {
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
  buttonLogText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: "Inter",
    fontWeight: '400'
  },
  buttonReg: {
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
  buttonRegText: {
    color: '#A37D5D',
    fontSize: 18,
    fontFamily: "Inter",
    fontWeight: '400'
  }
});