# 👗 Szafa — Wirtualna Szafa

Aplikacja mobilna zbudowana w **React Native + Expo**, która pozwala użytkownikowi zarządzać swoją garderobą. Użytkownik może fotografować ubrania, automatycznie usuwać tło ze zdjęć, organizować ubrania w foldery, oznaczać ulubione oraz tworzyć stylizacje z pomocą AI.

<img width="250" alt="IMAGE 2026-06-15 14:23:45" src="https://github.com/user-attachments/assets/683130a0-4f34-40af-9569-eaa90600bd01" />

---

## 📋 Spis treści

- [Wymagania wstępne](#wymagania-wstępne)
- [Uruchomienie projektu (Expo Go)](#uruchomienie-projektu-expo-go)
- [Budowanie aplikacji (EAS Build)](#budowanie-aplikacji-eas-build)
- [Zmienne środowiskowe](#zmienne-środowiskowe)
- [Technologie i zależności](#technologie-i-zależności)
- [Architektura aplikacji](#architektura-aplikacji)
- [Funkcjonalności](#funkcjonalności)
- [Natywne funkcje urządzenia](#natywne-funkcje-urządzenia)
- [Zarządzanie stanem](#zarządzanie-stanem)
- [Nawigacja](#nawigacja)
- [Backend i baza danych](#backend-i-baza-danych)
- [Autoryzacja](#autoryzacja)
- [Integracja z zewnętrznym API](#integracja-z-zewnętrznym-api)
- [Tryb offline](#tryb-offline)
- [Bezpieczeństwo](#bezpieczeństwo)
- [Wydajność](#wydajność)
- [Styl i UI/UX](#styl-i-uiux)
- [Jakość kodu](#jakość-kodu)

---

## Wymagania wstępne

- Node.js >= 18 — pobierz z [nodejs.org](https://nodejs.org)
- npm >= 9 (instaluje się razem z Node.js)
- Konto w [Supabase](https://supabase.com) — bezpłatne
- Klucz API [remove.bg](https://www.remove.bg/api) — bezpłatny plan (50 zdjęć/miesiąc)
- Klucz API [OpenAI](https://platform.openai.com) — wymaga doładowania konta minimum **$5**
- Aplikacja **Expo Go** na telefonie — pobierz z App Store lub Google Play

---

## Uruchomienie projektu (Expo Go)

> Expo Go pozwala uruchomić aplikację na telefonie bez instalowania — wystarczy zeskanować kod QR. 

### Krok 1 — Sklonuj repozytorium

W twrminalu wpisz:

```bash
git clone <url-repozytorium>
cd Szafa
```

### Krok 2 — Zainstaluj zależności

```bash
npm install
```

### Krok 3 — Utwórz plik z kluczami API

Utwórz plik `.env` w głównym folderze projektu (tam gdzie jest `package.json`) i wklej do niego:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<twój-projekt>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=<twój-anon-key>
EXPO_PUBLIC_REMOVE_BG_API_KEY=<twój-klucz-remove-bg>
EXPO_PUBLIC_OPENAI_API_KEY=<twój-klucz-openai>
```

Gdzie znaleźć klucze:
- **Supabase** — zaloguj się na [supabase.com](https://supabase.com) → Twój projekt → Settings → API
- **remove.bg** — zaloguj się na [remove.bg](https://www.remove.bg/api) → API Keys
- **OpenAI** — zaloguj się na [platform.openai.com](https://platform.openai.com) → API Keys (wymagane doładowanie konta minimum $5)

> ⚠️ Plik `.env` jest dodany do `.gitignore` — nigdy nie umieszczaj kluczy API bezpośrednio w kodzie.

### Krok 4 — Uruchom aplikację

```bash
npx expo start
```
> ⚠️ Telefon i komputer muszą być podłączone do tej samej sieci WiFi.

W terminalu pojawi się kod QR. Otwórz aplikację **Expo Go** na telefonie i zeskanuj kod QR.

<!-- SCREENSHOT: kod QR w terminalu po uruchomieniu npx expo start -->

---

## Budowanie aplikacji (EAS Build)

> EAS Build tworzy plik `.apk` (Android) lub `.ipa` (iOS) który można zainstalować na telefonie jak każdą inną aplikację — bez potrzeby używania Expo Go.

### Krok 1 — Załóż konto na expo.dev

Wejdź na [expo.dev](https://expo.dev) i załóż bezpłatne konto.

### Krok 2 — Zainstaluj EAS CLI

```bash
npm install -g eas-cli
```

### Krok 3 — Zaloguj się

```bash
eas login
```
Wpisz email i hasło od konta expo.dev.

### Krok 4 — Skonfiguruj projekt

```bash
eas build:configure
```
To polecenie automatycznie tworzy plik `eas.json` w projekcie. Gdy zapyta o platformę — wybierz `All`.

### Krok 5 — Zbuduj aplikację

**Android (.apk):**
```bash
eas build --platform android --profile preview
```

**iOS (.ipa):**
```bash
eas build --platform ios --profile preview
```

> ⚠️ Build dla iOS wymaga konta **Apple Developer** ($99/rok). Bez niego build się nie powiedzie.

Budowanie odbywa się w chmurze i zajmuje około 10-15 minut. Po zakończeniu w terminalu pojawi się link do pobrania pliku.

<!-- SCREENSHOT: terminal po zakończeniu budowania z linkiem do pobrania .apk -->

### Krok 6 — Zainstaluj na telefonie

**Android:**
1. Pobierz plik `.apk` na telefon z Androidem
2. Otwórz pobrany plik
3. Android może zapytać o zgodę na instalację z nieznanych źródeł — zatwierdź
4. Aplikacja zainstaluje się jak każda inna

**iOS:**
1. Wymaga konta Apple Developer ($99/rok)
2. Pobierz plik `.ipa` i zainstaluj przez Xcode lub Apple Configurator 2
3. Alternatywnie — uruchom na symulatorze iOS na Macu

---

## Zmienne środowiskowe

Plik `.env` w katalogu głównym projektu:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<twój-projekt>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=<twój-anon-key>
EXPO_PUBLIC_REMOVE_BG_API_KEY=<twój-klucz-remove-bg>
EXPO_PUBLIC_OPENAI_API_KEY=<twój-klucz-openai>
```

> ⚠️ Plik `.env` jest dodany do `.gitignore` — klucze API nigdy nie trafiają do repozytorium.

---

## Technologie i zależności

| Technologia | Wersja | Zastosowanie |
|---|---|---|
| React Native | 0.81.5 | Framework mobilny |
| Expo | ~54.0.33 | Platforma i SDK |
| Expo Router | ~6.0.23 | Nawigacja oparta na plikach |
| TypeScript | ~5.9.2 | Typowanie statyczne |
| Supabase JS | ^2.99.2 | Backend, baza danych, auth |
| expo-camera | ~17.0.10 | Aparat |
| expo-image-picker | ~17.0.10 | Galeria zdjęć |
| expo-image-manipulator | ~14.0.8 | Konwersja formatów zdjęć (HEIC → PNG) |
| react-native-svg | 15.12.1 | Ikony wektorowe SVG |
| react-native-svg-transformer | ^1.5.3 | Import plików SVG |
| @react-native-async-storage/async-storage | 2.2.0 | Cache offline |
| OpenAI API (gpt-4o-mini) | — | Generowanie układu moodboardu |
| remove.bg API | — | Usuwanie tła ze zdjęć |
---

## Architektura aplikacji

Aplikacja stosuje **wzorzec komponentowy** uzupełniony o **Context API** do zarządzania globalnym stanem autoryzacji oraz **serwisy** jako warstwę dostępu do danych.

```
app/                    ← ekrany (Expo Router, file-based routing)
  wardrobe/             ← ekrany szafy i folderów
    favorites/          ← ekran ulubionych
  outfits/              ← ekrany tworzenia i przeglądania stylizacji
components/             ← komponenty wielokrotnego użytku
  TabBar.tsx            ← własny dolny pasek nawigacji
context/
  AuthContext.tsx       ← globalny stan autoryzacji (Context API)
hooks/
  use-backgroundRemoval.ts  ← hook do usuwania tła z obrazu
services/
  folders.ts            ← operacje CRUD na folderach (Supabase)
  images.ts             ← operacje CRUD na zdjęciach (Supabase)
  outfits.ts            ← operacje CRUD na stylizacjach (Supabase)
  cache.ts              ← lokalny cache (AsyncStorage)
  backgroundRemoval.ts  ← wywołanie API remove.bg
utils/
  scale.ts              ← skalowanie wymiarów dla responsywności
constants/
  theme.ts              ← kolory i fonty
types/
  svg.d.ts              ← deklaracje typów dla plików SVG
assets/
  fonts/                ← czcionka
  images/               ← ikony aplikacji
```

**Decyzja architektoniczna:** Context API wybrany do zarządzania sesją użytkownika ze względu na prostotę — stan sesji jest jedynym globalnym stanem współdzielonym w całej aplikacji. Stan lokalny (otwarte modale, ładowanie danych, wybrane elementy) pozostaje w `useState` wewnątrz komponentów, co minimalizuje złożoność i jest zgodne z zasadą minimalnego zakresu stanu.

---

## Funkcjonalności

- **Rejestracja i logowanie** — e-mail + hasło

<img width="250" alt="IMAGE 2026-06-15 14:25:13" src="https://github.com/user-attachments/assets/633b9005-bf45-4f27-921d-42670fc4a144" />

<img width="250" alt="IMAGE 2026-06-15 14:25:08" src="https://github.com/user-attachments/assets/02537e7a-ff71-4a08-98f0-7dba114aaf9c" />


- **Dodawanie ubrań** — zdjęcie aparatem lub wybór z galerii

<img width="250" alt="IMAGE 2026-06-15 14:25:47" src="https://github.com/user-attachments/assets/726fc8a9-c8d3-4800-8f0e-e96f6aa7353c" />


- **Automatyczne usuwanie tła** — integracja z remove.bg API; wynik wyświetlany na podglądzie przed zapisem

<img width="250" alt="IMAGE 2026-06-15 14:26:11" src="https://github.com/user-attachments/assets/63f816e8-4740-4964-8097-cd21474095ed" />


- **Organizacja w foldery** — tworzenie, zmiana nazwy, usuwanie folderów
<img width="250" alt="IMAGE 2026-06-15 14:27:34" src="https://github.com/user-attachments/assets/500eca44-bb11-4f03-8958-29308ab0fcac" />


- **Ulubione** — dedykowany folder na wybrane rzeczy

<img width="250" alt="IMAGE 2026-06-15 14:27:51" src="https://github.com/user-attachments/assets/3ce2e096-97be-42f4-b939-1d5135d185ea" />


- **Tworzenie stylizacji (outfits)** — wybór ubrań z folderów, OpenAI układa je w moodboard (klasyfikuje każdą rzecz jako: góra / środek / dół / akcent), zapis i podgląd
<div align="center">
  <img width="250" alt="IMAGE 2026-06-15 14:48:35" src="https://github.com/user-attachments/assets/ae249fae-19d3-4eb0-8dc2-d831c33fe7e2" />
  <img width="250" alt="IMAGE 2026-06-15 14:37:42" src="https://github.com/user-attachments/assets/12386f69-323b-4605-a5d9-aa07ee31133b" />
  <img width="250" alt="IMAGE 2026-06-15 14:30:14" src="https://github.com/user-attachments/assets/8a51a044-b269-4bed-8a54-c014d88e300c" />
</div>

- **Przeglądanie stylizacji** — folder zapisanych stylizacje, pełnoekranowy podgląd po kliknięciu, usuwanie on Long Press

<img width="250" alt="IMAGE 2026-06-15 14:28:47" src="https://github.com/user-attachments/assets/c7b5be38-5a5d-45eb-b5b2-cf2427218086" />


- **Profil użytkownika** — edycja wyświetlanej nazwy uytkownika, statystyki (liczba folderów, ubrań, stylizacji)

<img width="250" alt="IMAGE 2026-06-15 14:28:59" src="https://github.com/user-attachments/assets/afaecd94-1f97-4b1d-8d58-5ce6d74fd313" />


- **Tryb offline** — przeglądanie folderów i zdjęć z cache gdy brak połączenia
<img width="250" alt="IMAGE 2026-06-15 14:29:52" src="https://github.com/user-attachments/assets/4e9ab155-4507-48be-b31a-970038311889" />
<img width="250" alt="IMAGE 2026-06-15 14:29:43" src="https://github.com/user-attachments/assets/0027278e-0394-40e0-aedd-db9309c17b66" />

---

## Natywne funkcje urządzenia

### 1. Kamera (`expo-camera`)

Ekran aparatu żąda uprawnienia do kamery przez `Camera.requestCameraPermissionsAsync()`. Jeśli użytkownik odmówi — aplikacja pokazuje komunikat z prośbą o nadanie uprawnień w ustawieniach telefonu. Zdjęcie trafia do podglądu po czym uytkownik może za pomocą AI usunąć tło i zapisać zdjęcie.

### 2. Galeria zdjęć (`expo-image-picker`)

Dostępna z ekranu aparatu (przycisk galerii) oraz z dedykowanego ekranu `galleryPicker`. Aplikacja używa `ImagePicker.launchImageLibraryAsync()`. Odmowa uprawnień jest obsługiwana przez sprawdzenie `result.canceled` — użytkownik widzi odpowiedni komunikat.

---

## Zarządzanie stanem

| Stan | Mechanizm | Uzasadnienie |
|---|---|---|
| Sesja użytkownika | `AuthContext` (Context API) | Dane globalne potrzebne w całej aplikacji |
| Lista folderów / zdjęć / stylizacji | `useState` w ekranach | Dane lokalne dla danego ekranu |
| Stan ładowania / błędu | `useState` w ekranach i hookach | Minimalizacja złożoności — stan lokalny |
| Cache offline | `AsyncStorage` (serwis `cache.ts`) | Persystencja między sesjami |

**Podstawy wyboru:** Tylko sesja użytkownika jest stanem globalnym — wszystko inne (otwarte modale, wybrane zdjęcia, stan ładowania) to stan lokalny w `useState`. Redux byłby nadmiarowy dla tej aplikacji — Context API w zupełności wystarczy dla jednego współdzielonego stanu.


Stany ładowania (`ActivityIndicator`) i błędu (własne modale w stylu aplikacji) są obsługiwane dla wszystkich kluczowych operacji asynchronicznych.

---

## Nawigacja

Aplikacja używa **Expo Router** (nawigacja oparta na strukturze plików).

Zaimplementowane typy nawigacji:
- **Stack** — główny stos ekranów (`app/_layout.tsx`) — przechodzenie do przodu i cofanie się między ekranami
- **Tabs** — własny dolny pasek zakładek (`components/TabBar.tsx`) - nawiguje do 5-ciu ekranów (ekran główny, 
ekran tworzenia stylizacji, 8Aekran kamery, ekran przegląd gotowych stylizacji oraz profil uytkownika)
- **Modal** — pełnoekranowe podglądy stylizacji (React Native `Modal`)

Parametry przekazywane między ekranami przez `useLocalSearchParams` (np. `folderId`, `folderName`, `selectedImages`, `fromCreation`).

---

## Backend i baza danych

Aplikacja używa **Supabase** jako backendu:

- **Supabase Auth** — rejestracja, logowanie, zarządzanie sesją
- **Supabase Storage** — przechowywanie zdjęć ubrań
- **Supabase Postgres** — dane w chmurze:
  - `folders` — foldery użytkownika
  - `images` — zdjęcia z URL do Supabase Storage
  - `image_folders` — relacja wiele-do-wielu (ubranie może być w wielu folderach)
  - `outfits` — stylizacje
  - `outfit_items` — elementy stylizacji z pozycją (top/middle/bottom/accent)

Dane użytkownika są trwałe — po odinstalowaniu i ponownym zainstalowaniu aplikacji wszystko wraca po zalogowaniu.

Wszystkie operacje na danych są zabezpieczone przez **Row Level Security (RLS)** w Supabase — każdy użytkownik widzi tylko swoje dane.

Klucze Supabase są przechowywane w zmiennych środowiskowych  (`EXPO_PUBLIC_*`), nie w kodzie.
---

## Autoryzacja

- Rejestracja i logowanie e-mailem (`supabase.auth.signUp` / `signInWithPassword`)
- **Auto-login po restarcie** — `AuthContext` używa `supabase.auth.getSession()` przy starcie aplikacji, co działa lokalnie bez internetu
- **Nasłuchiwanie zmian sesji** — `onAuthStateChange` automatycznie przekierowuje do ekranu logowania gdy sesja wygaśnie lub użytkownik się wyloguje
- **Chronione ekrany** — `app/index.tsx` weryfikuje sesję i przekierowuje niezalogowanych użytkowników do `/login`

---

## Integracja z zewnętrznym API

### 1. remove.bg API — usuwanie tła

Aplikacja integruje się z [remove.bg](https://www.remove.bg/api) — zewnętrznym API do usuwania tła ze zdjęć.

**Przepływ:**
1. Użytkownik robi zdjęcie lub wybiera z galerii
2. Na ekranie podglądu (`/photoPreview`) naciska „Usuń tło"
3. Serwis `backgroundRemoval.ts` wysyła zdjęcie do `https://api.remove.bg/v1.0/removebg` metodą POST z `multipart/form-data`
4. Wynik (PNG bez tła, przycięty z 10px marginesem) wyświetlany jest w podglądzie
5. Użytkownik może zaakceptować lub zrobić zdjęcie ponownie

**Obsługa błędów i stanów:**
- Loading state: `ActivityIndicator` + komunikat „Usuwanie tła..."
- Błąd API: komunikat błędu wyświetlany na ekranie z możliwością ponownej próby

Klucz API przechowywany w zmiennej środowiskowej `EXPO_PUBLIC_REMOVE_BG_API_KEY`

### 2. OpenAI API (gpt-4o-mini) — moodboard(stylizacja) AI

> ⚠️ Używanie OpenAI API wymaga doładowania konta na [platform.openai.com](https://platform.openai.com) — minimum **$5**.

Aplikacja integruje się z [OpenAI API](https://platform.openai.com) — zewnętrznym API do generowania układu moodboardu(stylizacji).

**Przepływ:**
1. Użytkownik wybiera ubrania z folderów
2. Zdjęcia są konwertowane do base64
3. Serwis wysyła zdjęcia do modelu `gpt-4o-mini` wraz z promptem
4. Model klasyfikuje każde zdjęcie jako `top` / `middle` / `bottom` / `accent` i zwraca JSON z układem
5. Aplikacja renderuje moodboard w dwóch kolumnach na podstawie odpowiedzi AI

**Obsługa błędów i stanów:**
- Loading state: `ActivityIndicator` + komunikat „AI układa Twoją stylizację..."
- Błąd API: aplikacja automatycznie układa ubrania równomiernie i informuje użytkownika z możliwością ponownej próby
---

## Tryb offline

Aplikacja używa **AsyncStorage** (`services/cache.ts`) jako lokalnego cache:

- Po pobraniu listy folderów dane są zapisywane lokalnie: `saveToCache(FOLDERS_CACHE_KEY(userId), data)`
- Po pobraniu zdjęć z folderu dane są zapisywane lokalnie: `saveToCache(FOLDER_IMAGES_CACHE_KEY(folderId), data)`
- Przy braku połączenia dane są odczytywane z cache i wyświetlane z banerem: _„Brak połączenia — dane z ostatniej sesji"_
- Ekran stylizacji przy braku połączenia pokazuje odpowiedni komunikat
<img width="250" alt="IMAGE 2026-06-15 14:30:55" src="https://github.com/user-attachments/assets/93ee4604-046f-4ee4-8c9d-77f865d82865" />



---

## Bezpieczeństwo

- **Klucze API wyłącznie w `.env`** — plik `.env` jest w `.gitignore`; klucze nigdy nie trafiają do repozytorium
- **Komunikacja wyłącznie HTTPS** — Supabase, remove.bg i OpenAI używają HTTPS
- **Izolacja danych (RLS)** — polityki Row Level Security w Supabase zapewniają że każdy użytkownik widzi tylko swoje dane
- **Walidacja danych wejściowych** — nazwy folderów są trimowane i sprawdzane przed wysłaniem do bazy
- **Brak wrażliwych danych w AsyncStorage** — cache zawiera wyłącznie dane nieczułe (listy folderów, URL zdjęć); sesja auth zarządzana wewnętrznie przez klienta Supabase JS

---

## Wydajność

- `FlatList` zamiast `ScrollView` — używany w 5 ekranach (wardrobe, folderView, favorites, outfits, selectImages); wirtualizacja renderowania zapobiega ładowaniu wszystkich elementów naraz
- `useFocusEffect` + `useCallback` — ponowne ładowanie danych wyłącznie gdy ekran jest aktywny, używane w ekranach: folderView, favorites, outfits
- `numColumns={2}` w FlatList — siatka 2-kolumnowa renderowana efektywnie przez FlatList
- Skalowanie responsywne (`utils/scale.ts`) — funkcje `s()` (rozmiary) i `fs()` (czcionki) przeliczają wymiary proporcjonalnie do szerokości ekranu na podstawie referencyjnej szerokości 393px (iPhone 15 Pro); obliczenie wykonywane raz przy starcie, nie przy każdym renderze
- SVG zamiast obrazów rastrowych — wszystkie ikony to SVG renderowane przez `react-native-svg`, bez obciążenia pamięci plikami PNG

---

## Styl i UI/UX

Aplikacja ma spójny, własnoręcznie zaprojektowany system wizualny:

| Element | Wartość |
|---|---|
| Kolor główny (brąz) | `#A37D5D` |
| Kolor tła | `#FFFAF6` (kremowy) |
| Kolor kart/modali | `#EDE1D7` |
| Kolor tekstu | `#202C39` |
| Kolor błędu | `#E05744` |
| Font | Inter (Variable Font, załadowany lokalnie) |
| Border-radius | 30px (zaokrąglone karty i przyciski) |

Wszystkie ikony to pliki SVG renderowane przez `react-native-svg` — brak zależności od zewnętrznych zestawów ikon. Własny TabBar (`backgroundColor: #202C39`, `borderRadius: 30px`) z 5 zakładkami pozycjonowany absolutnie: `bottom: 24px` (iOS) / `12px` (Android) przez `Platform.OS`. Aktywna ikona: `#ffffff`, nieaktywna: `rgba(255,255,255,0.5)`.

Własna ikona aplikacji (`szafalcon.png`) z adaptacyjnymi ikonami Android (foreground + background + monochrome) — zmieniona z domyślnej ikony Expo.

### Interakcje i UX

- **Modalne okna z potwierdzeniem** — każda destruktywna akcja (usunięcie zdjęcia, usunięcie folderu) wymaga potwierdzenia w dedykowanym oknie modalnym
- **System powiadomień toast** — po dodaniu lub przeniesieniu zdjęcia pojawia się baner informacyjny z nazwą folderu docelowego
- **Undo przy przenoszeniu zdjęć** — po przeniesieniu zdjęcia między folderami użytkownik ma 4 sekundy na cofnięcie akcji; pasek postępu wizualizuje pozostały czas
- **Welokrotny wybór folderów** — przy dodawaniu nowego zdjęcia można wybrać jednocześnie kilka folderów docelowych; licznik wybranych folderów widoczny na przycisku zapisu
- **Dodawanie do innych folderów** — zdjęcie już w folderze można przypisać do dodatkowych folderów bez usuwania go z obecnego
- **Animacja potwierdzenia** — po zapisaniu zdjęcia ekran przyciemnia się z tekstem potwierdzającym akcję (`rgba(0,0,0,0.5)`)
- **Long-press dla akcji kontekstowych** — przytrzymanie zdjęcia otwiera menu z opcjami: przenieś, dodaj do innych folderów, usuń
- **Tryb offline** — dane folderów i zdjęć są cachowane lokalnie; aplikacja działa bez połączenia z siecią, wyświetlając baner informacyjny

---

## Jakość kodu

- **TypeScript** — całość codebase jest typowana statycznie
- **ESLint** — skonfigurowany przez `eslint-config-expo` (`eslint.config.js`)

Uruchomienie lintera:
```bash
npm run lint
```
Kod podzielony na warstwy:
- `app/` — ekrany (Expo Router, file-based routing)
- `components/` — komponenty wielokrotnego użytku (`TabBar`)
- `services/` — warstwa dostępu do danych (Supabase, remove.bg, cache)
- `context/` — globalny stan autoryzacji (`AuthContext`)
- `hooks/` — własne hooki (`use-backgroundRemoval`)
- `utils/` — narzędzia pomocnicze (`scale.ts`)
- `constants/` — stałe aplikacji (kolory, fonty)
- `types/` — deklaracje typów TypeScript
- `assets/` — czcionki, ikony aplikacji, splash screen

