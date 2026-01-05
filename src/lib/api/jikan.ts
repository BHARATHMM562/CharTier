const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

interface JikanCharacter {
  mal_id: number;
  images: {
    jpg: { image_url: string };
    webp?: { image_url: string };
  };
  name: string;
  about: string | null;
}

interface JikanAnime {
  mal_id: number;
  title: string;
  images: {
    jpg: { large_image_url: string };
  };
  year: number | null;
  aired?: {
    prop?: {
      from?: { year: number };
    };
  };
}

interface JikanCharacterFull extends JikanCharacter {
  anime: Array<{
    anime: JikanAnime;
    role: string;
  }>;
}

async function jikanFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${JIKAN_BASE_URL}${endpoint}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return jikanFetch(endpoint);
    }
    throw new Error(`Jikan API error: ${response.status}`);
  }

  return response.json();
}

export async function getAnimeCharacters(animeId: number, limit?: number) {
  const response = await jikanFetch<{
    data: Array<{
      character: JikanCharacter;
      role: string;
    }>;
  }>(`/anime/${animeId}/characters`);

  const animeResponse = await jikanFetch<{ data: JikanAnime }>(
    `/anime/${animeId}`
  );
  const anime = animeResponse.data;

  const sortedChars = [...response.data].sort((a, b) => {
    if (a.role === "Main" && b.role !== "Main") return -1;
    if (a.role !== "Main" && b.role === "Main") return 1;
    return 0;
  });

  const charList = limit ? sortedChars.slice(0, limit) : sortedChars;
  return charList.map((item, index) => ({
    externalId: `jikan-${animeId}-${item.character.mal_id}`,
    source: "jikan" as const,
    name: item.character.name,
    image: item.character.images.jpg.image_url,
    description: null,
    mediaTitle: anime.title,
    mediaType: "anime" as const,
    mediaId: String(animeId),
    releaseYear: anime.year || anime.aired?.prop?.from?.year || null,
    mediaPoster: anime.images.jpg.large_image_url,
    role: item.role,
    order: index,
  }));
}

export async function getCharacterDetails(characterId: number) {
  const response = await jikanFetch<{ data: JikanCharacterFull }>(
    `/characters/${characterId}/full`
  );
  return response.data;
}

export async function getTopAnime(page = 1) {
  const response = await jikanFetch<{
    data: JikanAnime[];
    pagination: { last_visible_page: number; has_next_page: boolean };
  }>(`/top/anime?page=${page}`);
  return response;
}

export async function getSeasonalAnime(year?: number, season?: string) {
  const currentYear = year || new Date().getFullYear();
  const currentSeason =
    season || ["winter", "spring", "summer", "fall"][Math.floor(new Date().getMonth() / 3)];

  const response = await jikanFetch<{ data: JikanAnime[] }>(
    `/seasons/${currentYear}/${currentSeason}`
  );
  return response.data;
}

export async function searchAnime(query: string) {
  const response = await jikanFetch<{ data: JikanAnime[] }>(
    `/anime?q=${encodeURIComponent(query)}&limit=20`
  );
  return response.data;
}

export async function getTopCharacters(page = 1) {
  const response = await jikanFetch<{
    data: JikanCharacter[];
    pagination: { has_next_page: boolean };
  }>(`/top/characters?page=${page}`);
  return response;
}
