export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      Events: {
        Row: {
          date: string | null
          description: string | null
          id: number
          image_url: string | null
          link: string | null
          location: string | null
          subtitle: string
          title: string
        }
        Insert: {
          date?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          location?: string | null
          subtitle: string
          title: string
        }
        Update: {
          date?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          location?: string | null
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      News: {
        Row: {
          author: string | null
          content: string | null
          id: number
          image_url: string | null
          link: string | null
          published_date: string | null
          subtitle: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          published_date?: string | null
          subtitle?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          published_date?: string | null
          subtitle?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      Projects: {
        Row: {
          description: string | null
          id: number
          image_url: string | null
          link: string | null
          link_text: string | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          link_text?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          link_text?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      Team: {
        Row: {
          coordination: Database["public"]["Enums"]["ClubCoordination"]
          created_at: string
          id: number
          name: string
        }
        Insert: {
          coordination: Database["public"]["Enums"]["ClubCoordination"]
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          coordination?: Database["public"]["Enums"]["ClubCoordination"]
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      TeamCoordination: {
        Row: {
          coordination: Database["public"]["Enums"]["ClubCoordination"]
          image_url: string | null
          created_at: string
        }
        Insert: {
          coordination: Database["public"]["Enums"]["ClubCoordination"]
          image_url?: string | null
          created_at?: string
        }
        Update: {
          coordination?: Database["public"]["Enums"]["ClubCoordination"]
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      Users: {
        Row: {
          id: number
          password: string | null
          username: string
        }
        Insert: {
          id?: number
          password?: string | null
          username: string
        }
        Update: {
          id?: number
          password?: string | null
          username?: string
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
      ClubCoordination:
        | "DIRECTORS"
        | "COMMS_MKT"
        | "SOC_CONSULT"
        | "PEOPLE_MGMT"
        | "LEARNING_DEV"
        | "EXTERNAL_REL"
        | "IT"
        | "FINANCE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ClubCoordination: [
        "DIRECTORS",
        "COMMS_MKT",
        "SOC_CONSULT",
        "PEOPLE_MGMT",
        "LEARNING_DEV",
        "EXTERNAL_REL",
        "IT",
        "FINANCE",
      ],
    },
  },
} as const
