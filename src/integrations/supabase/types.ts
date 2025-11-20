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
      admin_whitelist: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_url: string
          grade: number | null
          id: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_url: string
          grade?: number | null
          id?: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_url?: string
          grade?: number | null
          id?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          session_id: string | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          session_id?: string | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          session_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: []
      }
      company_request_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          request_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          request_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          request_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_request_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "company_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_requests: {
        Row: {
          admin_notes: string | null
          budget: number | null
          company_id: string
          created_at: string
          delivery_mode: Database["public"]["Enums"]["delivery_mode"] | null
          description: string
          duration_weeks: number | null
          employee_count: number | null
          id: string
          project_type: Database["public"]["Enums"]["project_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget?: number | null
          company_id: string
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"] | null
          description: string
          duration_weeks?: number | null
          employee_count?: number | null
          id?: string
          project_type: Database["public"]["Enums"]["project_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget?: number | null
          company_id?: string
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"] | null
          description?: string
          duration_weeks?: number | null
          employee_count?: number | null
          id?: string
          project_type?: Database["public"]["Enums"]["project_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_materials: {
        Row: {
          course_id: string
          file_type: string
          file_url: string
          id: string
          session_id: string | null
          title: string
          uploaded_at: string
        }
        Insert: {
          course_id: string
          file_type: string
          file_url: string
          id?: string
          session_id?: string | null
          title: string
          uploaded_at?: string
        }
        Update: {
          course_id?: string
          file_type?: string
          file_url?: string
          id?: string
          session_id?: string | null
          title?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_materials_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          course_id: string
          created_at: string
          duration_minutes: number
          id: string
          location: string | null
          session_date: string
          title: string
          zoom_link: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          session_date: string
          title: string
          zoom_link?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          session_date?: string
          title?: string
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          description: string | null
          duration_hours: number | null
          id: string
          instructor_id: string
          price: number | null
          status: Database["public"]["Enums"]["course_status"]
          thumbnail_url: string | null
          title: string
          total_sessions: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id: string
          price?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
          title: string
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string
          price?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
          title?: string
          total_sessions?: number
          updated_at?: string
        }
        Relationships: []
      }
      discussions: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          parent_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          id?: string
          parent_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_applications: {
        Row: {
          bio: string
          created_at: string
          cv_url: string | null
          email: string
          expertise: string
          full_name: string
          id: string
          linkedin_url: string | null
          notes: string | null
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          bio: string
          created_at?: string
          cv_url?: string | null
          email: string
          expertise: string
          full_name: string
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string
          created_at?: string
          cv_url?: string | null
          email?: string
          expertise?: string
          full_name?: string
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          company_request_id: string | null
          course_session_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          host_id: string | null
          id: string
          meeting_mode: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          scheduled_at: string
          title: string
          updated_at: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_start_url: string | null
        }
        Insert: {
          company_request_id?: string | null
          course_session_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          meeting_mode?: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          scheduled_at: string
          title: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_url?: string | null
        }
        Update: {
          company_request_id?: string | null
          course_session_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          meeting_mode?: string | null
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          scheduled_at?: string
          title?: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_start_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_company_request_id_fkey"
            columns: ["company_request_id"]
            isOneToOne: false
            referencedRelation: "company_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_course_session_id_fkey"
            columns: ["course_session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          expertise: string | null
          full_name: string
          id: string
          phone: string | null
          student_status: Database["public"]["Enums"]["student_status"] | null
          university: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          expertise?: string | null
          full_name: string
          id: string
          phone?: string | null
          student_status?: Database["public"]["Enums"]["student_status"] | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          expertise?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          student_status?: Database["public"]["Enums"]["student_status"] | null
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          file_name: string
          file_url: string
          id: string
          request_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_url: string
          id?: string
          request_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_url?: string
          id?: string
          request_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "company_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      session_attendance: {
        Row: {
          attended: boolean
          course_id: string
          created_at: string
          id: string
          marked_at: string
          notes: string | null
          session_id: string
          student_id: string
        }
        Insert: {
          attended?: boolean
          course_id: string
          created_at?: string
          id?: string
          marked_at?: string
          notes?: string | null
          session_id: string
          student_id: string
        }
        Update: {
          attended?: boolean
          course_id?: string
          created_at?: string
          id?: string
          marked_at?: string
          notes?: string | null
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role_to_whitelisted_user: {
        Args: { target_email: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_email: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "instructor" | "company" | "admin"
      application_status: "pending" | "approved" | "rejected"
      audit_action:
        | "user_login"
        | "user_logout"
        | "user_signup"
        | "course_created"
        | "course_updated"
        | "course_deleted"
        | "request_approved"
        | "request_rejected"
        | "settings_changed"
        | "role_assigned"
      course_status: "draft" | "published" | "archived"
      delivery_mode: "online" | "offline" | "hybrid"
      meeting_type:
        | "course_session"
        | "company_consultation"
        | "company_training"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      project_type: "corporate_training" | "ai_data_analytics"
      request_status:
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
        | "completed"
      student_status: "current_student" | "graduated"
      transaction_type: "enrollment_payment" | "instructor_payout"
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
      app_role: ["student", "instructor", "company", "admin"],
      application_status: ["pending", "approved", "rejected"],
      audit_action: [
        "user_login",
        "user_logout",
        "user_signup",
        "course_created",
        "course_updated",
        "course_deleted",
        "request_approved",
        "request_rejected",
        "settings_changed",
        "role_assigned",
      ],
      course_status: ["draft", "published", "archived"],
      delivery_mode: ["online", "offline", "hybrid"],
      meeting_type: [
        "course_session",
        "company_consultation",
        "company_training",
      ],
      payment_status: ["pending", "paid", "failed", "refunded"],
      project_type: ["corporate_training", "ai_data_analytics"],
      request_status: [
        "pending",
        "in_review",
        "approved",
        "rejected",
        "completed",
      ],
      student_status: ["current_student", "graduated"],
      transaction_type: ["enrollment_payment", "instructor_payout"],
    },
  },
} as const
