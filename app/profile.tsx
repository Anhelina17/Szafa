import type { User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../supabaseClient";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setUser(data.user);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Ładowanie...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twój profil</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Imię:</Text>
        <Text style={styles.value}>{user.user_metadata?.name}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Wyloguj</Text>
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
  loading: {
    fontSize: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    color: "#202C39",
    marginBottom: 5,
  },
  infoBox: {
    width: "80%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#A37D5D",
  },
  value: {
    fontSize: 20,
    fontWeight: "500",
    color: "#202C39",
  },
  logoutButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#2c3e50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
});