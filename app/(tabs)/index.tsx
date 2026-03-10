import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>eSzafa</Text>
      <Text style={styles.subtitle}>Twoja wirtualna szafa</Text>
 
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Dodaj ubrania</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Zobacz szafę</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Stwórz stylizację</Text>
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Zobacz stylizacje</Text>
        </TouchableOpacity>
      </View>
 
      <TouchableOpacity style={styles.profileButton}>
        <Text style={styles.profileText}>Profil</Text>
      </TouchableOpacity>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#FFFFF",
    paddingHorizontal: 20
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: "Helvetica",
    color: '#202C39',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Helvetica",
    color: '#202C39',
    marginBottom: 40
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15
  },
  button: {
    width: '80%',
    backgroundColor: '#AE847E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600'
  },
  profileButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30
  },
  profileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
 