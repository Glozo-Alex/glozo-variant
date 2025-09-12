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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      candidate_details: {
        Row: {
          candidate_id: number
          created_at: string
          detailed_data: Json
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          candidate_id: number
          created_at?: string
          detailed_data: Json
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          candidate_id?: number
          created_at?: string
          detailed_data?: Json
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_relationships: {
        Row: {
          candidate_uuid: string
          created_at: string
          ended_at: string | null
          id: string
          related_object_data: Json | null
          related_object_id: string
          relationship_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          candidate_uuid: string
          created_at?: string
          ended_at?: string | null
          id?: string
          related_object_data?: Json | null
          related_object_id: string
          relationship_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          candidate_uuid?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          related_object_data?: Json | null
          related_object_id?: string
          relationship_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_relationships_candidate_uuid_fkey"
            columns: ["candidate_uuid"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          basic_data: Json
          candidate_id: string
          data_completeness_score: number | null
          detailed_data: Json | null
          first_seen_at: string
          has_detailed_contacts: boolean | null
          id: string
          last_updated_at: string
          user_id: string
        }
        Insert: {
          basic_data?: Json
          candidate_id: string
          data_completeness_score?: number | null
          detailed_data?: Json | null
          first_seen_at?: string
          has_detailed_contacts?: boolean | null
          id?: string
          last_updated_at?: string
          user_id: string
        }
        Update: {
          basic_data?: Json
          candidate_id?: string
          data_completeness_score?: number | null
          detailed_data?: Json | null
          first_seen_at?: string
          has_detailed_contacts?: boolean | null
          id?: string
          last_updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          candidate_id: string
          clicked_at: string | null
          content: string
          created_at: string
          error_message: string | null
          id: string
          opened_at: string | null
          recipient_id: string
          sent_at: string | null
          sequence_id: string
          status: string
          subject: string
          template_id: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          clicked_at?: string | null
          content: string
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_id: string
          sent_at?: string | null
          sequence_id: string
          status?: string
          subject: string
          template_id: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          clicked_at?: string | null
          content?: string
          created_at?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_id?: string
          sent_at?: string | null
          sequence_id?: string
          status?: string
          subject?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "sequence_recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string
          description: string | null
          global_template_id: string | null
          id: string
          is_active: boolean
          name: string
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          global_template_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          project_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          global_template_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_email_sequences_global_template_id"
            columns: ["global_template_id"]
            isOneToOne: false
            referencedRelation: "global_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          delay_days: number
          delay_hours: number
          id: string
          name: string
          order_index: number
          schedule_config: Json | null
          schedule_type: string | null
          sequence_id: string
          subject: string
          trigger_config: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          name: string
          order_index?: number
          schedule_config?: Json | null
          schedule_type?: string | null
          sequence_id: string
          subject: string
          trigger_config?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          delay_days?: number
          delay_hours?: number
          id?: string
          name?: string
          order_index?: number
          schedule_config?: Json | null
          schedule_type?: string | null
          sequence_id?: string
          subject?: string
          trigger_config?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      global_template_emails: {
        Row: {
          content: string
          created_at: string
          global_template_id: string
          id: string
          name: string
          order_index: number
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          global_template_id: string
          id?: string
          name: string
          order_index?: number
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          global_template_id?: string
          id?: string
          name?: string
          order_index?: number
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_global_template_emails_global_template_id"
            columns: ["global_template_id"]
            isOneToOne: false
            referencedRelation: "global_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      global_template_schedules: {
        Row: {
          created_at: string
          global_template_email_id: string
          id: string
          schedule_config: Json
          schedule_type: string
          trigger_config: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          global_template_email_id: string
          id?: string
          schedule_config?: Json
          schedule_type?: string
          trigger_config?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          global_template_email_id?: string
          id?: string
          schedule_config?: Json
          schedule_type?: string
          trigger_config?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_global_template_schedules_global_template_email_id"
            columns: ["global_template_email_id"]
            isOneToOne: false
            referencedRelation: "global_template_emails"
            referencedColumns: ["id"]
          },
        ]
      }
      global_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          candidate_view_preference: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          phone: string | null
          sidebar_collapsed: boolean | null
          theme_preference: string | null
          timezone: string | null
          ui_density_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          candidate_view_preference?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          job_title?: string | null
          phone?: string | null
          sidebar_collapsed?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          ui_density_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          candidate_view_preference?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          sidebar_collapsed?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          ui_density_preference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_shortlist: {
        Row: {
          added_at: string
          candidate_id: string
          candidate_snapshot: Json
          candidate_uuid: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          candidate_id: string
          candidate_snapshot: Json
          candidate_uuid?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          candidate_id?: string
          candidate_snapshot?: Json
          candidate_uuid?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_shortlist_candidate_uuid_fkey"
            columns: ["candidate_uuid"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_shortlist_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          is_temporary: boolean
          name: string
          query: string
          session_id: string | null
          shortlist_count: number | null
          similar_roles: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_temporary?: boolean
          name: string
          query: string
          session_id?: string | null
          shortlist_count?: number | null
          similar_roles?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_temporary?: boolean
          name?: string
          query?: string
          session_id?: string | null
          shortlist_count?: number | null
          similar_roles?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_results: {
        Row: {
          candidate_data: Json
          created_at: string
          id: string
          match_percentage: number | null
          search_id: string
          user_id: string
        }
        Insert: {
          candidate_data: Json
          created_at?: string
          id?: string
          match_percentage?: number | null
          search_id: string
          user_id: string
        }
        Update: {
          candidate_data?: Json
          created_at?: string
          id?: string
          match_percentage?: number | null
          search_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_results_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      searches: {
        Row: {
          candidate_count: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          is_temporary: boolean | null
          project_id: string | null
          prompt: string
          raw_response: Json | null
          session_id: string | null
          similar_roles: boolean | null
          status: string | null
          user_id: string
        }
        Insert: {
          candidate_count?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_temporary?: boolean | null
          project_id?: string | null
          prompt: string
          raw_response?: Json | null
          session_id?: string | null
          similar_roles?: boolean | null
          status?: string | null
          user_id: string
        }
        Update: {
          candidate_count?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_temporary?: boolean | null
          project_id?: string | null
          prompt?: string
          raw_response?: Json | null
          session_id?: string | null
          similar_roles?: boolean | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "searches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_recipients: {
        Row: {
          candidate_id: string
          candidate_uuid: string | null
          completed_at: string | null
          current_template_index: number
          enrolled_at: string
          id: string
          next_send_at: string | null
          project_id: string
          sequence_id: string
          status: string
          user_id: string
        }
        Insert: {
          candidate_id: string
          candidate_uuid?: string | null
          completed_at?: string | null
          current_template_index?: number
          enrolled_at?: string
          id?: string
          next_send_at?: string | null
          project_id: string
          sequence_id: string
          status?: string
          user_id: string
        }
        Update: {
          candidate_id?: string
          candidate_uuid?: string | null
          completed_at?: string | null
          current_template_index?: number
          enrolled_at?: string
          id?: string
          next_send_at?: string | null
          project_id?: string
          sequence_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_recipients_candidate_uuid_fkey"
            columns: ["candidate_uuid"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_recipients_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_recipients_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_shortlist_count: {
        Args: { project_id_param: string }
        Returns: undefined
      }
      increment_shortlist_count: {
        Args: { project_id_param: string }
        Returns: undefined
      }
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
    Enums: {},
  },
} as const
