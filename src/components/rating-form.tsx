"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { TIERS, type TierType } from "@/lib/types";

interface RatingFormProps {
  characterId: string;
  existingRating?: {
    tier: TierType;
    comment: string;
  };
  onSubmit: (tier: TierType, comment: string) => Promise<void>;
}

export function RatingForm({ characterId, existingRating, onSubmit }: RatingFormProps) {
  const { data: session, status } = useSession();
  const [selectedTier, setSelectedTier] = useState<TierType | null>(
    existingRating?.tier || null
  );
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = selectedTier && comment.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !selectedTier) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(selectedTier, comment.trim());
    } catch {
      setError("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="gradient-border p-6 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="gradient-border p-6 text-center">
        <p className="text-[#8B8B8B] mb-4">Sign in to rate this character</p>
        <Link href={`/login?callbackUrl=/character/${characterId}`} className="btn-primary inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[#8B8B8B] mb-3">
          Select your tier
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier.value}
              type="button"
              onClick={() => setSelectedTier(tier.value)}
              className={`relative p-3 rounded-xl text-center transition-all ${
                selectedTier === tier.value
                  ? "ring-2 ring-offset-2 ring-offset-[#0A0A0B]"
                  : "hover:bg-[#1A1A1D]"
              }`}
              style={{
                backgroundColor:
                  selectedTier === tier.value ? "#141416" : "transparent",
                outlineColor:
                  selectedTier === tier.value
                    ? tier.value === "goat"
                      ? "#FFD700"
                      : tier.value === "god"
                      ? "#FF6B35"
                      : tier.value === "enjoyable"
                      ? "#00D4AA"
                      : tier.value === "mediocre"
                      ? "#8B8B8B"
                      : "#4A4A4A"
                    : "transparent",
              }}
            >
              <span className={`tier-badge tier-${tier.value} block mb-1`}>
                {tier.label}
              </span>
              <span className="text-[10px] text-[#8B8B8B] hidden sm:block">
                {tier.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#8B8B8B] mb-2">
          Your review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this character..."
          className="input-field min-h-[120px] resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting
          ? "Submitting..."
          : existingRating
          ? "Update Rating"
          : "Submit Rating"}
      </button>
    </form>
  );
}
