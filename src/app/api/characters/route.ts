import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { 
  getTrendingMovies, 
  getTrendingTV, 
  getMovieCharacters, 
  getTVCharacters, 
  getPopularMovies, 
  getPopularTV, 
  getTopRatedMovies 
} from "@/lib/api/tmdb";
import { getSeasonalAnime, getAnimeCharacters, getTopAnime } from "@/lib/api/jikan";

// Define an interface for the data to be inserted into the database
interface CharacterToCreate {
  external_id: string;
  source: string;
  name: string;
  image?: string;
  description: string | null;
  media_title: string;
  media_type: string;
  media_id: string | number;
  release_year?: number;
  media_poster?: string;
  actor_name?: string;
  trending_score: number;
  last_activity_at: string;
}


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "trending";
    const mediaType = searchParams.get("mediaType");

    let query = supabaseAdmin
      .from("characters")
      .select("*", { count: "exact" });

    if (mediaType && mediaType !== "all") {
      query = query.eq("media_type", mediaType);
    }

    // Apply sorting
    switch (sort) {
      case "trending":
        query = query
          .order("trending_score", { ascending: false })
          .order("last_activity_at", { ascending: false });
        break;
      case "popular":
        query = query.order("popularity", { ascending: false });
        break;
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("trending_score", { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: characters, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      characters: characters.map((c) => ({
        id: c.id,
        externalId: c.external_id,
        source: c.source,
        name: c.name,
        image: c.image || null,
        description: c.description || null,
        mediaTitle: c.media_title,
        mediaType: c.media_type,
        mediaId: c.media_id,
        releaseYear: c.release_year || null,
        mediaPoster: c.media_poster || null,
        actorName: c.actor_name,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: page * limit < (count || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const [
      trendingMoviesPage1,
      trendingMoviesPage2,
      trendingTVPage1,
      trendingTVPage2,
      popularMoviesPage1,
      popularTVPage1,
      topRatedMoviesPage1,
      seasonalAnime,
      topAnimePage1,
      topAnimePage2,
    ] = await Promise.all([
      getTrendingMovies(1).catch(() => ({ results: [] })),
      getTrendingMovies(2).catch(() => ({ results: [] })),
      getTrendingTV(1).catch(() => ({ results: [] })),
      getTrendingTV(2).catch(() => ({ results: [] })),
      getPopularMovies(1).catch(() => ({ results: [] })),
      getPopularTV(1).catch(() => ({ results: [] })),
      getTopRatedMovies(1).catch(() => ({ results: [] })),
      getSeasonalAnime().catch(() => []),
      getTopAnime(1).catch(() => ({ data: [] })),
      getTopAnime(2).catch(() => ({ data: [] })),
    ]);

    const allMovies = [
      ...trendingMoviesPage1.results,
      ...trendingMoviesPage2.results,
      ...popularMoviesPage1.results,
      ...topRatedMoviesPage1.results,
    ];
    const allTV = [
      ...trendingTVPage1.results,
      ...trendingTVPage2.results,
      ...popularTVPage1.results,
    ];
    const allAnime = [
      ...seasonalAnime,
      ...topAnimePage1.data,
      ...topAnimePage2.data,
    ];

    const uniqueMovies = [...new Map(allMovies.map(m => [m.id, m])).values()];
    const uniqueTV = [...new Map(allTV.map(t => [t.id, t])).values()];
    const uniqueAnime = [...new Map(allAnime.map(a => [a.mal_id, a])).values()];

    const charactersToCreate: CharacterToCreate[] = [];

    // Process movies
    for (const movie of uniqueMovies.slice(0, 15)) {
      try {
        const chars = await getMovieCharacters(movie.id);
        charactersToCreate.push(...chars.map(c => ({
          external_id: c.externalId,
          source: c.source,
          name: c.name,
          image: c.image ?? undefined,
          description: null,
          media_title: c.mediaTitle,
          media_type: c.mediaType,
          media_id: c.mediaId,
          release_year: c.releaseYear ?? undefined,
          media_poster: c.mediaPoster ?? undefined,
          actor_name: c.actorName ?? undefined,
          trending_score: Math.random() * 100,
          last_activity_at: new Date().toISOString()
        })));
        await new Promise((r) => setTimeout(r, 50));
      } catch {
        continue;
      }
    }

    // Process TV
    for (const tv of uniqueTV.slice(0, 15)) {
      try {
        const chars = await getTVCharacters(tv.id);
        charactersToCreate.push(...chars.map(c => ({
          external_id: c.externalId,
          source: c.source,
          name: c.name,
          image: c.image ?? undefined,
          description: null,
          media_title: c.mediaTitle,
          media_type: c.mediaType,
          media_id: c.mediaId,
          release_year: c.releaseYear ?? undefined,
          media_poster: c.mediaPoster ?? undefined,
          actor_name: c.actorName ?? undefined,
          trending_score: Math.random() * 100,
          last_activity_at: new Date().toISOString()
        })));
        await new Promise((r) => setTimeout(r, 50));
      } catch {
        continue;
      }
    }

    // Process Anime
    for (const anime of uniqueAnime.slice(0, 15)) {
      try {
        const chars = await getAnimeCharacters(anime.mal_id);
        charactersToCreate.push(...chars.map(c => ({
          external_id: c.externalId,
          source: c.source,
          name: c.name,
          image: c.image ?? undefined,
          description: null,
          media_title: c.mediaTitle,
          media_type: c.mediaType,
          media_id: c.mediaId,
          release_year: c.releaseYear ?? undefined,
          media_poster: c.mediaPoster ?? undefined,
          actor_name: ('actorName' in c && (c as any).actorName) || undefined,
          trending_score: Math.random() * 100,
          last_activity_at: new Date().toISOString()
        })));
        await new Promise((r) => setTimeout(r, 400));
      } catch {
        continue;
      }
    }

    // Upsert into Supabase
    if (charactersToCreate.length > 0) {
      const { error } = await supabaseAdmin
        .from("characters")
        .upsert(charactersToCreate, { onConflict: "external_id,source" });
      
      if (error) throw error;
    }

    return NextResponse.json({
      message: `Successfully processed ${charactersToCreate.length} characters`,
      created: charactersToCreate.length,
    });
  } catch (error) {
    console.error("Error syncing characters:", error);
    return NextResponse.json(
      { error: "Failed to sync characters" },
      { status: 500 }
    );
  }
}