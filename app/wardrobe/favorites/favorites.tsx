import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FavoritesScreen() {
  const [search, setSearch] = useState("");
  const [showTags, setShowTags] = useState(false);

  const tags: string[] = [];

  const filteredTags = tags.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  const noTags = tags.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ulubione</Text>

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowTags(true)}
        style={styles.searchContainer}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj po tagach..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
          onFocus={() => setShowTags(true)}
        />
      </TouchableOpacity>

{showTags && (
        <View style={styles.tagsBox}>
          {noTags ? (
            <Text style={styles.noTags}>
              *Nie utworzono żadnych tagów*
            </Text>
          ) : filteredTags.length === 0 ? (
            <Text style={styles.noTags}>Brak pasujących tagów</Text>
          ) : (
            <FlatList
              data={filteredTags}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.tagItem}>
                  <Text style={styles.tagText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

{!showTags && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak ulubionych elementów</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#202C39",
    marginBottom: 30,
  },
  searchContainer: {
    width: "85%",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    fontSize: 16,
    color: "#000",
  },
tagsBox: {
    width: "85%",
    maxHeight: 250,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  tagItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tagText: {
    fontSize: 18,
    color: "#202C39",
  },
  noTags: {
    fontSize: 16,
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyBox: {
    marginTop: 40,
  },
emptyText: {
    fontSize: 18,
    color: "#777",
  },
});
