import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ReviewFromDB {
  id: string;
  user_id: string;
  character_id: string;
  tier: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  likes: { user_id: string }[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let characterId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isUuid) {
      // If not UUID, it might be an external ID.
      const { data: character } = await supabaseAdmin
        .from("characters")
        .select("*")
        .eq("external_id", id)
        .maybeSingle();

      if (!character) {
        return NextResponse.json({ error: "Character not found" }, { status: 404 });
      }
      characterId = character.id;
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isUuid) {
      // It\'s an external ID, find the corresponding internal UUID
      const { data: character, error: charError } = await supabaseAdmin
        .from("characters")
        .select("id")
        .eq("external_id", id)
        .maybeSingle();

      if (charError || !character) {
        return NextResponse.json({ error: "Character not found" }, { status: 404 });
      }
      characterId = character.id;
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
