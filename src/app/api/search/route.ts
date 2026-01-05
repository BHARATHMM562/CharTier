import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  searchMovies,
  searchTV,
  getMovieCharacters,
  getTVCharacters,
} from "@/lib/api/tmdb";
import { searchAnime, getAnimeCharacters } from "@/lib/api/jikan";

interface CharacterResult {
  id: string;
  externalId: string;
  source: "tmdb" | "jikan";
  name: string;
  image: string | null;
  mediaTitle: string;
  mediaType: "movie" | "series" | "anime";
  mediaId: string;
  releaseYear: number | null;
  mediaPoster: string | null;
  actorName?: string;
  role?: string;
  order: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const mediaType = searchParams.get("mediaType");

    if (!query.trim()) {
      return NextResponse.json({
        characters: [],
        pagination: { page: 1, limit: 100, total: 0, hasMore: false },
      });
    }

    const allCharacters: CharacterResult[] = [];
    const fetchPromises: Promise<void>[] = [];

    if (!mediaType || mediaType === "all" || mediaType === "movie") {
      fetchPromises.push(
        (async () => {
          try {
            const movies = await searchMovies(query);
            const moviePromises = movies.slice(0, 10).map(async (movie) => {
              try {
                const chars = await getMovieCharacters(movie.id, 15);
                return chars.map((c) => ({
                  id: c.externalId,
                  ...c,
                }));
              } catch {
                return [];
              }
            });
            const results = await Promise.all(moviePromises);
            allCharacters.push(...results.flat());
          } catch (err) {
            console.error("Error searching movies:", err);
          }
        })()
      );
    }

    if (!mediaType || mediaType === "all" || mediaType === "series") {
      fetchPromises.push(
        (async () => {
          try {
            const tvShows = await searchTV(query);
            const tvPromises = tvShows.slice(0, 10).map(async (tv) => {
              try {
                const chars = await getTVCharacters(tv.id, 15);
                return chars.map((c) => ({
                  id: c.externalId,
                  ...c,
                }));
              } catch {
                return [];
              }
            });
            const results = await Promise.all(tvPromises);
            allCharacters.push(...results.flat());
          } catch (err) {
            console.error("Error searching TV:", err);
          }
        })()
      );
    }

    if (!mediaType || mediaType === "all" || mediaType === "anime") {
      fetchPromises.push(
        (async () => {
          try {
            const animeList = await searchAnime(query);
            for (const anime of animeList.slice(0, 5)) {
              try {
                const chars = await getAnimeCharacters(anime.mal_id, 15);
                allCharacters.push(
                  ...chars.map((c) => ({
                    id: c.externalId,
                    ...c,
                  }))
                );
                await new Promise((r) => setTimeout(r, 350));
              } catch {
                continue;
              }
            }
          } catch (err) {
            console.error("Error searching anime:", err);
          }
        })()
      );
    }

    await Promise.all(fetchPromises);

    // Find existing characters in Supabase to return their real IDs
    const externalIds = allCharacters.map(c => c.externalId);
    const idMap = new Map<string, string>();
    
    if (externalIds.length > 0) {
      const { data: existingChars } = await supabaseAdmin
        .from("characters")
        .select("id, external_id, source")
        .in("external_id", externalIds);
      
      if (existingChars) {
        existingChars.forEach(c => {
          idMap.set(`${c.external_id}-${c.source}`, c.id);
        });
      }
    }

    allCharacters.forEach(c => {
      const supabaseId = idMap.get(`${c.externalId}-${c.source}`);
      if (supabaseId) {
        c.id = supabaseId;
      } else {
        // Encode source and type for characters not in database
        c.id = `ext-${c.source}-${c.mediaType}-${c.externalId}`;
      }
    });

    const sortedCharacters = allCharacters.sort((a, b) => {
      if (a.mediaTitle !== b.mediaTitle) {
        return a.mediaTitle.localeCompare(b.mediaTitle);
      }
      return a.order - b.order;
    });

    return NextResponse.json({
      characters: sortedCharacters.map((c) => ({
        id: c.id,
        externalId: c.externalId,
        source: c.source,
        name: c.name,
        image: c.image,
        mediaTitle: c.mediaTitle,
        mediaType: c.mediaType,
        mediaId: c.mediaId,
        releaseYear: c.releaseYear,
        mediaPoster: c.mediaPoster,
        actorName: c.actorName || null,
        role: c.role || null,
      })),
      pagination: {
        page: 1,
        limit: sortedCharacters.length,
        total: sortedCharacters.length,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error("Error searching characters:", error);
    return NextResponse.json(
      { error: "Failed to search characters" },
      { status: 500 }
    );
  }
}
