const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface TMDbMedia {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  overview: string;
}

interface TMDbCreditsResponse {
  id: number;
  cast: TMDbCastMember[];
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) {
    throw new Error("TMDB_ACCESS_TOKEN is not configured");
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDb API error: ${response.status}`);
  }

  return response.json();
}

export async function getMovieCharacters(movieId: number, limit?: number) {
  const [credits, movie] = await Promise.all([
    tmdbFetch<TMDbCreditsResponse>(`/movie/${movieId}/credits`),
    tmdbFetch<TMDbMedia>(`/movie/${movieId}`),
  ]);

  const sortedCast = [...credits.cast].sort((a, b) => a.order - b.order);
  const castList = limit ? sortedCast.slice(0, limit) : sortedCast;
  return castList.map((member) => ({
    externalId: `tmdb-movie-${movieId}-${member.id}`,
    source: "tmdb" as const,
    name: member.character || member.name,
    image: member.profile_path
      ? `${TMDB_IMAGE_BASE}/w500${member.profile_path}`
      : null,
    mediaTitle: movie.title || "",
    mediaType: "movie" as const,
    mediaId: String(movieId),
    releaseYear: movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : null,
    mediaPoster: movie.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
      : null,
    actorName: member.name,
    order: member.order,
  }));
}

export async function getTVCharacters(tvId: number, limit?: number) {
  const [credits, tv] = await Promise.all([
    tmdbFetch<TMDbCreditsResponse>(`/tv/${tvId}/credits`),
    tmdbFetch<TMDbMedia>(`/tv/${tvId}`),
  ]);

  const sortedCast = [...credits.cast].sort((a, b) => a.order - b.order);
  const castList = limit ? sortedCast.slice(0, limit) : sortedCast;
  return castList.map((member) => ({
    externalId: `tmdb-tv-${tvId}-${member.id}`,
    source: "tmdb" as const,
    name: member.character || member.name,
    image: member.profile_path
      ? `${TMDB_IMAGE_BASE}/w500${member.profile_path}`
      : null,
    mediaTitle: tv.name || "",
    mediaType: "series" as const,
    mediaId: String(tvId),
    releaseYear: tv.first_air_date
      ? new Date(tv.first_air_date).getFullYear()
      : null,
    mediaPoster: tv.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${tv.poster_path}`
      : null,
    actorName: member.name,
    order: member.order,
  }));
}

export async function getTrendingMovies(page = 1) {
  const response = await tmdbFetch<{ results: TMDbMedia[]; total_pages: number }>(
    `/trending/movie/week?page=${page}`
  );
  return response;
}

export async function getTrendingTV(page = 1) {
  const response = await tmdbFetch<{ results: TMDbMedia[]; total_pages: number }>(
    `/trending/tv/week?page=${page}`
  );
  return response;
}

export async function getPopularMovies(page = 1) {
  const response = await tmdbFetch<{ results: TMDbMedia[]; total_pages: number }>(
    `/movie/popular?page=${page}`
  );
  return response;
}

export async function getPopularTV(page = 1) {
  const response = await tmdbFetch<{ results: TMDbMedia[]; total_pages: number }>(
    `/tv/popular?page=${page}`
  );
  return response;
}

export async function getTopRatedMovies(page = 1) {
  const response = await tmdbFetch<{ results: TMDbMedia[]; total_pages: number }>(
    `/movie/top_rated?page=${page}`
  );
  return response;
}

export async function searchMovies(query: string) {
  const response = await tmdbFetch<{ results: TMDbMedia[] }>(
    `/search/movie?query=${encodeURIComponent(query)}`
  );
  return response.results;
}

export async function searchTV(query: string) {
  const response = await tmdbFetch<{ results: TMDbMedia[] }>(
    `/search/tv?query=${encodeURIComponent(query)}`
  );
  return response.results;
}

export { TMDB_IMAGE_BASE };
