import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToCache = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Błąd zapisu cache:", e);
  }
};

export const loadFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Błąd odczytu cache:", e);
    return null;
  }
};

export const FOLDERS_CACHE_KEY = (userId: string) => `cache_folders_${userId}`;
export const FOLDER_IMAGES_CACHE_KEY = (folderId: string) => `cache_images_${folderId}`;