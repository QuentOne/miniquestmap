export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      maps: {
        Row: {
          code: string
          created_at: string
          id: string
          owner_id: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          owner_id: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          owner_id?: string
          title?: string
        }
        Relationships: []
      }
      nodes: {
        Row: {
          created_at: string
          description: string
          id: string
          is_complete: boolean
          map_id: string
          parent_id: string | null
          pos_x: number | null
          pos_y: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_complete?: boolean
          map_id: string
          parent_id?: string | null
          pos_x?: number | null
          pos_y?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_complete?: boolean
          map_id?: string
          parent_id?: string | null
          pos_x?: number | null
          pos_y?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "nodes_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string
          node_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          node_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          node_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          created_at: string
          description: string
          id: string
          map_id: string
          parent_node_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          map_id: string
          parent_node_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          map_id?: string
          parent_node_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      node_fire_counts: {
        Row: {
          fire_count: number | null
          node_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reactions_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
