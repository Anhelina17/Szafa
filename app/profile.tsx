import type { User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import TabBar from "../components/TabBar";
import { getFolders } from "../services/folders";
import { getImagesByFolder } from "../services/images";
import { supabase } from "../supabaseClient";
import { fs, s } from "../utils/scale";

const pencilIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M9.12854 3.3355L2.79654 9.6675C2.73704 9.727 2.69354 9.8005 2.67004 9.8815L1.52004 13.831C1.46904 14.0055 1.51704 14.1935 1.64504 14.323C1.77304 14.452 1.96054 14.5015 2.13554 14.452L6.11404 13.331C6.19654 13.3075 6.27154 13.2635 6.33204 13.203L12.664 6.871L9.12854 3.3355ZM9.83554 2.6285L13.371 6.164L14.2675 5.268C14.7365 4.799 15 4.163 15 3.5C15 2.837 14.7365 2.201 14.2675 1.732C13.7985 1.2635 13.163 1 12.5 1C11.8365 1 11.201 1.2635 10.732 1.732L9.83554 2.6285Z" fill="#A37D5D"/>
</svg>`;

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [folderCount, setFolderCount] = useState(0);
  const [clothesCount, setClothesCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setDisplayName(data.user.user_metadata?.name ?? "");

      try {
        const folders = await getFolders();
        setFolderCount(folders?.length ?? 0);

        let total = 0;
        for (const folder of folders ?? []) {
          const imgs = await getImagesByFolder(folder.id);
          total += imgs?.length ?? 0;
        }
        setClothesCount(total);

        const { count } = await supabase
          .from("outfits")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id);
        setOutfitCount(count ?? 0);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getInitials = () => {
    const name = displayName.trim();
    if (name) {
      const parts = name.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return (user?.email?.[0] ?? "?").toUpperCase();
  };

  const handleSaveName = async () => {
    if (!user) return;
    try {
      await supabase.auth.updateUser({ data: { name: displayName.trim() } });
      setIsEditingName(false);
    } catch (e) {
      Alert.alert("Błąd", "Nie udało się zapisać imienia");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A37D5D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twój profil</Text>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>

        <View style={{ height: s(20) }} />

        <TouchableOpacity
          style={styles.nameField}
          onPress={() => setIsEditingName(true)}
          activeOpacity={0.8}
        >
          {isEditingName ? (
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
              autoFocus
              placeholder="Wpisz imię i nazwisko..."
              placeholderTextColor="#9D9D9D"
              returnKeyType="done"
            />
          ) : (
            <Text style={[styles.nameText, !displayName && styles.namePlaceholder]}>
              {displayName || "Wpisz imię i nazwisko..."}
            </Text>
          )}
          <SvgXml xml={pencilIcon} width={s(16)} height={s(16)} />
        </TouchableOpacity>

        <View style={{ height: s(8) }} />

        <View style={styles.emailField}>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        <View style={{ height: s(24) }} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{folderCount}</Text>
            <Text style={styles.statLabel}>Foldery</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clothesCount}</Text>
            <Text style={styles.statLabel}>Ubrania</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{outfitCount}</Text>
            <Text style={styles.statLabel}>Stylizacje</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Wyloguj się</Text>
      </TouchableOpacity>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFAF6",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFAF6",
  },
  title: {
    fontSize: fs(24),
    fontWeight: "700",
    color: "#202C39",
    fontFamily: "Inter",
    lineHeight: fs(32),
    textAlign: "center",
    marginBottom: s(24),
    paddingTop: s(60),
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: s(20),
  },
  avatar: {
    width: s(80),
    height: s(80),
    borderRadius: s(40),
    backgroundColor: "#EDE1D7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: fs(24),
    fontWeight: "700",
    color: "#A37D5D",
    fontFamily: "Inter",
    lineHeight: fs(32),
    textAlign: "center",
  },
  nameField: {
    width: s(305),
    height: s(48),
    paddingHorizontal: s(20),
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#A37D5D",
    backgroundColor: "#FFFAF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameText: {
    fontSize: fs(16),
    fontWeight: "400",
    color: "#A37D5D",
    fontFamily: "Inter",
    flex: 1,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  namePlaceholder: {
    color: "#9D9D9D",
  },
  nameInput: {
    fontSize: fs(16),
    fontWeight: "400",
    color: "#A37D5D",
    fontFamily: "Inter",
    flex: 1,
    padding: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  emailField: {
    width: s(305),
    paddingVertical: s(12),
    paddingHorizontal: s(20),
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#A37D5D",
    backgroundColor: "#FFFAF6",
  },
  emailText: {
    fontSize: fs(16),
    fontWeight: "400",
    color: "#A37D5D",
    fontFamily: "Inter",
    lineHeight: fs(24),
  },
  statsRow: {
    flexDirection: "row",
    gap: s(8),
  },
  statCard: {
    width: s(112),
    height: s(112),
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#EDE1D7",
    backgroundColor: "#EDE1D7",
    justifyContent: "center",
    alignItems: "center",
    gap: s(8),
  },
  statNumber: {
    fontSize: fs(32),
    fontWeight: "700",
    color: "#A37D5D",
    fontFamily: "Inter",
    lineHeight: fs(32),
    textAlign: "center",
  },
  statLabel: {
    fontSize: fs(16),
    fontWeight: "400",
    color: "#A37D5D",
    fontFamily: "Inter",
    lineHeight: fs(24),
    textAlign: "center",
  },
  logoutButton: {
    width: s(305),
    height: s(48),
    borderRadius: s(30),
    borderWidth: 2,
    borderColor: "#E05744",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: s(116),
  },
  logoutText: {
    fontSize: fs(16),
    fontWeight: "400",
    color: "#E05744",
    fontFamily: "Inter",
    lineHeight: fs(24),
  },
});
