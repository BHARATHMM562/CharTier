import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, reviewId } = await params;

    // Handle non-UUID character ID (external or prefixed)
    let characterId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isUuid) {
      let externalId = id;
      if (id.startsWith("ext-")) {
        externalId = id.split("-").slice(3).join("-");
      }

      const { data: character } = await supabaseAdmin
        .from("characters")
        .select("id")
        .eq("external_id", externalId)
        .maybeSingle();
      
      if (character) {
        characterId = character.id;
      }
    }

    // Check if like exists
    const { data: existingLike } = await supabaseAdmin
      .from("review_likes")
      .select("*")
      .eq("review_id", reviewId)
      .eq("user_id", session.user.id)
      .maybeSingle();
    
    let liked = false;

    if (existingLike) {
      // Unlike
      const { error: unlikeError } = await supabaseAdmin
        .from("review_likes")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", session.user.id);
      
      if (unlikeError) throw unlikeError;
      liked = false;
    } else {
      // Like
      const { error: likeError } = await supabaseAdmin
        .from("review_likes")
        .insert({
          review_id: reviewId,
          user_id: session.user.id,
        });
      
      if (likeError) throw likeError;
      liked = true;

      // Update character score (optional/background)
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(characterId)) {
        try {
          await supabaseAdmin.rpc('increment_character_score', { 
            char_id: characterId, 
            pop_inc: 0, 
            trend_inc: 1 
          });
        } catch (e) {
          console.warn("Failed to increment character score:", e);
        }
      }
    }

    // Get updated count
    const { count, error: countError } = await supabaseAdmin
      .from("review_likes")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId);

    if (countError) throw countError;

    return NextResponse.json({
      liked,
      likes: count || 0,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
