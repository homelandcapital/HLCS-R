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
      community_project_interest_messages: {
        Row: {
          content: string
          id: string
          interest_id: string
          sender_id: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          interest_id: string
          sender_id?: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          interest_id?: string
          sender_id?: string | null
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_project_interest_messages_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "community_project_interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_project_interest_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_project_interests: {
        Row: {
          created_at: string
          id: string
          lga_name: string | null
          location_type: string | null
          message: string | null
          project_id: string | null
          project_title: string | null
          selected_budget_tier: string
          state_capital: string | null
          status: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lga_name?: string | null
          location_type?: string | null
          message?: string | null
          project_id?: string | null
          project_title?: string | null
          selected_budget_tier: string
          state_capital?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lga_name?: string | null
          location_type?: string | null
          message?: string | null
          project_id?: string | null
          project_title?: string | null
          selected_budget_tier?: string
          state_capital?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_project_interests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "community_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_project_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_projects: {
        Row: {
          brochure_link: string | null
          budget_tier: string[] | null
          category: string
          created_at: string
          description: string
          human_readable_id: string
          id: string
          images: Json | null
          managed_by_user_id: string | null
          status: Database["public"]["Enums"]["community_project_status_enum"]
          title: string
          updated_at: string
        }
        Insert: {
          brochure_link?: string | null
          budget_tier?: string[] | null
          category: string
          created_at?: string
          description: string
          human_readable_id: string
          id?: string
          images?: Json | null
          managed_by_user_id?: string | null
          status?: Database["public"]["Enums"]["community_project_status_enum"]
          title: string
          updated_at?: string
        }
        Update: {
          brochure_link?: string | null
          budget_tier?: string[] | null
          category?: string
          created_at?: string
          description?: string
          human_readable_id?: string
          id?: string
          images?: Json | null
          managed_by_user_id?: string | null
          status?: Database["public"]["Enums"]["community_project_status_enum"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_projects_managed_by_user_id_fkey"
            columns: ["managed_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      development_project_interest_messages: {
        Row: {
          content: string
          id: string
          interest_id: string
          sender_id: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          interest_id: string
          sender_id?: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          interest_id?: string
          sender_id?: string | null
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_project_interest_messages_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "development_project_interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_project_interest_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      development_project_interests: {
        Row: {
          created_at: string
          id: string
          lga_name: string | null
          location_type: string | null
          message: string | null
          project_id: string | null
          project_title: string | null
          selected_budget_tier: string | null
          state_capital: string | null
          status: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lga_name?: string | null
          location_type?: string | null
          message?: string | null
          project_id?: string | null
          project_title?: string | null
          selected_budget_tier?: string | null
          state_capital?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lga_name?: string | null
          location_type?: string | null
          message?: string | null
          project_id?: string | null
          project_title?: string | null
          selected_budget_tier?: string | null
          state_capital?: string | null
          status?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "development_project_interests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "development_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_project_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      development_projects: {
        Row: {
          brochure_link: string | null
          category: string
          created_at: string
          description: string
          human_readable_id: string
          id: string
          images: Json | null
          location_area_city: string | null
          managed_by_user_id: string | null
          price: number | null
          state: Database["public"]["Enums"]["nigerian_state_enum"]
          status: Database["public"]["Enums"]["community_project_status_enum"]
          title: string
          updated_at: string
        }
        Insert: {
          brochure_link?: string | null
          category: string
          created_at?: string
          description: string
          human_readable_id: string
          id?: string
          images?: Json | null
          location_area_city?: string | null
          managed_by_user_id?: string | null
          price?: number | null
          state: Database["public"]["Enums"]["nigerian_state_enum"]
          status?: Database["public"]["Enums"]["community_project_status_enum"]
          title: string
          updated_at?: string
        }
        Update: {
          brochure_link?: string | null
          category?: string
          created_at?: string
          description?: string
          human_readable_id?: string
          id?: string
          images?: Json | null
          location_area_city?: string | null
          managed_by_user_id?: string | null
          price?: number | null
          state?: Database["public"]["Enums"]["nigerian_state_enum"]
          status?: Database["public"]["Enums"]["community_project_status_enum"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_projects_managed_by_user_id_fkey"
            columns: ["managed_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          id: string
          initial_message: string
          inquirer_email: string
          inquirer_name: string
          inquirer_phone: string | null
          property_id: string
          property_name: string
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          initial_message: string
          inquirer_email: string
          inquirer_name: string
          inquirer_phone?: string | null
          property_id: string
          property_name: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          initial_message?: string
          inquirer_email?: string
          inquirer_name?: string
          inquirer_phone?: string | null
          property_id?: string
          property_name?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inquiry_messages: {
        Row: {
          content: string
          id: string
          inquiry_id: string
          sender_id: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          inquiry_id: string
          sender_id?: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          inquiry_id?: string
          sender_id?: string | null
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      machinery: {
        Row: {
          agent_id: string | null
          category: string
          condition: Database["public"]["Enums"]["machinery_condition_enum"]
          created_at: string
          description: string
          human_readable_id: string
          id: string
          images: Json | null
          listing_type: Database["public"]["Enums"]["listing_type_enum"]
          location_city: string
          manufacturer: string | null
          model: string | null
          price: number
          rejection_reason: string | null
          specifications: Json | null
          state: Database["public"]["Enums"]["nigerian_state_enum"]
          status: Database["public"]["Enums"]["property_status_enum"]
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          agent_id?: string | null
          category: string
          condition: Database["public"]["Enums"]["machinery_condition_enum"]
          created_at?: string
          description: string
          human_readable_id: string
          id?: string
          images?: Json | null
          listing_type?: Database["public"]["Enums"]["listing_type_enum"]
          location_city: string
          manufacturer?: string | null
          model?: string | null
          price: number
          rejection_reason?: string | null
          specifications?: Json | null
          state: Database["public"]["Enums"]["nigerian_state_enum"]
          status?: Database["public"]["Enums"]["property_status_enum"]
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          agent_id?: string | null
          category?: string
          condition?: Database["public"]["Enums"]["machinery_condition_enum"]
          created_at?: string
          description?: string
          human_readable_id?: string
          id?: string
          images?: Json | null
          listing_type?: Database["public"]["Enums"]["listing_type_enum"]
          location_city?: string
          manufacturer?: string | null
          model?: string | null
          price?: number
          rejection_reason?: string | null
          specifications?: Json | null
          state?: Database["public"]["Enums"]["nigerian_state_enum"]
          status?: Database["public"]["Enums"]["property_status_enum"]
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "machinery_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      machinery_inquiries: {
        Row: {
          created_at: string
          id: string
          initial_message: string
          inquirer_email: string
          inquirer_name: string
          inquirer_phone: string | null
          machinery_id: string
          machinery_title: string
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          initial_message: string
          inquirer_email: string
          inquirer_name: string
          inquirer_phone?: string | null
          machinery_id: string
          machinery_title: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          initial_message?: string
          inquirer_email?: string
          inquirer_name?: string
          inquirer_phone?: string | null
          machinery_id?: string
          machinery_title?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machinery_inquiries_machinery_id_fkey"
            columns: ["machinery_id"]
            isOneToOne: false
            referencedRelation: "machinery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machinery_inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      machinery_inquiry_messages: {
        Row: {
          content: string
          id: string
          inquiry_id: string
          sender_id: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          inquiry_id: string
          sender_id?: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          inquiry_id?: string
          sender_id?: string | null
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "machinery_inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "machinery_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machinery_inquiry_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      machinery_request_messages: {
        Row: {
          content: string
          id: string
          request_id: string
          sender_id: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          request_id: string
          sender_id?: string | null
          sender_name: string
          sender_role: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          request_id?: string
          sender_id?: string | null
          sender_name?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "machinery_request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "machinery_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machinery_request_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      machinery_requests: {
        Row: {
          created_at: string
          id: string
          machinery_category: string | null
          machinery_title: string
          message: string | null
          status: Database["public"]["Enums"]["machinery_request_status_enum"]
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          machinery_category?: string | null
          machinery_title: string
          message?: string | null
          status?: Database["public"]["Enums"]["machinery_request_status_enum"]
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          machinery_category?: string | null
          machinery_title?: string
          message?: string | null
          status?: Database["public"]["Enums"]["machinery_request_status_enum"]
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machinery_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      page_content: {
        Row: {
          content: Json
          page_id: string
          updated_at: string
        }
        Insert: {
          content: Json
          page_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          page_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          community_project_categories: string | null
          configured_community_budget_tiers: string | null
          default_currency: string | null
          development_project_categories: string | null
          id: number
          machinery_categories: string | null
          maintenance_mode: boolean | null
          notification_email: string | null
          predefined_amenities: string | null
          promotion_tiers: Json | null
          promotions_enabled: boolean | null
          property_types: string[] | null
          sector_visibility: Json | null
          site_name: string | null
          updated_at: string
        }
        Insert: {
          community_project_categories?: string | null
          configured_community_budget_tiers?: string | null
          default_currency?: string | null
          development_project_categories?: string | null
          id?: number
          machinery_categories?: string | null
          maintenance_mode?: boolean | null
          notification_email?: string | null
          predefined_amenities?: string | null
          promotion_tiers?: Json | null
          promotions_enabled?: boolean | null
          property_types?: string[] | null
          sector_visibility?: Json | null
          site_name?: string | null
          updated_at?: string
        }
        Update: {
          community_project_categories?: string | null
          configured_community_budget_tiers?: string | null
          default_currency?: string | null
          development_project_categories?: string | null
          id?: number
          machinery_categories?: string | null
          maintenance_mode?: boolean | null
          notification_email?: string | null
          predefined_amenities?: string | null
          promotion_tiers?: Json | null
          promotions_enabled?: boolean | null
          property_types?: string[] | null
          sector_visibility?: Json | null
          site_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          agent_id: string | null
          amenities: Json | null
          area_sq_ft: number | null
          bathrooms: number
          bedrooms: number
          coordinates_lat: number | null
          coordinates_lng: number | null
          created_at: string
          description: string
          human_readable_id: string | null
          id: string
          images: Json | null
          is_promoted: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type_enum"]
          location_area_city: string
          price: number
          promoted_at: string | null
          promotion_expires_at: string | null
          promotion_tier_id: string | null
          promotion_tier_name: string | null
          property_type: string
          rejection_reason: string | null
          state: Database["public"]["Enums"]["nigerian_state_enum"]
          status: Database["public"]["Enums"]["property_status_enum"]
          title: string
          updated_at: string
          year_built: number | null
        }
        Insert: {
          address: string
          agent_id?: string | null
          amenities?: Json | null
          area_sq_ft?: number | null
          bathrooms?: number
          bedrooms?: number
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string
          description: string
          human_readable_id?: string | null
          id?: string
          images?: Json | null
          is_promoted?: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type_enum"]
          location_area_city: string
          price: number
          promoted_at?: string | null
          promotion_expires_at?: string | null
          promotion_tier_id?: string | null
          promotion_tier_name?: string | null
          property_type: string
          rejection_reason?: string | null
          state: Database["public"]["Enums"]["nigerian_state_enum"]
          status?: Database["public"]["Enums"]["property_status_enum"]
          title: string
          updated_at?: string
          year_built?: number | null
        }
        Update: {
          address?: string
          agent_id?: string | null
          amenities?: Json | null
          area_sq_ft?: number | null
          bathrooms?: number
          bedrooms?: number
          coordinates_lat?: number | null
          coordinates_lng?: number | null
          created_at?: string
          description?: string
          human_readable_id?: string | null
          id?: string
          images?: Json | null
          is_promoted?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type_enum"]
          location_area_city?: string
          price?: number
          promoted_at?: string | null
          promotion_expires_at?: string | null
          promotion_tier_id?: string | null
          promotion_tier_name?: string | null
          property_type?: string
          rejection_reason?: string | null
          state?: Database["public"]["Enums"]["nigerian_state_enum"]
          status?: Database["public"]["Enums"]["property_status_enum"]
          title?: string
          updated_at?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_properties: {
        Row: {
          created_at: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          agency: string | null
          avatar_url: string | null
          banned_until: string | null
          created_at: string
          email: string
          government_id_url: string | null
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          agency?: string | null
          avatar_url?: string | null
          banned_until?: string | null
          created_at?: string
          email: string
          government_id_url?: string | null
          id: string
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          agency?: string | null
          avatar_url?: string | null
          banned_until?: string | null
          created_at?: string
          email?: string
          government_id_url?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      community_project_status_enum:
        | "Planning"
        | "Funding"
        | "Ongoing"
        | "Completed"
        | "On Hold"
        | "Canceled"
        | "Pending Approval"
        | "Rejected"
      inquiry_status: "new" | "contacted" | "resolved" | "archived"
      listing_type_enum: "For Sale" | "For Rent" | "For Lease"
      machinery_condition_enum: "New" | "Used" | "Refurbished"
      machinery_request_status_enum: "new" | "contacted" | "resolved"
      nigerian_state_enum:
        | "Abia"
        | "Adamawa"
        | "Akwa Ibom"
        | "Anambra"
        | "Bauchi"
        | "Bayelsa"
        | "Benue"
        | "Borno"
        | "Cross River"
        | "Delta"
        | "Ebonyi"
        | "Edo"
        | "Ekiti"
        | "Enugu"
        | "Gombe"
        | "Imo"
        | "Jigawa"
        | "Kaduna"
        | "Kano"
        | "Katsina"
        | "Kebbi"
        | "Kogi"
        | "Kwara"
        | "Lagos"
        | "Nasarawa"
        | "Niger"
        | "Ogun"
        | "Ondo"
        | "Osun"
        | "Oyo"
        | "Plateau"
        | "Rivers"
        | "Sokoto"
        | "Taraba"
        | "Yobe"
        | "Zamfara"
        | "FCT"
      property_status_enum: "pending" | "approved" | "rejected"
      property_type_enum: "House" | "Apartment" | "Condo" | "Townhouse" | "Land"
      user_role: "agent" | "user" | "platform_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? I
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      community_project_status_enum: [
        "Planning",
        "Funding",
        "Ongoing",
        "Completed",
        "On Hold",
        "Canceled",
        "Pending Approval",
        "Rejected",
      ],
      inquiry_status: ["new", "contacted", "resolved", "archived"],
      listing_type_enum: ["For Sale", "For Rent", "For Lease"],
      machinery_condition_enum: ["New", "Used", "Refurbished"],
      machinery_request_status_enum: ["new", "contacted", "resolved"],
      nigerian_state_enum: [
        "Abia",
        "Adamawa",
        "Akwa Ibom",
        "Anambra",
        "Bauchi",
        "Bayelsa",
        "Benue",
        "Borno",
        "Cross River",
        "Delta",
        "Ebonyi",
        "Edo",
        "Ekiti",
        "Enugu",
        "Gombe",
        "Imo",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Kogi",
        "Kwara",
        "Lagos",
        "Nasarawa",
        "Niger",
        "Ogun",
        "Ondo",
        "Osun",
        "Oyo",
        "Plateau",
        "Rivers",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara",
        "FCT",
      ],
      property_status_enum: ["pending", "approved", "rejected"],
      property_type_enum: ["House", "Apartment", "Condo", "Townhouse", "Land"],
      user_role: ["agent", "user", "platform_admin"],
    },
  },
} as const
