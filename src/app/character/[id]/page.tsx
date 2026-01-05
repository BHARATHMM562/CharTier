"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Film, Calendar, TrendingUp, MessageSquare } from "lucide-react";
import { TierDistributionChart } from "@/components/tier-distribution-chart";
import { RatingForm } from "@/components/rating-form";
import { ReviewCard } from "@/components/review-card";
import type { Character, CharacterStats, TierType } from "@/lib/types";

interface Review {
  id: string;
  userId: string;
  tier: TierType;
  comment: string;
  createdAt: string;
  likes: number;
  likedByUser: boolean;
  user: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
}

export default function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<CharacterStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSort, setReviewSort] = useState<"newest" | "likes">("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState<{ tier: TierType; comment: string } | null>(null);
  const [likingReviews, setLikingReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charRes, reviewsRes] = await Promise.all([
          fetch(`/api/characters/${resolvedParams.id}`),
          fetch(`/api/characters/${resolvedParams.id}/reviews?sort=${reviewSort}`),
        ]);

        const charData = await charRes.json();
const reviewsData = await reviewsRes.json();

          setCharacter(charData.character);
          setStats(charData.stats);
          setReviews(reviewsData.reviews || []);

if (session?.user?.id && reviewsData.reviews) {
            const userReview = reviewsData.reviews.find(
              (r: Review) => r.userId === session.user.id
            );
          if (userReview) {
            setUserRating({ tier: userReview.tier, comment: userReview.comment });
          }
        }
      } catch (error) {
        console.error("Error fetching character:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, reviewSort, session?.user?.id]);

  const handleRatingSubmit = async (tier: TierType, comment: string) => {
    try {
      const res = await fetch(`/api/characters/${resolvedParams.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, comment }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error("Error response:", res.status, data);
        if (res.status === 401) {
          window.location.href = `/login?callbackUrl=/character/${resolvedParams.id}`;
        }
        return;
      }

      setReviews((prev) => {
        const existing = prev.findIndex((r) => r.userId === session?.user?.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data.review;
          return updated;
        }
        return [data.review, ...prev];
      });
      setUserRating({ tier, comment });

      const charRes = await fetch(`/api/characters/${resolvedParams.id}`);
      const charData = await charRes.json();
      setStats(charData.stats);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!session?.user?.id) return;

    setLikingReviews((prev) => new Set([...prev, reviewId]));

    try {
      const res = await fetch(
        `/api/characters/${resolvedParams.id}/reviews/${reviewId}/like`,
        { method: "POST" }
      );

      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, likes: data.likes, likedByUser: data.liked }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error liking review:", error);
    } finally {
      setLikingReviews((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8B8B8B]">Character not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-80 overflow-hidden">
        {character.mediaPoster ? (
          <Image
            src={character.mediaPoster}
            alt={character.mediaTitle}
            fill
            className="object-cover opacity-30 blur-sm"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/50 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-48 md:w-64 shrink-0"
          >
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#141416] shadow-2xl">
              {character.image ? (
                <Image
                  src={character.image}
                  alt={character.name}
                  width={256}
                  height={341}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl font-display text-[#2A2A2D]">
                    {character.name[0]}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <span className={`media-badge media-${character.mediaType} mb-3 inline-block`}>
              {character.mediaType}
            </span>
            <h1 className="text-4xl md:text-5xl font-display tracking-wider mb-4">
              {character.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-[#8B8B8B] mb-6">
              <div className="flex items-center gap-2">
                <Film size={18} />
                <span>{character.mediaTitle}</span>
              </div>
              {character.releaseYear && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{character.releaseYear}</span>
                </div>
              )}
              {character.actorName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Played by {character.actorName}</span>
                </div>
              )}
            </div>

            {character.description && (
              <p className="text-[#CCCCCC] leading-relaxed mb-6">
                {character.description}
              </p>
            )}

            {stats && stats.totalRatings > 0 && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-accent">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium">
                    Trending Score: {stats.trendingScore.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#8B8B8B]">
                  <MessageSquare size={18} />
                  <span className="text-sm">
                    {stats.recentActivity} ratings in 24h
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 gradient-border p-6 md:p-8"
          >
            <h2 className="text-xl font-display tracking-wider mb-6">
              COMMUNITY RATINGS
            </h2>
            <TierDistributionChart
              distribution={stats.tierDistribution}
              totalRatings={stats.totalRatings}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 gradient-border p-6 md:p-8"
        >
          <h2 className="text-xl font-display tracking-wider mb-6">
            {userRating ? "UPDATE YOUR RATING" : "RATE THIS CHARACTER"}
          </h2>
          <RatingForm
            characterId={resolvedParams.id}
            existingRating={userRating || undefined}
            onSubmit={handleRatingSubmit}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 mb-20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display tracking-wider">
              REVIEWS ({reviews?.length || 0})
            </h2>
            <div className="flex items-center gap-2 bg-[#141416] rounded-lg p-1">
              <button
                onClick={() => setReviewSort("newest")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  reviewSort === "newest"
                    ? "bg-[#2A2A2D] text-white"
                    : "text-[#8B8B8B] hover:text-white"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setReviewSort("likes")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  reviewSort === "likes"
                    ? "bg-[#2A2A2D] text-white"
                    : "text-[#8B8B8B] hover:text-white"
                }`}
              >
                Most Liked
              </button>
            </div>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  username={review.user.username}
                  userImage={review.user.image}
                  tier={review.tier}
                  comment={review.comment}
                  createdAt={review.createdAt}
                  likes={review.likes}
                  likedByUser={review.likedByUser}
                  onLike={() => handleLike(review.id)}
                  isLiking={likingReviews.has(review.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#141416] rounded-xl border border-[#2A2A2D]">
              <p className="text-[#8B8B8B]">No reviews yet. Be the first to rate!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
