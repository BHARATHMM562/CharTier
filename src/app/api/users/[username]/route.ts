import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { TierType } from "@/lib/types";

interface ReviewFromDB {
  id: string;
  tier: TierType;
  comment: string;
  created_at: string;
  character: {
    id: string;
    name: string;
    image: string | null;
    media_title: string;
    media_type: string;
    release_year: number | null;
  } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .select(`
        *,
        character:characters (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (reviewsError) throw reviewsError;

    const tierDistribution: Record<TierType, number> = {
      goat: 0,
      god: 0,
      enjoyable: 0,
      mediocre: 0,
      weak: 0,
    };

    const formattedRatings = (reviews as ReviewFromDB[]).map((r) => {
      tierDistribution[r.tier]++;
      return {
        id: r.id,
        tier: r.tier,
        comment: r.comment,
        createdAt: r.created_at,
        character: r.character
          ? {
              id: r.character.id,
              name: r.character.name,
              image: r.character.image || null,
              mediaTitle: r.character.media_title,
              mediaType: r.character.media_type,
              releaseYear: r.character.release_year || null,
            }
          : null,
      };
    });

    return NextResponse.json({
      profile: {
        id: user.id,
        username: user.username,
        name: user.name || null,
        image: user.image || null,
        totalRatings: reviews.length,
        tierDistribution,
        ratings: formattedRatings,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
