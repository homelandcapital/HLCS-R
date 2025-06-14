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
        ]
      }
      platform_settings: {
        Row: {
          default_currency: string | null
          id: number
          maintenance_mode: boolean | null
          notification_email: string | null
          predefined_amenities: string | null
          promotion_tiers: Json | null
          promotions_enabled: boolean | null
          property_types: string[] | null
          site_name: string | null
          updated_at: string
        }
        Insert: {
          default_currency?: string | null
          id?: number
          maintenance_mode?: boolean | null
          notification_email?: string | null
          predefined_amenities?: string | null
          promotion_tiers?: Json | null
          promotions_enabled?: boolean | null
          property_types?: string[] | null
          site_name?: string | null
          updated_at?: string
        }
        Update: {
          default_currency?: string | null
          id?: number
          maintenance_mode?: boolean | null
          notification_email?: string | null
          predefined_amenities?: string | null
          promotion_tiers?: Json | null
          promotions_enabled?: boolean | null
          property_types?: string[] | null
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
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
        }
        Insert: {
          agency?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Update: {
          agency?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
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
      inquiry_status: "new" | "contacted" | "resolved" | "archived"
      inquiry_status_enum: "new" | "contacted" | "resolved" | "archived"
      listing_type_enum: "For Sale" | "For Rent" | "For Lease"
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
      user_role_enum: "agent" | "user" | "platform_admin"
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
      ? U
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
      inquiry_status: ["new", "contacted", "resolved", "archived"],
      inquiry_status_enum: ["new", "contacted", "resolved", "archived"],
      listing_type_enum: ["For Sale", "For Rent", "For Lease"],
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
      user_role_enum: ["agent", "user", "platform_admin"],
    },
  },
} as const
