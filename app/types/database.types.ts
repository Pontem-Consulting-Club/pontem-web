export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      CaseStudies: {
        Row: {
          case_type: string | null
          category: Database["public"]["Enums"]["CaseCategory"]
          company: string | null
          company_logo_url: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["CaseDifficulty"] | null
          document_name: string | null
          document_size_bytes: number | null
          document_url: string | null
          duration_minutes: number | null
          id: number
          problem_statement: string | null
          published_date: string | null
          summary: string | null
          title: string
        }
        Insert: {
          case_type?: string | null
          category: Database["public"]["Enums"]["CaseCategory"]
          company?: string | null
          company_logo_url?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["CaseDifficulty"] | null
          document_name?: string | null
          document_size_bytes?: number | null
          document_url?: string | null
          duration_minutes?: number | null
          id?: number
          problem_statement?: string | null
          published_date?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          case_type?: string | null
          category?: Database["public"]["Enums"]["CaseCategory"]
          company?: string | null
          company_logo_url?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["CaseDifficulty"] | null
          document_name?: string | null
          document_size_bytes?: number | null
          document_url?: string | null
          duration_minutes?: number | null
          id?: number
          problem_statement?: string | null
          published_date?: string | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      CaseStudyResources: {
        Row: {
          case_study_id: number
          created_at: string
          document_url: string | null
          id: number
          kind: Database["public"]["Enums"]["CaseResourceKind"]
          link: string | null
          position: number
          title: string
        }
        Insert: {
          case_study_id: number
          created_at?: string
          document_url?: string | null
          id?: number
          kind: Database["public"]["Enums"]["CaseResourceKind"]
          link?: string | null
          position?: number
          title: string
        }
        Update: {
          case_study_id?: number
          created_at?: string
          document_url?: string | null
          id?: number
          kind?: Database["public"]["Enums"]["CaseResourceKind"]
          link?: string | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "CaseStudyResources_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "CaseStudies"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended: boolean
          event_id: number
          guest_email: string | null
          guest_name: string | null
          id: number
          profile_id: string | null
          registered_at: string
          status: Database["public"]["Enums"]["registration_status"]
        }
        Insert: {
          attended?: boolean
          event_id: number
          guest_email?: string | null
          guest_name?: string | null
          id?: number
          profile_id?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
        }
        Update: {
          attended?: boolean
          event_id?: number
          guest_email?: string | null
          guest_name?: string | null
          id?: number
          profile_id?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "Events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Events: {
        Row: {
          capacity: number | null
          date: string | null
          description: string | null
          id: number
          image_url: string | null
          link: string | null
          location: string | null
          registration_mode: Database["public"]["Enums"]["registration_mode"]
          registration_open: boolean
          subtitle: string
          title: string
        }
        Insert: {
          capacity?: number | null
          date?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          location?: string | null
          registration_mode?: Database["public"]["Enums"]["registration_mode"]
          registration_open?: boolean
          subtitle: string
          title: string
        }
        Update: {
          capacity?: number | null
          date?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          location?: string | null
          registration_mode?: Database["public"]["Enums"]["registration_mode"]
          registration_open?: boolean
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      HeroSlides: {
        Row: {
          button_text: string | null
          id: number
          image_url: string | null
          link: string | null
          position: number
          subtitle: string | null
          title: string
        }
        Insert: {
          button_text?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          position?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          button_text?: string | null
          id?: number
          image_url?: string | null
          link?: string | null
          position?: number
          subtitle?: string | null
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
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          coach_enabled: boolean
          coordination: Database["public"]["Enums"]["ClubCoordination"] | null
          created_at: string
          display_name: string
          generation: number | null
          handle: string | null
          id: string
          is_public: boolean
          role: Database["public"]["Enums"]["user_role"]
          state: Database["public"]["Enums"]["profile_state"]
          team_id: number | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          coach_enabled?: boolean
          coordination?: Database["public"]["Enums"]["ClubCoordination"] | null
          created_at?: string
          display_name?: string
          generation?: number | null
          handle?: string | null
          id: string
          is_public?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          state?: Database["public"]["Enums"]["profile_state"]
          team_id?: number | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          coach_enabled?: boolean
          coordination?: Database["public"]["Enums"]["ClubCoordination"] | null
          created_at?: string
          display_name?: string
          generation?: number | null
          handle?: string | null
          id?: string
          is_public?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          state?: Database["public"]["Enums"]["profile_state"]
          team_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "Team"
            referencedColumns: ["id"]
          },
        ]
      }
      Projects: {
        Row: {
          description: string | null
          id: number
          image_url: string | null
          is_active: boolean
          link: string | null
          link_text: string | null
          semester: string | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          link_text?: string | null
          semester?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          link_text?: string | null
          semester?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      rate_limit_hits: {
        Row: {
          actor: string
          bucket: string
          hits: number
          window_start: string
        }
        Insert: {
          actor: string
          bucket: string
          hits?: number
          window_start: string
        }
        Update: {
          actor?: string
          bucket?: string
          hits?: number
          window_start?: string
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
          created_at: string | null
          image_url: string | null
        }
        Insert: {
          coordination: Database["public"]["Enums"]["ClubCoordination"]
          created_at?: string | null
          image_url?: string | null
        }
        Update: {
          coordination?: Database["public"]["Enums"]["ClubCoordination"]
          created_at?: string | null
          image_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      my_registration_stats: {
        Row: {
          attended: number | null
          cancelled: number | null
          profile_id: string | null
          registered: number | null
          upcoming: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          coordination: Database["public"]["Enums"]["ClubCoordination"] | null
          display_name: string | null
          generation: number | null
          handle: string | null
          id: string | null
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          coordination?: Database["public"]["Enums"]["ClubCoordination"] | null
          display_name?: string | null
          generation?: number | null
          handle?: string | null
          id?: string | null
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          coordination?: Database["public"]["Enums"]["ClubCoordination"] | null
          display_name?: string | null
          generation?: number | null
          handle?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_user_directory: {
        Args: never
        Returns: {
          avatar_path: string
          bio: string
          coach_enabled: boolean
          coordination: Database["public"]["Enums"]["ClubCoordination"]
          created_at: string
          display_name: string
          email: string
          generation: number
          handle: string
          id: string
          is_public: boolean
          last_sign_in_at: string
          role: Database["public"]["Enums"]["user_role"]
          state: Database["public"]["Enums"]["profile_state"]
          team_id: number
          updated_at: string
        }[]
      }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      bootstrap_admins: { Args: never; Returns: string[] }
      can_edit_content: { Args: never; Returns: boolean }
      claim_handle: {
        Args: { for_profile: string; source: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      rate_limit_allows: {
        Args: {
          p_actor: string
          p_bucket: string
          p_limit: number
          p_window: string
        }
        Returns: boolean
      }
      register_guest: {
        Args: {
          p_email: string
          p_event_id: number
          p_name: string
          p_source?: string
        }
        Returns: string
      }
      slugify_handle: { Args: { source: string }; Returns: string }
      unaccent_fallback: { Args: { source: string }; Returns: string }
    }
    Enums: {
      CaseCategory:
        | "ESTRATEGIA"
        | "OPERACIONES"
        | "FINANZAS"
        | "MARKETING"
        | "IMPACTO_SOCIAL"
      CaseDifficulty: "FACIL" | "MEDIO" | "DIFICIL" | "EXPERTO"
      CaseResourceKind: "APUNTE" | "DATASET" | "MASTERCLASS"
      ClubCoordination:
        | "DIRECTORS"
        | "COMMS_MKT"
        | "SOC_CONSULT"
        | "PEOPLE_MGMT"
        | "LEARNING_DEV"
        | "EXTERNAL_REL"
        | "IT"
        | "FINANCE"
      profile_state: "invited" | "active" | "inactive"
      registration_mode: "none" | "members_only" | "open"
      registration_status: "registered" | "cancelled" | "waitlisted"
      user_role: "admin" | "editor" | "member"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      CaseCategory: [
        "ESTRATEGIA",
        "OPERACIONES",
        "FINANZAS",
        "MARKETING",
        "IMPACTO_SOCIAL",
      ],
      CaseDifficulty: ["FACIL", "MEDIO", "DIFICIL", "EXPERTO"],
      CaseResourceKind: ["APUNTE", "DATASET", "MASTERCLASS"],
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
      profile_state: ["invited", "active", "inactive"],
      registration_mode: ["none", "members_only", "open"],
      registration_status: ["registered", "cancelled", "waitlisted"],
      user_role: ["admin", "editor", "member"],
    },
  },
} as const

