'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CharacterCard } from '@/components/character-card';

import type { MediaType, Character } from '@/lib/types';

interface GroupedCharacters {
  mediaTitle: string;
  mediaType: MediaType;
  releaseYear: number | null;
  characters: Character[];
}

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialMediaType =
    (searchParams.get('mediaType') as MediaType | 'all') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [mediaType, setMediaType] = useState<MediaType | 'all'>(
    initialMediaType
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setHasMore] = useState(false);
  const [, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [expandedShows, setExpandedShows] = useState<Set<string>>(new Set());

  const groupedCharacters = useMemo(() => {
    const groups: Record<string, GroupedCharacters> = {};
    characters.forEach((char) => {
      const key = `${char.mediaTitle}-${char.mediaType}`;
      if (!groups[key]) {
        groups[key] = {
          mediaTitle: char.mediaTitle,
          mediaType: char.mediaType,
          releaseYear: char.releaseYear,
          characters: [],
        };
      }
      groups[key].characters.push(char);
    });
    return Object.values(groups).sort((a, b) =>
      a.mediaTitle.localeCompare(b.mediaTitle)
    );
  }, [characters]);

  const toggleShowExpanded = (mediaTitle: string) => {
    setExpandedShows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mediaTitle)) {
        newSet.delete(mediaTitle);
      } else {
        newSet.add(mediaTitle);
      }
      return newSet;
    });
  };

  const searchCharacters = useCallback(
    async (pageNum: number, reset = false) => {
      if (!query.trim()) return;

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          page: pageNum.toString(),
          limit: '100',
          ...(mediaType !== 'all' && { mediaType }),
        });

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();

        if (reset) {
          setCharacters(data.characters);
          setExpandedShows(new Set());
        } else {
          setCharacters((prev) => [...prev, ...data.characters]);
        }
        setHasMore(data.pagination.hasMore);
        setPage(pageNum);
        setSearched(true);
      } catch (error) {
        console.error('Error searching characters:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [query, mediaType]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}&mediaType=${mediaType}`);
    searchCharacters(1, true);
  };

  useEffect(() => {
    if (initialQuery) {
      searchCharacters(1, true);
    }
  }, [initialQuery, searchCharacters]);

  const mediaTypes: { value: MediaType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'movie', label: 'Movies' },
    { value: 'series', label: 'Series' },
    { value: 'anime', label: 'Anime' },
  ];

  const getMediaTypeColor = (type: MediaType) => {
    switch (type) {
      case 'movie':
        return 'text-primary';
      case 'series':
        return 'text-accent';
      case 'anime':
        return 'text-tier-goat';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-display tracking-wider mb-4">
            SEARCH <span className="gradient-text">CHARACTERS</span>
          </h1>
          <p className="text-[#8B8B8B]">
            Find your favorite characters from movies, series, and anime
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="relative mb-4">
            <SearchIcon
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B8B8B]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for characters..."
              className="input-field pl-12 pr-12 text-lg"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCharacters([]);
                  setSearched(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 bg-[#141416] rounded-lg p-1">
              {mediaTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setMediaType(type.value);
                    if (query.trim() && searched) {
                      router.push(
                        `/search?q=${encodeURIComponent(query)}&mediaType=${type.value}`
                      );
                      setIsLoading(true);
                      const params = new URLSearchParams({
                        q: query.trim(),
                        page: '1',
                        limit: '100',
                        ...(type.value !== 'all' && { mediaType: type.value }),
                      });
                      fetch(`/api/search?${params}`)
                        .then((res) => res.json())
                        .then((data) => {
                          setCharacters(data.characters);
                          setExpandedShows(new Set());
                          setHasMore(data.pagination.hasMore);
                          setPage(1);
                        })
                        .finally(() => setIsLoading(false));
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mediaType === type.value
                      ? 'bg-[#2A2A2D] text-white'
                      : 'text-[#8B8B8B] hover:text-white'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="btn-primary"
            >
              Search
            </button>
          </div>
        </motion.form>

        {isLoading && characters.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-[#8B8B8B]">
              Searching TMDB & Jikan for characters...
            </p>
            <p className="text-sm text-[#666] mt-2">This may take a moment</p>
          </div>
        )}

        {searched && !isLoading && (
          <>
            {groupedCharacters.length > 0 ? (
              <>
                <p className="text-[#8B8B8B] mb-6">
                  Found {characters.length} characters from {
                    groupedCharacters.length
                  }{' '}
                  shows matching &quot;{query}&quot;
                </p>
                <div className="space-y-6">
                  {groupedCharacters.map((group) => {
                    const key = `${group.mediaTitle}-${group.mediaType}`;
                    const isExpanded = expandedShows.has(key);
                    const displayChars = isExpanded
                      ? group.characters
                      : group.characters.slice(0, 5);
                    const hasMore = group.characters.length > 5;

                    return (
                      <div
                        key={key}
                        className="bg-[#141416] rounded-xl p-4 border border-[#2A2A2D]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {group.mediaTitle}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span
                                className={getMediaTypeColor(group.mediaType)}
                              >
                                {group.mediaType.charAt(0).toUpperCase() +
                                  group.mediaType.slice(1)}
                              </span>
                              {group.releaseYear && (
                                <span className="text-[#666]">
                                  ({group.releaseYear})
                                </span>
                              )}
                              <span className="text-[#8B8B8B]">
                                • {group.characters.length} characters
                              </span>
                            </div>
                          </div>
                          {hasMore && (
                            <button
                              onClick={() => toggleShowExpanded(key)}
                              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  Show less <ChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  Show all ({group.characters.length}){' '}
                                  <ChevronDown size={16} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {displayChars.map((character, index) => (
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
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#8B8B8B] text-lg mb-4">
                  No characters found for &quot;{query}&quot;
                </p>
                <p className="text-sm text-[#666]">
                  Try a different search term
                </p>
              </div>
            )}
          </>
        )}

        {!searched && (
          <div className="text-center py-20">
            <p className="text-[#8B8B8B]">
              Start searching to discover characters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
