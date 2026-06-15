// ============================================================
// SZAFA — Kompletny zestaw testów (v2)
// Uruchomienie: npx jest --watchAll=false
// ============================================================

// ─── MOCKI ───────────────────────────────────────────────────────────────────

// ─── IMPORTY ──────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeBackground } from "../services/backgroundRemoval";
import {
    FOLDERS_CACHE_KEY,
    FOLDER_IMAGES_CACHE_KEY,
    loadFromCache,
    saveToCache,
} from "../services/cache";
import {
    createFolder,
    deleteFolder,
    getFolders,
    renameFolder,
} from "../services/folders";
import {
    addImageToFolders,
    deleteImage,
    getFavoriteImages,
    getImagesByFolder,
    saveImage,
    toggleFavorite,
} from "../services/images";
import { deleteOutfit, getOutfits } from "../services/outfits";
import { supabase } from "../supabaseClient";
import { fs, s } from "../utils/scale";

jest.mock("../supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn(),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native", () => ({
  Dimensions: { get: () => ({ width: 393 }) },
  PixelRatio: { roundToNearestPixel: (n: number) => Math.round(n) },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;
global.FileReader = class {
  onload: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  result: string = "data:image/png;base64,abc123";
  readAsDataURL() {
    setTimeout(() => this.onload && this.onload({}), 0);
  }
} as any;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const MOCK_USER = { id: "user-123", email: "test@szafa.pl" };

// ─── TESTY ────────────────────────────────────────────────────────────────────
// 1. Cache Service — zapis, odczyt, klucze
describe("Cache Service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("saveToCache serializuje dane do JSON i zapisuje w AsyncStorage", async () => {
    const payload = { id: "abc", name: "Kurtka zimowa" };

    await saveToCache("test_key", payload);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "test_key",
      JSON.stringify(payload)
    );
  });

  test("loadFromCache zwraca sparsowany obiekt gdy klucz istnieje", async () => {
    const payload = [{ id: "1", name: "Folder A" }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(payload));

    const result = await loadFromCache<typeof payload>("test_key");

    expect(result).toEqual(payload);
  });

  test("loadFromCache zwraca null gdy klucz nie istnieje (zimny start)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await loadFromCache("nieistniejacy_klucz");

    expect(result).toBeNull();
  });

  
  test("loadFromCache zwraca null gdy AsyncStorage rzuci wyjątek", async () => {
  (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
    new Error("Storage error")
  );

  const result = await loadFromCache("key");

  expect(result).toBeNull();
});

test("saveToCache nie rzuca wyjątku gdy AsyncStorage.setItem zawiedzie", async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
    new Error("Storage error")
  );

  await expect(
    saveToCache("key", { test: true })
  ).resolves.toBeUndefined();
});

test("FOLDERS_CACHE_KEY generuje unikalne klucze per użytkownik", () => {
    const key1 = FOLDERS_CACHE_KEY("user-1");
    const key2 = FOLDERS_CACHE_KEY("user-2");

    expect(key1).not.toBe(key2);
    expect(key1).toContain("user-1");
    expect(key2).toContain("user-2");
  });

  test("FOLDER_IMAGES_CACHE_KEY zawiera ID folderu", () => {
    const key = FOLDER_IMAGES_CACHE_KEY("folder-xyz");

    expect(key).toContain("folder-xyz");
  });

});

// 2. Scale Utils — przeliczanie rozmiarów i fontów
describe("Scale Utils", () => {
  test("s() nie skaluje przy szerokości bazowej 393px (scale = 1)", () => {
    expect(s(16)).toBe(16);
    expect(s(0)).toBe(0);
    expect(s(100)).toBe(100);
  });

  test("fs() zwraca dodatnią liczbę i nie zwraca NaN", () => {
    const result = fs(14);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0);
    expect(Number.isNaN(result)).toBe(false);
  });
});

// 3. Folders Service — CRUD folderów
describe("Folders Service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getFolders rzuca błąd gdy użytkownik nie jest zalogowany", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null } });

    await expect(getFolders()).rejects.toThrow("Brak użytkownika");
  });

  test("createFolder trim()-uje nazwę przed zapisem do bazy", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: MOCK_USER } });

    const insertMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await createFolder("  Bluzy  ");

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Bluzy" })
    );
  });

  test("createFolder rzuca błąd gdy insert zwróci error", async () => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
    data: { user: MOCK_USER },
  });

  const dbError = new Error("Insert failed");

  (supabase.from as jest.Mock).mockReturnValue({
    insert: jest.fn().mockResolvedValue({
      error: dbError,
    }),
  });

  await expect(createFolder("Bluzy")).rejects.toThrow("Insert failed");
});

  test("renameFolder wysyła nową nazwę do właściwego wiersza", async () => {
    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ update: updateMock, eq: eqMock });
    updateMock.mockReturnValue({ eq: eqMock });

    await renameFolder("folder-99", "Płaszcze");

    expect(updateMock).toHaveBeenCalledWith({ name: "Płaszcze" });
    expect(eqMock).toHaveBeenCalledWith("id", "folder-99");
  });

  test("renameFolder rzuca błąd gdy update zwróci error", async () => {
  const dbError = new Error("Update failed");

  const eqMock = jest.fn().mockResolvedValue({
    error: dbError,
  });

  const updateMock = jest.fn(() => ({
    eq: eqMock,
  }));

  (supabase.from as jest.Mock).mockReturnValue({
    update: updateMock,
  });

  await expect(
    renameFolder("folder-1", "Nowa nazwa")
  ).rejects.toThrow("Update failed");
});

  test("deleteFolder usuwa najpierw powiązania (image_folders), potem folder", async () => {
    const callOrder: string[] = [];

    const makeDelete = (table: string) => {
      const eqFn = jest.fn().mockResolvedValue({ error: null });
      const deleteFn = jest.fn(() => {
        callOrder.push(table);
        return { eq: eqFn };
      });
      return { delete: deleteFn, eq: eqFn };
    };

    (supabase.from as jest.Mock).mockImplementation((table: string) =>
      makeDelete(table)
    );

    await deleteFolder("folder-1");

    expect(callOrder[0]).toBe("image_folders");
    expect(callOrder[1]).toBe("folders");
  });
  
});

// 4. Images Service — upload, ulubione, usuwanie
describe("Images Service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("addImageToFolders buduje poprawne relacje {image_id, folder_id}", async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ insert: insertMock });

    await addImageToFolders("img-1", ["folder-a", "folder-b"]);

    expect(insertMock).toHaveBeenCalledWith([
      { image_id: "img-1", folder_id: "folder-a" },
      { image_id: "img-1", folder_id: "folder-b" },
    ]);
  });

  test("addImageToFolders rzuca błąd gdy insert relacji się nie powiedzie", async () => {
  const dbError = new Error("Relation error");

  (supabase.from as jest.Mock).mockReturnValue({
    insert: jest.fn().mockResolvedValue({
      error: dbError,
    }),
  });

  await expect(
    addImageToFolders("img-1", ["folder-1"])
  ).rejects.toThrow("Relation error");
});

  test("toggleFavorite odwraca is_favorite z false na true", async () => {
    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ update: updateMock, eq: eqMock });
    updateMock.mockReturnValue({ eq: eqMock });

    await toggleFavorite("img-99", false);

    expect(updateMock).toHaveBeenCalledWith({ is_favorite: true });
    expect(eqMock).toHaveBeenCalledWith("id", "img-99");
  });

  test("toggleFavorite odwraca is_favorite z true na false", async () => {
    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue({ update: updateMock, eq: eqMock });
    updateMock.mockReturnValue({ eq: eqMock });

    await toggleFavorite("img-99", true);

    expect(updateMock).toHaveBeenCalledWith({ is_favorite: false });
  });

  test("toggleFavorite rzuca błąd gdy update się nie powiedzie", async () => {
  const dbError = new Error("Update failed");

  const eqMock = jest.fn().mockResolvedValue({
    error: dbError,
  });

  const updateMock = jest.fn(() => ({
    eq: eqMock,
  }));

  (supabase.from as jest.Mock).mockReturnValue({
    update: updateMock,
  });

  await expect(
    toggleFavorite("img-1", false)
  ).rejects.toThrow("Update failed");
});

  test("getFavoriteImages rzuca błąd gdy brak sesji", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null } });

    await expect(getFavoriteImages()).rejects.toThrow("Brak użytkownika");
  });

  test("getFavoriteImages zwraca tylko ulubione zdjęcia", async () => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
    data: { user: MOCK_USER },
  });

  const eqSecond = jest.fn().mockResolvedValue({
    data: [{ id: "1", image_url: "url", is_favorite: true }],
    error: null,
  });

  const eqFirst = jest.fn(() => ({
    eq: eqSecond,
  }));

  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: eqFirst,
  });

  const result = await getFavoriteImages();

  expect(result).toHaveLength(1);
  expect(result[0].is_favorite).toBe(true);
});

  test("getImagesByFolder sortuje wyniki od najnowszych do najstarszych", async () => {
    const older = { id: "1", image_url: "url1", is_favorite: false, created_at: "2024-01-01T00:00:00Z" };
    const newer = { id: "2", image_url: "url2", is_favorite: false, created_at: "2024-06-01T00:00:00Z" };

    const eqMock = jest.fn().mockResolvedValue({
      data: [{ images: older }, { images: newer }],
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: eqMock,
    });

    const result = await getImagesByFolder("folder-1");

    expect(result[0].id).toBe("2"); 
    expect(result[1].id).toBe("1");
  });

  test("deleteImage usuwa: powiązania → rekord DB → plik Storage (kolejność)", async () => {
    const callOrder: string[] = [];

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      const eqFn = jest.fn().mockResolvedValue({ error: null });
      return {
        delete: jest.fn(() => {
          callOrder.push(table);
          return { eq: eqFn };
        }),
        eq: eqFn,
      };
    });

    const removeMock = jest.fn().mockResolvedValue({ error: null });
    (supabase.storage.from as jest.Mock).mockReturnValue({ remove: removeMock });

    await deleteImage("img-42", "https://cdn.example.com/item-42.png");

    expect(callOrder[0]).toBe("image_folders");
    expect(callOrder[1]).toBe("images");
    expect(removeMock).toHaveBeenCalledWith(["item-42.png"]);
  });

  test("saveImage rzuca błąd gdy użytkownik nie jest zalogowany", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null } });

    await expect(saveImage("file:///tmp/photo.jpg")).rejects.toThrow("Brak użytkownika");
  });

  


});

// 5. Outfits Service — pobieranie i usuwanie stylizacji
describe("Outfits Service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getOutfits rzuca błąd gdy użytkownik nie jest zalogowany", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null } });

    await expect(getOutfits()).rejects.toThrow("Brak użytkownika");
  });

  test("getOutfits zwraca pustą tablicę gdy brak stylizacji w bazie", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: MOCK_USER } });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getOutfits();

    expect(result).toEqual([]);
  });

  test("getOutfits buduje stylizację wraz z obrazami", async () => {
  (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
    data: { user: MOCK_USER },
  });

  (supabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "outfits") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            {
              id: "outfit-1",
              created_at: "2025-01-01",
            },
          ],
          error: null,
        }),
      };
    }

    if (table === "outfit_items") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              image_id: "img-1",
              position: "top",
            },
          ],
          error: null,
        }),
      };
    }

    if (table === "images") {
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            {
              id: "img-1",
              image_url: "https://image.jpg",
            },
          ],
          error: null,
        }),
      };
    }
  });

  const result = await getOutfits();

  expect(result).toHaveLength(1);
  expect(result[0].images).toHaveLength(1);
  expect(result[0].images[0].position).toBe("top");
});

  test("deleteOutfit wywołuje delete na tabeli outfits z właściwym ID", async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn(() => ({ eq: eqMock }));
    (supabase.from as jest.Mock).mockReturnValue({ delete: deleteMock });

    await deleteOutfit("outfit-42");

    expect((supabase.from as jest.Mock)).toHaveBeenCalledWith("outfits");
    expect(eqMock).toHaveBeenCalledWith("id", "outfit-42");
  });
  
test("deleteOutfit rzuca błąd gdy usuwanie się nie powiedzie", async () => {
  const dbError = new Error("Delete failed");

  const eqMock = jest.fn().mockResolvedValue({
    error: dbError,
  });

  const deleteMock = jest.fn(() => ({
    eq: eqMock,
  }));

  (supabase.from as jest.Mock).mockReturnValue({
    delete: deleteMock,
  });

  await expect(
    deleteOutfit("outfit-1")
  ).rejects.toThrow("Delete failed");
});

});

// 6. Background Removal Service — integracja z remove.bg
describe("Background Removal Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY = "test-api-key-123";
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY;
  });

  test("removeBackground rzuca błąd gdy brak klucza API w .env", async () => {
    delete process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY;

    await expect(removeBackground("file:///photo.jpg")).rejects.toThrow(
      "Brak API key w .env"
    );
  });

  test("removeBackground wysyła żądanie POST do remove.bg z kluczem API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(new Blob(["fake-png"], { type: "image/png" })),
    });

    await removeBackground("file:///photo.jpg");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.remove.bg/v1.0/removebg",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-Api-Key": "test-api-key-123" }),
      })
    );
  });

  test("removeBackground rzuca błąd gdy API zwraca status błędu (402)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 402,
      text: () => Promise.resolve("Insufficient credits"),
    });

    await expect(removeBackground("file:///photo.jpg")).rejects.toThrow(
      "Błąd remove.bg"
    );
  });

  test("removeBackground zwraca string z data URI po sukcesie", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(new Blob(["fake-png"], { type: "image/png" })),
    });

    const result = await removeBackground("file:///photo.jpg");

    expect(typeof result).toBe("string");
    expect(result).toMatch(/^data:/);
  });
  
});