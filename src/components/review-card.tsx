"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { TierType } from "@/lib/types";

interface ReviewCardProps {
  id: string;
  username: string;
  userImage: string | null;
  tier: TierType;
  comment: string;
  createdAt: Date | string;
  likes: number;
  likedByUser: boolean;
  onLike?: () => void;
  isLiking?: boolean;
}

export function ReviewCard({
  username,
  userImage,
  tier,
  comment,
  createdAt,
  likes,
  likedByUser,
  onLike,
  isLiking,
}: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141416] rounded-xl p-5 border border-[#2A2A2D]"
    >
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/user/${username}`}
          className="flex items-center gap-3 group"
        >
          {userImage ? (
            <Image
              src={userImage}
              alt={username}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {username[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium group-hover:text-primary transition-colors">
              @{username}
            </p>
            <p className="text-xs text-[#8B8B8B]">
              {formatRelativeTime(createdAt)}
            </p>
          </div>
        </Link>
        <span className={`tier-badge tier-${tier}`}>
          {tier.toUpperCase()}
        </span>
      </div>

      <p className="text-[#CCCCCC] leading-relaxed">{comment}</p>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={onLike}
          disabled={isLiking}
          className={`flex items-center gap-2 text-sm transition-colors ${
            likedByUser
              ? "text-primary"
              : "text-[#8B8B8B] hover:text-white"
          }`}
        >
          <ThumbsUp
            size={16}
            className={likedByUser ? "fill-primary" : ""}
          />
          <span>{likes}</span>
        </button>
      </div>
    </motion.div>
  );
}
