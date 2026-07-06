import type { Tables } from "@/lib/supabase/types";

export type MapRow = Tables<"maps">;
export type NodeRow = Tables<"nodes">;
export type ReactionRow = Tables<"reactions">;
export type SuggestionRow = Tables<"suggestions">;

export type FireCounts = Record<string, number>;
