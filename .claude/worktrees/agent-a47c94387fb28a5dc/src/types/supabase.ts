// TODO: Regenerate this file after applying the migration to your Supabase project.
// Run: npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/types/supabase.ts
// This placeholder keeps TypeScript happy during development before the migration is applied.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      media_items: {
        Row: {
          id: string
          user_id: string
          media_type: 'movie' | 'book' | 'series'
          external_id: string
          title: string
          year: string | null
          genre: string | null
          director: string | null
          author: string | null
          plot: string | null
          poster_url: string | null
          external_rating: string | null
          status: 'watchlist' | 'watching' | 'completed' | 'dropped'
          user_rating: number | null
          is_favorite: boolean
          date_added: string
          date_completed: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          media_type: 'movie' | 'book' | 'series'
          external_id: string
          title: string
          year?: string | null
          genre?: string | null
          director?: string | null
          author?: string | null
          plot?: string | null
          poster_url?: string | null
          external_rating?: string | null
          status?: 'watchlist' | 'watching' | 'completed' | 'dropped'
          user_rating?: number | null
          is_favorite?: boolean
          date_added?: string
          date_completed?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          media_type?: 'movie' | 'book' | 'series'
          external_id?: string
          title?: string
          year?: string | null
          genre?: string | null
          director?: string | null
          author?: string | null
          plot?: string | null
          poster_url?: string | null
          external_rating?: string | null
          status?: 'watchlist' | 'watching' | 'completed' | 'dropped'
          user_rating?: number | null
          is_favorite?: boolean
          date_added?: string
          date_completed?: string | null
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      media_type: 'movie' | 'book' | 'series'
      media_status: 'watchlist' | 'watching' | 'completed' | 'dropped'
    }
  }
}
