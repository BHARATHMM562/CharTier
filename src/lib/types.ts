export type MediaType = "movie" | "series" | "anime";

export type TierType = "goat" | "god" | "enjoyable" | "mediocre" | "weak";

export const TIERS: { value: TierType; label: string; description: string }[] = [
  { value: "goat", label: "GOAT", description: "Greatest of All Time" },
  { value: "god", label: "GOD", description: "Exceptional character" },
  { value: "enjoyable", label: "Enjoyable", description: "Good and entertaining" },
  { value: "mediocre", label: "Mediocre", description: "Average, nothing special" },
  { value: "weak", label: "Weak", description: "Below average" },
];

export interface Character {
  id: string;
  externalId: string;
  source: "tmdb" | "jikan";
  name: string;
  image: string | null;
  description: string | null;
  mediaTitle: string;
  mediaType: MediaType;
  mediaId: string;
  releaseYear: number | null;
  mediaPoster: string | null;
  actorName?: string;
  actorImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  id: string;
  userId: string;
  characterId: string;
  tier: TierType;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  likes?: number;
  likedByUser?: boolean;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  username: string;
  createdAt: Date;
}

export interface CharacterStats {
  totalRatings: number;
  tierDistribution: Record<TierType, number>;
  trendingScore: number;
  recentActivity: number;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  totalRatings: number;
  tierDistribution: Record<TierType, number>;
  ratings: (Rating & { character: Character })[];
  createdAt: Date;
}

export interface SearchParams {
  query?: string;
  mediaType?: MediaType;
  page?: number;
  limit?: number;
  sort?: "trending" | "popular" | "recent";
}
