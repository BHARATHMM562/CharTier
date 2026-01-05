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
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get("sort") || "newest";

    let characterId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (!isUuid) {
      // If not UUID, it must be an external ID or prefixed ID
      let externalId = id;
      if (id.startsWith("ext-")) {
        externalId = id.split("-").slice(3).join("-");
      }

      const { data: character } = await supabaseAdmin
        .from("characters")
        .select("id")
        .eq("external_id", externalId)
        .maybeSingle();
      
      if (!character) {
        // Character doesn't exist in DB yet, so it has no reviews
        return NextResponse.json({ reviews: [] });
      }
      characterId = character.id;
    }

    let query = supabaseAdmin
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
      .eq("character_id", characterId);

    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "likes") {
      // Supabase doesn't support ordering by count easily in a simple query,
      // but we can sort in memory if the list is small, or just sort by newest for now.
      query = query.order("created_at", { ascending: false });
    }

    const { data: reviews, error } = await query;

    if (error) throw error;

    const formattedReviews = (reviews as ReviewFromDB[]).map((r) => ({
      id: r.id,
      userId: r.user_id,
      characterId: r.character_id,
      tier: r.tier,
      comment: r.comment,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      likes: r.likes?.length || 0,
      likedByUser: session?.user?.id
        ? r.likes?.some((l) => l.user_id === session.user.id)
        : false,
      user: {
        id: r.user.id,
        username: r.user.username,
        name: r.user.name || null,
        image: r.user.image || null,
      },
    }));

    if (sort === "likes") {
      formattedReviews.sort((a, b) => b.likes - a.likes);
    }

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in POST review:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { tier, comment } = body;

    if (!tier || !comment) {
      return NextResponse.json(
        { error: "Tier and comment are required" },
        { status: 400 }
      );
    }

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
        .single();
      
      if (!character) {
        return NextResponse.json({ error: "Character not found" }, { status: 404 });
      }
      characterId = character.id;
    }

    // Verify user ID exists in database (handle stale sessions)
    let userId = session.user.id;
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userRecord) {
      console.warn(`User ID ${userId} from session not found. Checking by email...`);
      const { data: userByEmail, error: emailError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (emailError || !userByEmail) {
        console.error("User not found by ID or email:", session.user.email);
        return NextResponse.json({ error: "User session invalid" }, { status: 401 });
      }
      userId = userByEmail.id;
      console.log(`Matched user ${session.user.email} to ID ${userId}`);
    }

    console.log("Inserting review for user:", userId, "character:", characterId);

    // Check if review already exists
    const { data: existingReview } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("character_id", characterId)
      .maybeSingle();

    let insertedReview;
    if (existingReview) {
      // Update existing review
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .update({
          tier,
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        throw error;
      }
      insertedReview = data;
    } else {
      // Insert new review
      const { data, error } = await supabaseAdmin
        .from("reviews")
        .insert({
          user_id: userId,
          character_id: characterId,
          tier,
          comment,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      insertedReview = data;
    }

    // Then fetch the review with user data
    const { data: review, error: fetchError } = await supabaseAdmin
      .from("reviews")
      .select(`
        *,
        user:users!reviews_user_id_fkey (
          id,
          username,
          name,
          image
        )
      `)
      .eq("id", insertedReview.id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    return NextResponse.json({
      review: {
        id: review.id,
        userId: review.user_id,
        characterId: review.character_id,
        tier: review.tier,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        likes: 0,
        likedByUser: false,
        user: {
          id: review.user.id,
          username: review.user.username,
          name: review.user.name || null,
          image: review.user.image || null,
        },
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to create review", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
