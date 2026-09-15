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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      article_rotation_state: {
        Row: {
          id: number
          last_run_at: string | null
          next_index: number
        }
        Insert: {
          id?: number
          last_run_at?: string | null
          next_index?: number
        }
        Update: {
          id?: number
          last_run_at?: string | null
          next_index?: number
        }
        Relationships: []
      }
      article_share_events: {
        Row: {
          article_slug: string
          article_title: string | null
          channel: string
          created_at: string
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          article_slug: string
          article_title?: string | null
          channel: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          article_slug?: string
          article_title?: string | null
          channel?: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          resource: string
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource: string
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource?: string
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          direction: string
          error_message: string | null
          from_address: string | null
          id: string
          inquiry_id: string | null
          provider_message_id: string | null
          received_at: string | null
          reply_to: string | null
          sent_at: string | null
          status: string
          subject: string | null
          to_address: string | null
        }
        Insert: {
          created_at?: string
          direction: string
          error_message?: string | null
          from_address?: string | null
          id?: string
          inquiry_id?: string | null
          provider_message_id?: string | null
          received_at?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          to_address?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          error_message?: string | null
          from_address?: string | null
          id?: string
          inquiry_id?: string | null
          provider_message_id?: string | null
          received_at?: string | null
          reply_to?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          to_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          auto_reply_enabled: boolean
          default_notification_email: string
          department_addresses: Json
          email_signature: string
          id: number
          notification_preferences: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_reply_enabled?: boolean
          default_notification_email?: string
          department_addresses?: Json
          email_signature?: string
          id?: number
          notification_preferences?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_reply_enabled?: boolean
          default_notification_email?: string
          department_addresses?: Json
          email_signature?: string
          id?: number
          notification_preferences?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_template_settings: {
        Row: {
          brand_color: string
          created_at: string
          footer_text: string
          header_text: string
          intro_text: string
          signature: string
          template_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          brand_color?: string
          created_at?: string
          footer_text?: string
          header_text?: string
          intro_text?: string
          signature?: string
          template_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          brand_color?: string
          created_at?: string
          footer_text?: string
          header_text?: string
          intro_text?: string
          signature?: string
          template_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          department: string | null
          email_status: string | null
          fields: Json
          first_response_at: string | null
          form_type: string
          id: string
          inquiry_type: string | null
          message: string | null
          notes: string | null
          preferred_contact_method: string | null
          priority: string
          recipient_email: string
          reference_number: string | null
          sender_country: string | null
          sender_email: string | null
          sender_name: string | null
          sender_organization: string | null
          sender_phone: string | null
          service: string | null
          source: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          department?: string | null
          email_status?: string | null
          fields?: Json
          first_response_at?: string | null
          form_type: string
          id?: string
          inquiry_type?: string | null
          message?: string | null
          notes?: string | null
          preferred_contact_method?: string | null
          priority?: string
          recipient_email: string
          reference_number?: string | null
          sender_country?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sender_organization?: string | null
          sender_phone?: string | null
          service?: string | null
          source?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          department?: string | null
          email_status?: string | null
          fields?: Json
          first_response_at?: string | null
          form_type?: string
          id?: string
          inquiry_type?: string | null
          message?: string | null
          notes?: string | null
          preferred_contact_method?: string | null
          priority?: string
          recipient_email?: string
          reference_number?: string | null
          sender_country?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sender_organization?: string | null
          sender_phone?: string | null
          service?: string | null
          source?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      generated_articles: {
        Row: {
          author: string
          body: Json
          continent: string
          created_at: string
          id: string
          image_url: string
          published_date: string
          region: string
          slug: string
          summary: string
          tag: string
          title: string
        }
        Insert: {
          author?: string
          body: Json
          continent: string
          created_at?: string
          id?: string
          image_url: string
          published_date: string
          region: string
          slug: string
          summary: string
          tag: string
          title: string
        }
        Update: {
          author?: string
          body?: Json
          continent?: string
          created_at?: string
          id?: string
          image_url?: string
          published_date?: string
          region?: string
          slug?: string
          summary?: string
          tag?: string
          title?: string
        }
        Relationships: []
      }
      globe_markers: {
        Row: {
          created_at: string
          description: string | null
          href: string | null
          id: string
          is_active: boolean
          kind: string
          label: string
          latitude: number
          longitude: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          href?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          label: string
          latitude: number
          longitude: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          href?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          label?: string
          latitude?: number
          longitude?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inquiry_activity: {
        Row: {
          actor_id: string | null
          created_at: string
          detail: string | null
          event_type: string
          id: string
          metadata: Json | null
          submission_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          submission_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_activity_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          submission_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          submission_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_notes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      reply_links: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          last_used_at: string | null
          name: string | null
          submission_id: string
          token: string
          use_count: number
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          last_used_at?: string | null
          name?: string | null
          submission_id: string
          token: string
          use_count?: number
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          last_used_at?: string | null
          name?: string | null
          submission_id?: string
          token?: string
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "reply_links_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      reply_templates: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          department: string | null
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      submission_messages: {
        Row: {
          body_text: string
          created_at: string
          direction: string
          error_message: string | null
          from_email: string
          from_label: string | null
          id: string
          message_id: string | null
          reply_to: string | null
          sent_by: string | null
          status: string
          subject: string
          submission_id: string
          to_email: string
        }
        Insert: {
          body_text: string
          created_at?: string
          direction: string
          error_message?: string | null
          from_email: string
          from_label?: string | null
          id?: string
          message_id?: string | null
          reply_to?: string | null
          sent_by?: string | null
          status?: string
          subject: string
          submission_id: string
          to_email: string
        }
        Update: {
          body_text?: string
          created_at?: string
          direction?: string
          error_message?: string | null
          from_email?: string
          from_label?: string | null
          id?: string
          message_id?: string | null
          reply_to?: string | null
          sent_by?: string | null
          status?: string
          subject?: string
          submission_id?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_messages_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
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
      is_staff_manager_or_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "manager" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user", "manager", "staff"],
    },
  },
} as const
