import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMovieCharacters, getTVCharacters } from "@/lib/api/tmdb";
import { getAnimeCharacters } from "@/lib/api/jikan";

async function createCharacterFromExternalId(externalId: string) {
  // Parse externalId format: {source}-{mediaType}-{mediaId}-{characterId}
  const parts = externalId.split('-');
  if (parts.length < 4) return null;

  const source = parts[0];
  const mediaType = parts[1];
  const mediaId = parseInt(parts[2]);
  const characterId = parseInt(parts[3]);

  if (isNaN(mediaId) || isNaN(characterId)) return null;

  try {
    let characterData = null;

    if (source === 'tmdb') {
      if (mediaType === 'movie') {
        const chars = await getMovieCharacters(mediaId);
        characterData = chars.find(c => {
          const cParts = c.externalId.split('-');
          return parseInt(cParts[3]) === characterId;
        });
      } else if (mediaType === 'tv' || mediaType === 'series') {
        const chars = await getTVCharacters(mediaId);
        characterData = chars.find(c => {
          const cParts = c.externalId.split('-');
          return parseInt(cParts[3]) === characterId;
        });
      }
    } else if (source === 'jikan') {
      if (mediaType === 'anime') {
        const chars = await getAnimeCharacters(mediaId);
        characterData = chars.find(c => {
          const cParts = c.externalId.split('-');
          return parseInt(cParts[3]) === characterId;
        });
      }
    }

    if (!characterData) return null;

    // Create the character in the database
    const { data: created, error } = await supabaseAdmin
      .from("characters")
      .insert({
        external_id: characterData.externalId,
        source: characterData.source,
        name: characterData.name,
        image: characterData.image,
        description: null,
        media_title: characterData.mediaTitle,
        media_type: characterData.mediaType,
        media_id: characterData.mediaId,
        release_year: characterData.releaseYear,
        media_poster: characterData.mediaPoster,
        actor_name: 'actorName' in characterData ? characterData.actorName : null,
        trending_score: Math.random() * 100,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return created;
  } catch (error) {
    console.error("Error creating character from external ID:", error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let characterId = id;
    let externalId = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isUuid) {
      // Check if it's an ext- prefixed ID from search results
      if (id.startsWith('ext-')) {
        // Extract the actual external ID from the ext- format: ext-{source}-{mediaType}-{externalId}
        const parts = id.split('-');
        if (parts.length >= 4) {
          // Remove 'ext-{source}-{mediaType}-' prefix to get the externalId
          externalId = parts.slice(3).join('-');
        }
      } else {
        externalId = id;
      }

      if (externalId) {
        // Try to find the character by external_id
        const { data: character } = await supabaseAdmin
          .from("characters")
          .select("*")
          .eq("external_id", externalId)
          .maybeSingle();

        if (character) {
          characterId = character.id;
        } else {
          // Character doesn't exist, try to create it on the fly
          try {
            const createdCharacter = await createCharacterFromExternalId(externalId);
            if (createdCharacter) {
              characterId = createdCharacter.id;
            } else {
              return NextResponse.json({ error: "Character not found" }, { status: 404 });
            }
          } catch (createError) {
            console.error("Error creating character:", createError);
            return NextResponse.json({ error: "Character not found" }, { status: 404 });
          }
        }
      } else {
        return NextResponse.json({ error: "Invalid character ID" }, { status: 400 });
      }
    }

    // Fetch the character
    const { data: character, error: charError } = await supabaseAdmin
      .from("characters")
      .select("*")
      .eq("id", characterId)
      .single();

    if (charError || !character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Fetch reviews for stats
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .select("tier, created_at")
      .eq("character_id", characterId);

    if (reviewsError) throw reviewsError;

    // Calculate stats
    const totalRatings = reviews?.length || 0;
    const tierDistribution = {
      goat: reviews?.filter(r => r.tier === 'goat').length || 0,
      god: reviews?.filter(r => r.tier === 'god').length || 0,
      enjoyable: reviews?.filter(r => r.tier === 'enjoyable').length || 0,
      mediocre: reviews?.filter(r => r.tier === 'mediocre').length || 0,
      weak: reviews?.filter(r => r.tier === 'weak').length || 0,
    };

    // Calculate trending score (simplified)
    const recentReviews = reviews?.filter(r =>
      new Date(r.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length || 0;

    const trendingScore = character.trending_score + recentReviews * 10;

    const stats = {
      tierDistribution,
      totalRatings,
      trendingScore,
      recentActivity: recentReviews,
    };

    const formattedCharacter = {
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
      actorName: character.actor_name || null,
      createdAt: character.created_at,
      updatedAt: character.updated_at,
    };

    return NextResponse.json({ character: formattedCharacter, stats });
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tier, comment } = body;

    if (!tier || !comment) {
      return NextResponse.json(
        { error: "Tier and comment are required" },
        { status: 400 }
      );
    }

    let characterId = id;
    let externalId = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isUuid) {
      // Check if it's an ext- prefixed ID from search results
      if (id.startsWith('ext-')) {
        // Extract the actual external ID from the ext- format: ext-{source}-{mediaType}-{externalId}
        const parts = id.split('-');
        if (parts.length >= 4) {
          // Remove 'ext-{source}-{mediaType}-' prefix to get the externalId
          externalId = parts.slice(3).join('-');
        }
      } else {
        externalId = id;
      }

      if (externalId) {
        // Try to find the character by external_id
        const { data: character } = await supabaseAdmin
          .from("characters")
          .select("*")
          .eq("external_id", externalId)
          .maybeSingle();

        if (character) {
          characterId = character.id;
        } else {
          // Character doesn't exist, try to create it on the fly
          try {
            const createdCharacter = await createCharacterFromExternalId(externalId);
            if (createdCharacter) {
              characterId = createdCharacter.id;
            } else {
              return NextResponse.json({ error: "Character not found" }, { status: 404 });
            }
          } catch (createError) {
            console.error("Error creating character:", createError);
            return NextResponse.json({ error: "Character not found" }, { status: 404 });
          }
        }
      } else {
        return NextResponse.json({ error: "Invalid character ID" }, { status: 400 });
      }
    } else {
      // It is a UUID, verify it exists before proceeding.
      const { data: character, error: charError } = await supabaseAdmin
        .from("characters")
        .select("id")
        .eq("id", characterId)
        .maybeSingle();

      if (charError || !character) {
        return NextResponse.json({ error: "Character not found" }, { status: 404 });
      }
    }

    // Now, characterId is a verified UUID for an existing character.
    const userId = session.user.id;
    
    // First, upsert the review
    const { data: upsertedReview, error: upsertError } = await supabaseAdmin
      .from("reviews")
      .upsert({
        user_id: userId,
        character_id: characterId,
        tier,
        comment,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,character_id" })
      .select("id")
      .single();

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    // Then, fetch the newly created/updated review with all user data and likes
    const { data: reviewWithLikes, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select(`
        *,
        user:users!reviews_user_id_fkey (
          id,
          username,
          name,
          image
        ),
        likes:review_likes (
          user_id
        )
      `)
      .eq("id", upsertedReview.id)
      .single();

    if (fetchError) {
      console.error("Fetch after upsert error:", fetchError);
      throw fetchError;
    }

    // Return the full review object
    return NextResponse.json({
      review: {
        id: reviewWithLikes.id,
        userId: reviewWithLikes.user_id,
        characterId: reviewWithLikes.character_id,
        tier: reviewWithLikes.tier,
        comment: reviewWithLikes.comment,
        createdAt: reviewWithLikes.created_at,
        updatedAt: reviewWithLikes.updated_at,
        likes: reviewWithLikes.likes?.length || 0,
        likedByUser: session?.user?.id
          ? reviewWithLikes.likes?.some((l: { user_id: string }) => l.user_id === session.user.id)
          : false,
        user: {
          id: reviewWithLikes.user.id,
          username: reviewWithLikes.user.username,
          name: reviewWithLikes.user.name || null,
          image: reviewWithLikes.user.image || null,
        },
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
