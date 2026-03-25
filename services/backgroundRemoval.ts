const REMOVE_BG_API = "https://api.remove.bg/v1.0/removebg";

export async function removeBackground(imageUri: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY;
  if (!apiKey) {
    throw new Error("Brak API key w .env");
  }

  const formData = new FormData();

  formData.append("image_file", {
    uri: imageUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  formData.append("size", "auto");

  console.log("wysyłam do remove.bg...");

  const response = await fetch(REMOVE_BG_API, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  console.log("status:", response.status);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Błąd remove.bg: ${text}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}