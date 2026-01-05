"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Flame, Clapperboard } from "lucide-react";
import { CharacterCard } from "@/components/character-card";
import { FilterBar } from "@/components/filter-bar";
import { InfiniteScroll } from "@/components/infinite-scroll";
import type { MediaType, Character } from "@/lib/types";

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"trending" | "popular" | "recent">("trending");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchCharacters = useCallback(async (pageNum: number, reset = false, currentSort?: string, currentMediaType?: string) => {
    setIsLoading(true);
    try {
      const activeSort = currentSort || sort;
      const activeMediaType = currentMediaType !== undefined ? currentMediaType : mediaType;

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        sort: activeSort,
        ...(activeMediaType !== "all" && { mediaType: activeMediaType }),
      });

      const res = await fetch(`/api/characters?${params}`);
      if (!res.ok) throw new Error("Failed to fetch characters");
      
      const data = await res.json();

      if (reset) {
        setCharacters(data.characters || []);
      } else {
        setCharacters((prev) => [...prev, ...(data.characters || [])]);
      }
      setHasMore(data.pagination?.hasMore ?? false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [sort, mediaType]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchCharacters(page + 1);
    }
  }, [isLoading, hasMore, page, fetchCharacters]);

  const handleSortChange = (newSort: "trending" | "popular" | "recent") => {
    setSort(newSort);
    setPage(1);
    fetchCharacters(1, true, newSort, mediaType);
  };

  const handleMediaTypeChange = (newMediaType: MediaType | "all") => {
    setMediaType(newMediaType);
    setPage(1);
    fetchCharacters(1, true, sort, newMediaType);
  };

  useEffect(() => {
    if (!isInitialized) {
      fetchCharacters(1, true);
    }
  }, [isInitialized, fetchCharacters]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display tracking-wider mb-6">
              RATE YOUR
              <br />
              <span className="gradient-text">FAVORITE CHARACTERS</span>
            </h1>
            <p className="text-xl text-[#8B8B8B] max-w-2xl mx-auto mb-10">
              Join thousands of fans rating and discussing fictional characters from
              movies, series, and anime. Share your tier rankings with the community.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141416] border border-[#2A2A2D]">
                <Clapperboard size={18} className="text-primary" />
                <span className="text-sm">Movies</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141416] border border-[#2A2A2D]">
                <Sparkles size={18} className="text-accent" />
                <span className="text-sm">Series</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141416] border border-[#2A2A2D]">
                <TrendingUp size={18} className="text-tier-goat" />
                <span className="text-sm">Anime</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">5</p>
                <p className="text-sm text-[#8B8B8B]">Tier Levels</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">100+</p>
                <p className="text-sm text-[#8B8B8B]">Characters</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold gradient-text">Free</p>
                <p className="text-sm text-[#8B8B8B]">Forever</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="text-primary" size={28} />
          <h2 className="text-2xl font-display tracking-wider">DISCOVER CHARACTERS</h2>
        </div>

        <FilterBar
          activeSort={sort}
          activeMediaType={mediaType}
          onSortChange={handleSortChange}
          onMediaTypeChange={handleMediaTypeChange}
        />

        <InfiniteScroll
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
        >
          {characters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {characters.map((character, index) => (
                <CharacterCard
                  key={`${character.id}-${index}`}
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
              <p className="text-[#8B8B8B] text-lg mb-4">No characters found</p>
              <p className="text-sm text-[#666]">
                Try syncing characters from the API or adjust your filters
              </p>
            </div>
          ) : null}
        </InfiniteScroll>
      </section>
    </div>
  );
}
