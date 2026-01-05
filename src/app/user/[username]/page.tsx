"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, BarChart3 } from "lucide-react";
import { TierDistributionChart } from "@/components/tier-distribution-chart";
import { formatDate } from "@/lib/utils";
import type { TierType, MediaType } from "@/lib/types";

interface UserRating {
  id: string;
  tier: TierType;
  comment: string;
  createdAt: string;
  character: {
    id: string;
    name: string;
    image: string | null;
    mediaTitle: string;
    mediaType: MediaType;
    releaseYear: number | null;
  } | null;
}

interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  totalRatings: number;
  tierDistribution: Record<TierType, number>;
  ratings: UserRating[];
  createdAt: string;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${resolvedParams.username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams.username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8B8B8B]">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent p-1">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.name || profile.username}
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#141416] flex items-center justify-center">
                <span className="text-4xl font-display text-white">
                  {profile.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-display tracking-wider mb-2">
              {profile.name || profile.username}
            </h1>
            <p className="text-[#8B8B8B] text-lg mb-4">@{profile.username}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
              <div className="flex items-center gap-2 text-[#8B8B8B]">
                <BarChart3 size={16} />
                <span>
                  <strong className="text-white">{profile.totalRatings}</strong>{" "}
                  ratings
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#8B8B8B]">
                <Calendar size={16} />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gradient-border p-6"
          >
            <h2 className="text-xl font-display tracking-wider mb-6">
              RATING DISTRIBUTION
            </h2>
            <TierDistributionChart
              distribution={profile.tierDistribution}
              totalRatings={profile.totalRatings}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gradient-border p-6"
          >
            <h2 className="text-xl font-display tracking-wider mb-6">
              TIER BREAKDOWN
            </h2>
            <div className="space-y-4">
              {(["goat", "god", "enjoyable", "mediocre", "weak"] as TierType[]).map(
                (tier) => {
                  const count = profile.tierDistribution[tier] || 0;
                  const percentage =
                    profile.totalRatings > 0
                      ? Math.round((count / profile.totalRatings) * 100)
                      : 0;
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`tier-badge tier-${tier}`}>
                          {tier.toUpperCase()}
                        </span>
                        <span className="text-sm text-[#8B8B8B]">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-[#1A1A1D] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className={`h-full tier-${tier}`}
                          style={{
                            background:
                              tier === "goat"
                                ? "linear-gradient(90deg, #FFD700, #FFA500)"
                                : tier === "god"
                                ? "linear-gradient(90deg, #FF6B35, #FF4500)"
                                : tier === "enjoyable"
                                ? "linear-gradient(90deg, #00D4AA, #00B894)"
                                : tier === "mediocre"
                                ? "linear-gradient(90deg, #8B8B8B, #6B6B6B)"
                                : "linear-gradient(90deg, #4A4A4A, #2A2A2A)",
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-display tracking-wider mb-6">
            RECENT RATINGS ({profile.ratings.length})
          </h2>

          {profile.ratings.length > 0 ? (
            <div className="space-y-4">
              {profile.ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="bg-[#141416] rounded-xl p-5 border border-[#2A2A2D]"
                >
                  <div className="flex items-start gap-4">
                    {rating.character && (
                      <Link
                        href={`/character/${rating.character.id}`}
                        className="shrink-0"
                      >
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#1A1A1D]">
                          {rating.character.image ? (
                            <Image
                              src={rating.character.image}
                              alt={rating.character.name}
                              width={64}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xl font-display text-[#2A2A2D]">
                                {rating.character.name[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        {rating.character ? (
                          <Link
                            href={`/character/${rating.character.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            <h3 className="font-semibold line-clamp-1">
                              {rating.character.name}
                            </h3>
                            <p className="text-sm text-[#8B8B8B]">
                              {rating.character.mediaTitle}
                              {rating.character.releaseYear &&
                                ` (${rating.character.releaseYear})`}
                            </p>
                          </Link>
                        ) : (
                          <span className="text-[#8B8B8B]">Character unavailable</span>
                        )}
                        <span className={`tier-badge tier-${rating.tier} shrink-0 ml-3`}>
                          {rating.tier.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#CCCCCC] text-sm line-clamp-2">
                        {rating.comment}
                      </p>
                      <p className="text-xs text-[#666] mt-2">
                        {formatDate(rating.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#141416] rounded-xl border border-[#2A2A2D]">
              <p className="text-[#8B8B8B]">No ratings yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
