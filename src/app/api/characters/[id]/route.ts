import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { TierType } from "@/lib/types";
import { getMovieCharacters, getTVCharacters } from "@/lib/api/tmdb";
import { getAnimeCharacters } from "@/lib/api/jikan";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let character = null;

    // 1. Try to find by UUID first
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      const { data } = await supabaseAdmin
        .from("characters")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      character = data;
    }

    // 2. If not found or not UUID, check if it's an external ID or prefixed ID
    if (!character) {
      let externalId = id;
      let source = "";
      let mediaType = "";

      if (id.startsWith("ext-")) {
        // Format: ext-[source]-[mediaType]-[externalId...]
        const parts = id.split("-");
        source = parts[1];
        mediaType = parts[2];
        externalId = parts.slice(3).join("-");
      }

      // Try to find by external_id in DB
      const { data: charByExternal } = await supabaseAdmin
        .from("characters")
        .select("*")
        .eq("external_id", externalId)
        .maybeSingle();
      
      character = charByExternal;

      // 3. If still not found and we have source/type info, fetch from external API and create
      if (!character && source && mediaType) {
        let externalData = null;
        
        if (source === "tmdb") {
          const mediaId = parseInt(externalId.split("-")[2]);
          const chars = mediaType === "movie" 
            ? await getMovieCharacters(mediaId)
            : await getTVCharacters(mediaId);
          
          externalData = chars.find(c => c.externalId === externalId);
        } else if (source === "jikan") {
          const animeId = parseInt(externalId.split("-")[1]);
          const chars = await getAnimeCharacters(animeId);
          externalData = chars.find(c => c.externalId === externalId);
        }

        if (externalData) {
          const { data: newChar, error: insertError } = await supabaseAdmin
            .from("characters")
            .insert({
              external_id: externalData.externalId,
              source: externalData.source,
              name: externalData.name,
              image: externalData.image,
              description: null, // Add description to the object
              media_title: externalData.mediaTitle,
              media_type: externalData.mediaType,
              media_id: externalData.mediaId,
              release_year: externalData.releaseYear,
              media_poster: externalData.mediaPoster,
              actor_name: 'actorName' in externalData ? externalData.actorName : null,
              trending_score: 0
            })
            .select()
            .single();
          
          if (insertError) {
            console.error("Error auto-creating character:", insertError);
          } else {
            character = newChar;
          }
        }
      }
    }

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Fetch reviews for stats
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .select("tier, created_at")
      .eq("character_id", character.id);

    if (reviewsError) throw reviewsError;

    const tierDistribution: Record<TierType, number> = {
      goat: 0,
      god: 0,
      enjoyable: 0,
      mediocre: 0,
      weak: 0,
    };

    reviews?.forEach((review) => {
      tierDistribution[review.tier as TierType]++;
    });

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentRatings = reviews?.filter(
      (r) => new Date(r.created_at) > dayAgo
    ).length || 0;

    return NextResponse.json({
      character: {
        id: character.id,
        externalId: character.external_id,
        source: character.source,
        name: character.name,
        image: character.image || null,
        description: character.description || null,
        mediaTitle: character.media_title,
        mediaType: character.media_type,
        mediaId: character.media_id,
        releaseYear: character.release_year || null,
        mediaPoster: character.media_poster || null,
        actorName: character.actor_name,
        createdAt: character.created_at,
        updatedAt: character.updated_at,
      },
      stats: {
        totalRatings: reviews?.length || 0,
        tierDistribution,
        trendingScore: character.trending_score,
        recentActivity: recentRatings,
      },
    });
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}
