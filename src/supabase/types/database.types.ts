export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_responses: {
        Row: {
          agent_id: string
          chat_history: string[] | null
          direct_response: string | null
          error: string | null
          id: string
          session_id: string
          timestamp: string | null
          tool_output: Json | null
        }
        Insert: {
          agent_id: string
          chat_history?: string[] | null
          direct_response?: string | null
          error?: string | null
          id?: string
          session_id: string
          timestamp?: string | null
          tool_output?: Json | null
        }
        Update: {
          agent_id?: string
          chat_history?: string[] | null
          direct_response?: string | null
          error?: string | null
          id?: string
          session_id?: string
          timestamp?: string | null
          tool_output?: Json | null
        }
        Relationships: []
      }
      learnings: {
        Row: {
          content: string
          created_at: string | null
          id: number
          learning_type: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          learning_type: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          learning_type?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string | null
          file_path: string
          id: string
          media_type: string
        }
        Insert: {
          created_at?: string | null
          file_path: string
          id?: string
          media_type: string
        }
        Update: {
          created_at?: string | null
          file_path?: string
          id?: string
          media_type?: string
        }
        Relationships: []
      }
      memory_summaries: {
        Row: {
          created_at: string | null
          id: number
          last_updated: string | null
          processed: boolean | null
          session_id: string | null
          summary: string
          summary_type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_updated?: string | null
          processed?: boolean | null
          session_id?: string | null
          summary: string
          summary_type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          last_updated?: string | null
          processed?: boolean | null
          session_id?: string | null
          summary?: string
          summary_type?: string
        }
        Relationships: []
      }
      short_term_terminal_history: {
        Row: {
          content: string
          created_at: string | null
          id: number
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      terminal_history: {
        Row: {
          command: string
          created_at: string | null
          id: number
          internal_thought: string | null
          plan: string | null
          session_id: string
          terminal_log: string | null
        }
        Insert: {
          command: string
          created_at?: string | null
          id?: number
          internal_thought?: string | null
          plan?: string | null
          session_id: string
          terminal_log?: string | null
        }
        Update: {
          command?: string
          created_at?: string | null
          id?: number
          internal_thought?: string | null
          plan?: string | null
          session_id?: string
          terminal_log?: string | null
        }
        Relationships: []
      }
      terminal_status: {
        Row: {
          id: boolean
          is_active: boolean | null
          last_updated: string | null
        }
        Insert: {
          id?: boolean
          is_active?: boolean | null
          last_updated?: string | null
        }
        Update: {
          id?: boolean
          is_active?: boolean | null
          last_updated?: string | null
        }
        Relationships: []
      }
      tweet_media: {
        Row: {
          media_id: string
          tweet_id: string
        }
        Insert: {
          media_id: string
          tweet_id: string
        }
        Update: {
          media_id?: string
          tweet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tweet_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tweet_media_tweet_id_fkey"
            columns: ["tweet_id"]
            isOneToOne: false
            referencedRelation: "twitter_tweets"
            referencedColumns: ["tweet_id"]
          },
        ]
      }
      twitter_interactions: {
        Row: {
          bot_username: string | null
          context: Json | null
          id: number
          text: string | null
          timestamp: string | null
          tweet_id: string | null
          user_id: string | null
        }
        Insert: {
          bot_username?: string | null
          context?: Json | null
          id?: number
          text?: string | null
          timestamp?: string | null
          tweet_id?: string | null
          user_id?: string | null
        }
        Update: {
          bot_username?: string | null
          context?: Json | null
          id?: number
          text?: string | null
          timestamp?: string | null
          tweet_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "twitter_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      twitter_tweets: {
        Row: {
          bot_username: string | null
          created_at: string | null
          has_media: boolean | null
          id: number
          in_reply_to_tweet_id: string | null
          quoted_tweet_id: string | null
          retweeted_tweet_id: string | null
          text: string | null
          tweet_id: string | null
          tweet_type: string | null
        }
        Insert: {
          bot_username?: string | null
          created_at?: string | null
          has_media?: boolean | null
          id?: number
          in_reply_to_tweet_id?: string | null
          quoted_tweet_id?: string | null
          retweeted_tweet_id?: string | null
          text?: string | null
          tweet_id?: string | null
          tweet_type?: string | null
        }
        Update: {
          bot_username?: string | null
          created_at?: string | null
          has_media?: boolean | null
          id?: number
          in_reply_to_tweet_id?: string | null
          quoted_tweet_id?: string | null
          retweeted_tweet_id?: string | null
          text?: string | null
          tweet_id?: string | null
          tweet_type?: string | null
        }
        Relationships: []
      }
      twitter_user_accounts: {
        Row: {
          is_followed_by_bot: boolean | null
          last_followed_at: string | null
          last_profile_update: string | null
          profile_data: Json | null
          user_account_id: number
        }
        Insert: {
          is_followed_by_bot?: boolean | null
          last_followed_at?: string | null
          last_profile_update?: string | null
          profile_data?: Json | null
          user_account_id: number
        }
        Update: {
          is_followed_by_bot?: boolean | null
          last_followed_at?: string | null
          last_profile_update?: string | null
          profile_data?: Json | null
          user_account_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "twitter_user_accounts_user_account_id_fkey"
            columns: ["user_account_id"]
            isOneToOne: true
            referencedRelation: "user_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_accounts: {
        Row: {
          connected_at: string | null
          id: number
          platform: string
          platform_user_id: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          connected_at?: string | null
          id?: number
          platform: string
          platform_user_id: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          connected_at?: string | null
          id?: number
          platform?: string
          platform_user_id?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          is_registered: boolean | null
          registered_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_registered?: boolean | null
          registered_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_registered?: boolean | null
          registered_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
