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
      gyms: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'coach' | 'client'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          role: 'admin' | 'coach' | 'client'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'coach' | 'client'
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          user_id: string
          gym_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gym_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          gym_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      coaches: {
        Row: {
          id: string
          user_id: string
          gym_id: string
          bio: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gym_id: string
          bio?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clients: {
        Row: {
          id: string
          user_id: string
          gym_id: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          height_cm: number | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gym_id: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height_cm?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height_cm?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      client_invitations: {
        Row: {
          id: string
          gym_id: string
          invited_by_user_id: string
          email: string
          token: string
          role: 'coach' | 'client'
          status: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at: string
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gym_id: string
          invited_by_user_id: string
          email: string
          token?: string
          role?: 'coach' | 'client'
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          expires_at?: string
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_assignments: {
        Row: {
          id: string
          client_id: string
          coach_id: string
          assigned_by_user_id: string
          started_at: string
          ended_at: string | null
          end_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          coach_id: string
          assigned_by_user_id: string
          started_at?: string
          ended_at?: string | null
          end_reason?: string | null
          created_at?: string
        }
        Update: {
          ended_at?: string | null
          end_reason?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          client_id: string
          gym_id: string
          plan_name: string
          price_paid: number
          currency: string
          start_date: string
          end_date: string
          payment_method: string | null
          payment_reference: string | null
          notes: string | null
          created_by_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          gym_id: string
          plan_name: string
          price_paid: number
          currency?: string
          start_date: string
          end_date: string
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          created_by_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          plan_name?: string
          price_paid?: number
          currency?: string
          start_date?: string
          end_date?: string
          payment_method?: string | null
          payment_reference?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      measurements: {
        Row: {
          id: string
          client_id: string
          recorded_by_user_id: string
          measured_at: string
          weight_kg: number | null
          body_fat_pct: number | null
          muscle_mass_kg: number | null
          chest_cm: number | null
          waist_cm: number | null
          hips_cm: number | null
          thigh_cm: number | null
          arm_cm: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          recorded_by_user_id: string
          measured_at?: string
          weight_kg?: number | null
          body_fat_pct?: number | null
          muscle_mass_kg?: number | null
          chest_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          thigh_cm?: number | null
          arm_cm?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          [key: string]: never
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          id: string
          client_id: string
          uploaded_by_user_id: string
          storage_path: string
          photo_type: 'front' | 'back' | 'side' | 'other' | null
          taken_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          uploaded_by_user_id: string
          storage_path: string
          photo_type?: 'front' | 'back' | 'side' | 'other' | null
          taken_at?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          photo_type?: 'front' | 'back' | 'side' | 'other' | null
          notes?: string | null
        }
        Relationships: []
      }
      coach_change_requests: {
        Row: {
          id: string
          client_id: string
          current_coach_id: string
          requested_coach_id: string | null
          reason: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          reviewed_by_user_id: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          current_coach_id: string
          requested_coach_id?: string | null
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          reviewed_by_user_id?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          reviewed_by_user_id?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          gym_id: string | null
          actor_user_id: string | null
          target_user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          gym_id?: string | null
          actor_user_id?: string | null
          target_user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          [key: string]: never
        }
        Relationships: []
      }
    }
    Views: {
      client_membership_status: {
        Row: {
          id: string
          client_id: string
          gym_id: string
          plan_name: string
          price_paid: number
          currency: string
          start_date: string
          end_date: string
          payment_method: string | null
          payment_reference: string | null
          notes: string | null
          created_by_user_id: string
          created_at: string
          updated_at: string
          status: 'active' | 'expired' | 'upcoming'
        }
        Relationships: []
      }
      active_coach_assignments: {
        Row: {
          id: string
          client_id: string
          coach_id: string
          assigned_by_user_id: string
          started_at: string
          ended_at: null
          end_reason: null
          created_at: string
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'coach' | 'client'
      membership_status: 'active' | 'expired' | 'upcoming'
      invitation_status: 'pending' | 'accepted' | 'expired' | 'cancelled'
      request_status: 'pending' | 'approved' | 'rejected' | 'cancelled'
      photo_type: 'front' | 'back' | 'side' | 'other'
      gender_type: 'male' | 'female' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Convenience type aliases ───────────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

// ─── Domain types ───────────────────────────────────────────────────────────

export type UserRow = Tables<'users'>
export type AdminRow = Tables<'admins'>
export type CoachRow = Tables<'coaches'>
export type ClientRow = Tables<'clients'>
export type MembershipRow = Tables<'memberships'>
export type MeasurementRow = Tables<'measurements'>
export type ProgressPhotoRow = Tables<'progress_photos'>
export type CoachAssignmentRow = Tables<'coach_assignments'>
export type CoachChangeRequestRow = Tables<'coach_change_requests'>
export type InvitationRow = Tables<'client_invitations'>
export type ActivityLogRow = Tables<'activity_logs'>
export type MembershipStatusRow = Views<'client_membership_status'>

export type UserRole = 'admin' | 'coach' | 'client'
export type MembershipStatus = 'active' | 'expired' | 'upcoming'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type PhotoType = 'front' | 'back' | 'side' | 'other'
