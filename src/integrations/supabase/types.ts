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
      attendance: {
        Row: {
          class_subject: string
          class_type: string
          date: string
          id: string
          location: string | null
          marked_at: string
          marked_by: string | null
          qr_code_id: string | null
          status: string
          time_slot: string
          user_id: string
        }
        Insert: {
          class_subject: string
          class_type: string
          date: string
          id?: string
          location?: string | null
          marked_at?: string
          marked_by?: string | null
          qr_code_id?: string | null
          status: string
          time_slot: string
          user_id: string
        }
        Update: {
          class_subject?: string
          class_type?: string
          date?: string
          id?: string
          location?: string | null
          marked_at?: string
          marked_by?: string | null
          qr_code_id?: string | null
          status?: string
          time_slot?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_qr_codes: {
        Row: {
          class_subject: string
          class_type: string
          code: string
          created_at: string
          date: string
          expires_at: string
          id: string
          is_active: boolean | null
          location: string | null
          teacher_id: string
          time_slot: string
        }
        Insert: {
          class_subject: string
          class_type: string
          code: string
          created_at?: string
          date: string
          expires_at: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          teacher_id: string
          time_slot: string
        }
        Update: {
          class_subject?: string
          class_type?: string
          code?: string
          created_at?: string
          date?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          teacher_id?: string
          time_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_qr_codes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attendance_status: string | null
          event_id: string
          id: string
          registration_date: string
          user_id: string
        }
        Insert: {
          attendance_status?: string | null
          event_id: string
          id?: string
          registration_date?: string
          user_id: string
        }
        Update: {
          attendance_status?: string | null
          event_id?: string
          id?: string
          registration_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          capacity: number | null
          created_at: string
          description: string | null
          end_date: string
          event_type: string
          id: string
          location: string | null
          organizer_id: string
          registered_count: number | null
          registration_deadline: string | null
          registration_required: boolean | null
          start_date: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          location?: string | null
          organizer_id: string
          registered_count?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          capacity?: number | null
          created_at?: string
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          location?: string | null
          organizer_id?: string
          registered_count?: number | null
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string | null
          amenities: string[] | null
          capacity: number
          created_at: string
          current_occupancy: number | null
          id: string
          name: string
          type: string
          updated_at: string
          warden_id: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          capacity: number
          created_at?: string
          current_occupancy?: number | null
          id?: string
          name: string
          type: string
          updated_at?: string
          warden_id?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          current_occupancy?: number | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          warden_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostels_warden_id_fkey"
            columns: ["warden_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          hostel_id: string | null
          id: string
          phone: string | null
          role: string | null
          room_number: string | null
          student_id: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          hostel_id?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          room_number?: string | null
          student_id?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          hostel_id?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          room_number?: string | null
          student_id?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_hostel"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          current_occupancy: number | null
          hostel_id: string
          id: string
          rent_per_month: number | null
          room_number: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity: number
          created_at?: string
          current_occupancy?: number | null
          hostel_id: string
          id?: string
          rent_per_month?: number | null
          room_number: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          current_occupancy?: number | null
          hostel_id?: string
          id?: string
          rent_per_month?: number | null
          room_number?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
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
