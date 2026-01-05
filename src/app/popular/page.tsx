"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { CharacterCard } from "@/components/character-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import type { MediaType, Character } from "@/lib/types";

export default function PopularPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");

  const fetchCharacters = useCallback(async (pageNum: number, reset = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        sort: "popular",
        ...(mediaType !== "all" && { mediaType }),
      });

      const res = await fetch(`/api/characters?${params}`);
      const data = await res.json();

      if (reset) {
        setCharacters(data.characters);
      } else {
        setCharacters((prev) => [...prev, ...data.characters]);
      }
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mediaType]);

  useEffect(() => {
    fetchCharacters(1, true);
  }, [fetchCharacters]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchCharacters(page + 1);
    }
  }, [isLoading, hasMore, page, fetchCharacters]);

  const handleMediaTypeChange = (newMediaType: MediaType | "all") => {
    setMediaType(newMediaType);
  };

  const mediaTypes: { value: MediaType | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "movie", label: "Movies" },
    { value: "series", label: "Series" },
    { value: "anime", label: "Anime" },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Flame className="text-primary" size={32} />
          <div>
            <h1 className="text-3xl font-display tracking-wider">
              MOST <span className="gradient-text">POPULAR</span>
            </h1>
            <p className="text-[#8B8B8B]">Characters with the most ratings</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 bg-[#141416] rounded-lg p-1 w-fit mb-8"
        >
          {mediaTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleMediaTypeChange(type.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mediaType === type.value
                  ? "bg-[#2A2A2D] text-white"
                  : "text-[#8B8B8B] hover:text-white"
              }`}
            >
              {type.label}
            </button>
          ))}
        </motion.div>

        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
        >
          {characters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {characters.map((character, index) => (
                <CharacterCard
                  key={character.id}
                  id={character.id}
                  name={character.name}
                  image={character.image}
                  mediaTitle={character.mediaTitle}
                  mediaType={character.mediaType}
                  releaseYear={character.releaseYear}
                  index={index}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-20">
              <p className="text-[#8B8B8B] text-lg">No popular characters found</p>
            </div>
          ) : null}
        </InfiniteScroll>
      </div>
    </div>
  );
}
