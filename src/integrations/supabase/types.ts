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
      crop_profiles: {
        Row: {
          created_at: string
          device_id: string
          id: string
          is_active: boolean
          max_air_humidity: number
          max_air_temp: number
          max_ph: number
          max_tds: number
          max_water_temp: number
          min_air_humidity: number
          min_air_temp: number
          min_ph: number
          min_tds: number
          min_water_temp: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          is_active?: boolean
          max_air_humidity: number
          max_air_temp: number
          max_ph: number
          max_tds: number
          max_water_temp: number
          min_air_humidity: number
          min_air_temp: number
          min_ph: number
          min_tds: number
          min_water_temp: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          is_active?: boolean
          max_air_humidity?: number
          max_air_temp?: number
          max_ph?: number
          max_tds?: number
          max_water_temp?: number
          min_air_humidity?: number
          min_air_temp?: number
          min_ph?: number
          min_tds?: number
          min_water_temp?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_profiles_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string
          id: string
          last_seen: string | null
          location: string | null
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen?: string | null
          location?: string | null
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_seen?: string | null
          location?: string | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      relay_states: {
        Row: {
          air_circulation_relay: boolean
          created_at: string
          device_id: string
          humidity_relay: boolean
          id: string
          tds_relay: boolean
          timestamp: string
        }
        Insert: {
          air_circulation_relay?: boolean
          created_at?: string
          device_id: string
          humidity_relay?: boolean
          id?: string
          tds_relay?: boolean
          timestamp?: string
        }
        Update: {
          air_circulation_relay?: boolean
          created_at?: string
          device_id?: string
          humidity_relay?: boolean
          id?: string
          tds_relay?: boolean
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "relay_states_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          air_humidity: number
          air_temperature: number
          created_at: string
          device_id: string
          id: string
          ph: number
          tds: number
          timestamp: string
          water_temperature: number
        }
        Insert: {
          air_humidity: number
          air_temperature: number
          created_at?: string
          device_id: string
          id?: string
          ph: number
          tds: number
          timestamp?: string
          water_temperature: number
        }
        Update: {
          air_humidity?: number
          air_temperature?: number
          created_at?: string
          device_id?: string
          id?: string
          ph?: number
          tds?: number
          timestamp?: string
          water_temperature?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      latest_relay_states: {
        Row: {
          air_circulation_relay: boolean | null
          device_id: string | null
          humidity_relay: boolean | null
          id: string | null
          tds_relay: boolean | null
          timestamp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relay_states_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_sensor_readings: {
        Row: {
          air_humidity: number | null
          air_temperature: number | null
          device_id: string | null
          id: string | null
          ph: number | null
          tds: number | null
          timestamp: string | null
          water_temperature: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
