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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      linked_procedures: {
        Row: {
          created_at: string
          id: string
          linked_procedure_id: string
          procedure_id: string
          relationship: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          linked_procedure_id: string
          procedure_id: string
          relationship?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          linked_procedure_id?: string
          procedure_id?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linked_procedures_linked_procedure_id_fkey"
            columns: ["linked_procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linked_procedures_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      makes: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          created_at: string
          id: string
          make_id: string
          name: string
          years: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          make_id: string
          name: string
          years?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          make_id?: string
          name?: string
          years?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "makes"
            referencedColumns: ["id"]
          },
        ]
      }
      procedure_feedback: {
        Row: {
          admin_notes: string | null
          content: string
          created_at: string
          feedback_type: string
          id: string
          procedure_id: string
          reviewed_at: string | null
          status: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          content: string
          created_at?: string
          feedback_type?: string
          id?: string
          procedure_id: string
          reviewed_at?: string | null
          status?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          content?: string
          created_at?: string
          feedback_type?: string
          id?: string
          procedure_id?: string
          reviewed_at?: string | null
          status?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procedure_feedback_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedure_feedback_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "procedure_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      procedure_variants: {
        Row: {
          created_at: string
          hardware_type: string | null
          id: string
          notes: Json | null
          procedure_id: string
          variant_name: string
        }
        Insert: {
          created_at?: string
          hardware_type?: string | null
          id?: string
          notes?: Json | null
          procedure_id: string
          variant_name: string
        }
        Update: {
          created_at?: string
          hardware_type?: string | null
          id?: string
          notes?: Json | null
          procedure_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_variants_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          category: string
          chip_type: string | null
          cost_max: number | null
          cost_min: number | null
          created_at: string
          description: string | null
          difficulty: string
          id: string
          model_id: string
          notes: Json | null
          pin_code: string | null
          steps: Json | null
          time_minutes: number | null
          title: string
          tools: Json | null
          updated_at: string
        }
        Insert: {
          category: string
          chip_type?: string | null
          cost_max?: number | null
          cost_min?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          model_id: string
          notes?: Json | null
          pin_code?: string | null
          steps?: Json | null
          time_minutes?: number | null
          title: string
          tools?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          chip_type?: string | null
          cost_max?: number | null
          cost_min?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          model_id?: string
          notes?: Json | null
          pin_code?: string | null
          steps?: Json | null
          time_minutes?: number | null
          title?: string
          tools?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedures_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tool_guides: {
        Row: {
          created_at: string
          id: string
          notes: Json | null
          steps: Json | null
          tool_name: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: Json | null
          steps?: Json | null
          tool_name: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: Json | null
          steps?: Json | null
          tool_name?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_guides_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "procedure_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tools: {
        Row: {
          created_at: string
          id: string
          tool_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tool_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
