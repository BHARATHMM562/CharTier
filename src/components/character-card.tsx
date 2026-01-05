"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MediaType } from "@/lib/types";

interface CharacterCardProps {
  id: string;
  name: string;
  image: string | null;
  mediaTitle: string;
  mediaType: MediaType;
  releaseYear: number | null;
  index?: number;
}

export function CharacterCard({
  id,
  name,
  image,
  mediaTitle,
  mediaType,
  releaseYear,
  index = 0,
}: CharacterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/character/${id}`} className="block group">
        <div className="relative rounded-xl overflow-hidden bg-[#141416] card-glow">
          <div className="aspect-[3/4] relative">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A1A1D] to-[#141416] flex items-center justify-center">
                <span className="text-6xl font-display text-[#2A2A2D]">
                  {name[0]}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-3 left-3">
              <span className={`media-badge media-${mediaType}`}>
                {mediaType}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-[#8B8B8B] mt-1 line-clamp-1">
                {mediaTitle}
                {releaseYear && ` (${releaseYear})`}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
