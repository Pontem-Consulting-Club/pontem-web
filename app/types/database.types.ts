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
    },
  },
} as const

