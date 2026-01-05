"use client";

import { motion } from "framer-motion";
import type { MediaType } from "@/lib/types";

interface FilterBarProps {
  activeSort: "trending" | "popular" | "recent";
  activeMediaType: MediaType | "all";
  onSortChange: (sort: "trending" | "popular" | "recent") => void;
  onMediaTypeChange: (mediaType: MediaType | "all") => void;
}

export function FilterBar({
  activeSort,
  activeMediaType,
  onSortChange,
  onMediaTypeChange,
}: FilterBarProps) {
  const sortOptions: { value: "trending" | "popular" | "recent"; label: string }[] = [
    { value: "trending", label: "Trending" },
    { value: "popular", label: "Most Popular" },
    { value: "recent", label: "Recently Added" },
  ];

  const mediaTypes: { value: MediaType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "movie", label: "Movies" },
    { value: "series", label: "Series" },
    { value: "anime", label: "Anime" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex items-center gap-2 bg-[#141416] rounded-lg p-1">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSort === option.value
                ? "text-white"
                : "text-[#8B8B8B] hover:text-white"
            }`}
          >
            {activeSort === option.value && (
              <motion.div
                layoutId="sortIndicator"
                className="absolute inset-0 bg-[#2A2A2D] rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-[#141416] rounded-lg p-1">
        {mediaTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onMediaTypeChange(type.value)}
            className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeMediaType === type.value
                ? "text-white"
                : "text-[#8B8B8B] hover:text-white"
            }`}
          >
            {activeMediaType === type.value && (
              <motion.div
                layoutId="mediaIndicator"
                className="absolute inset-0 bg-[#2A2A2D] rounded-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
