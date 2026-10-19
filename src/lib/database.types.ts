
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "achievements": {
                  Row: {
                    "code": string,"couple_id": string,"unlocked_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"couple_id": string,"unlocked_at"?: string
                  }
                  Update: {
                    "code"?: string,"couple_id"?: string,"unlocked_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "achievements_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    }
                  ]
                },"check_ins": {
                  Row: {
                    "couple_id": string,"created_at": string,"id": string,"local_date": string,"streak_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "couple_id": string,"created_at"?: string,"id"?: string,"local_date": string,"streak_id": string,"user_id": string
                  }
                  Update: {
                    "couple_id"?: string,"created_at"?: string,"id"?: string,"local_date"?: string,"streak_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "check_ins_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "check_ins_streak_id_fkey"
      columns: ["streak_id"]
isOneToOne: false
      referencedRelation: "streaks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "check_ins_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"couple_days": {
                  Row: {
                    "couple_id": string,"flame_all": boolean,"local_date": string,"sky_all": boolean,"state": string,"streak_after": number
                  }
                  ComputedFields: never
                  Insert: {
                    "couple_id": string,"flame_all": boolean,"local_date": string,"sky_all": boolean,"state": string,"streak_after": number
                  }
                  Update: {
                    "couple_id"?: string,"flame_all"?: boolean,"local_date"?: string,"sky_all"?: boolean,"state"?: string,"streak_after"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "couple_days_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    }
                  ]
                },"couple_members": {
                  Row: {
                    "color": string,"couple_id": string,"joined_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color": string,"couple_id": string,"joined_at"?: string,"user_id": string
                  }
                  Update: {
                    "color"?: string,"couple_id"?: string,"joined_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "couple_members_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "couple_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"couples": {
                  Row: {
                    "best_streak": number,"closed_through": string,"created_at": string,"freezes": number,"id": string,"invite_code": string,"paired_at": string | null,"timezone": string
                  }
                  ComputedFields: never
                  Insert: {
                    "best_streak"?: number,"closed_through": string,"created_at"?: string,"freezes"?: number,"id"?: string,"invite_code": string,"paired_at"?: string | null,"timezone": string
                  }
                  Update: {
                    "best_streak"?: number,"closed_through"?: string,"created_at"?: string,"freezes"?: number,"id"?: string,"invite_code"?: string,"paired_at"?: string | null,"timezone"?: string
                  }
                  Relationships: [
                    
                  ]
                },"freeze_uses": {
                  Row: {
                    "couple_id": string,"created_at": string,"local_date": string,"streak_id": string,"used_by": string
                  }
                  ComputedFields: never
                  Insert: {
                    "couple_id": string,"created_at"?: string,"local_date": string,"streak_id": string,"used_by": string
                  }
                  Update: {
                    "couple_id"?: string,"created_at"?: string,"local_date"?: string,"streak_id"?: string,"used_by"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "freeze_uses_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "freeze_uses_streak_id_fkey"
      columns: ["streak_id"]
isOneToOne: false
      referencedRelation: "streaks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "freeze_uses_used_by_fkey"
      columns: ["used_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"nudges": {
                  Row: {
                    "body": string | null,"couple_id": string,"created_at": string,"from_user": string,"id": string,"kind": string,"streak_id": string | null,"to_user": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string | null,"couple_id": string,"created_at"?: string,"from_user": string,"id"?: string,"kind": string,"streak_id"?: string | null,"to_user": string
                  }
                  Update: {
                    "body"?: string | null,"couple_id"?: string,"created_at"?: string,"from_user"?: string,"id"?: string,"kind"?: string,"streak_id"?: string | null,"to_user"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "nudges_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "nudges_from_user_fkey"
      columns: ["from_user"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "nudges_streak_id_fkey"
      columns: ["streak_id"]
isOneToOne: false
      referencedRelation: "streaks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "nudges_to_user_fkey"
      columns: ["to_user"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_seed": string | null,"avatar_style": string | null,"created_at": string,"id": string,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_seed"?: string | null,"avatar_style"?: string | null,"created_at"?: string,"id": string,"name": string
                  }
                  Update: {
                    "avatar_seed"?: string | null,"avatar_style"?: string | null,"created_at"?: string,"id"?: string,"name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"push_subscriptions": {
                  Row: {
                    "auth": string,"created_at": string,"endpoint": string,"p256dh": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "auth": string,"created_at"?: string,"endpoint": string,"p256dh": string,"user_id": string
                  }
                  Update: {
                    "auth"?: string,"created_at"?: string,"endpoint"?: string,"p256dh"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "push_subscriptions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"reminders_sent": {
                  Row: {
                    "local_date": string,"streak_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "local_date": string,"streak_id": string,"user_id": string
                  }
                  Update: {
                    "local_date"?: string,"streak_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reminders_sent_streak_id_fkey"
      columns: ["streak_id"]
isOneToOne: false
      referencedRelation: "streaks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reminders_sent_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"streak_counters": {
                  Row: {
                    "best": number,"current": number,"streak_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "best"?: number,"current"?: number,"streak_id": string,"user_id": string
                  }
                  Update: {
                    "best"?: number,"current"?: number,"streak_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "streak_counters_streak_id_fkey"
      columns: ["streak_id"]
isOneToOne: false
      referencedRelation: "streaks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "streak_counters_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"streak_days": {
                  Row: {
                    "done": boolean,"local_date": string,"protected": boolean,"streak_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "done": boolean,"local_date": string,"protected"?: boolean,"streak_id": string,"user_id": string
                  }
                  Update: {
                    "done"?: boolean,"local_date"?: string,"protected"?: boolean,"streak_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "streak_days_streak_id_fkey"
      columns: ["streak_id"]
isOneToOne: false
      referencedRelation: "streaks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "streak_days_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"streaks": {
                  Row: {
                    "archived_at": string | null,"archived_on": string | null,"closed_through": string,"couple_id": string,"created_at": string,"created_by": string,"deadline": string,"frequency": string,"icon": string,"id": string,"mode": string,"name": string,"pending_deadline": string | null,"pending_from": string | null,"reminder": boolean,"start_date": string,"weekly_target": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"archived_on"?: string | null,"closed_through": string,"couple_id": string,"created_at"?: string,"created_by": string,"deadline"?: string,"frequency": string,"icon": string,"id"?: string,"mode": string,"name": string,"pending_deadline"?: string | null,"pending_from"?: string | null,"reminder"?: boolean,"start_date": string,"weekly_target"?: number | null
                  }
                  Update: {
                    "archived_at"?: string | null,"archived_on"?: string | null,"closed_through"?: string,"couple_id"?: string,"created_at"?: string,"created_by"?: string,"deadline"?: string,"frequency"?: string,"icon"?: string,"id"?: string,"mode"?: string,"name"?: string,"pending_deadline"?: string | null,"pending_from"?: string | null,"reminder"?: boolean,"start_date"?: string,"weekly_target"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "streaks_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "streaks_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "couple_sparks": {
                  Row: {
                    "couple_id": string | null,"sparks": number | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "check_ins_couple_id_fkey"
      columns: ["couple_id"]
isOneToOne: false
      referencedRelation: "couples"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "check_ins_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "app_now":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"call_push":
{ Args: { "p_payload": Json }; Returns: undefined
                           },
"claim_reminders":
{ Args: Record<PropertyKey, never>; Returns: {
              "at_stake": number,"streak_id": string,"streak_name": string,"user_id": string
            }[]
                           },
"close_couple_day":
{ Args: { "c": Omit<Database["public"]['Tables']["couples"]['Row'], Database["public"]['Tables']["couples"]['ComputedFields']>,"d": string,"p_flame": string,"p_sky": string }; Returns: undefined
                           },
"close_due_days":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"close_streak_day":
{ Args: { "d": string,"p_flame": string,"p_sky": string,"s": Omit<Database["public"]['Tables']["streaks"]['Row'], Database["public"]['Tables']["streaks"]['ComputedFields']> }; Returns: undefined
                           },
"couple_now":
{ Args: { "p_couple": string }; Returns: string
                           },
"create_couple":
{ Args: { "p_timezone": string }; Returns: {
              "best_streak": number,
"closed_through": string,
"created_at": string,
"freezes": number,
"id": string,
"invite_code": string,
"paired_at": string | null,
"timezone": string
            }
                          SetofOptions: {
        from: "*"
        to: "couples"
        isOneToOne: true
        isSetofReturn: false
      } },
"deadline_on":
{ Args: { "d": string,"s": Omit<Database["public"]['Tables']["streaks"]['Row'], Database["public"]['Tables']["streaks"]['ComputedFields']> }; Returns: string
                           },
"is_due":
{ Args: { "d": string,"s": Omit<Database["public"]['Tables']["streaks"]['Row'], Database["public"]['Tables']["streaks"]['ComputedFields']> }; Returns: boolean
                           },
"is_member":
{ Args: { "p_couple": string }; Returns: boolean
                           },
"is_partner":
{ Args: { "p_user": string }; Returns: boolean
                           },
"join_couple":
{ Args: { "p_code": string }; Returns: {
              "best_streak": number,
"closed_through": string,
"created_at": string,
"freezes": number,
"id": string,
"invite_code": string,
"paired_at": string | null,
"timezone": string
            }
                          SetofOptions: {
        from: "*"
        to: "couples"
        isOneToOne: true
        isSetofReturn: false
      } },
"month_calendar":
{ Args: { "p_month": number,"p_year": number }; Returns: Json
                           },
"my_couple":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"send_nudge":
{ Args: { "p_body"?: string,"p_kind"?: string,"p_streak": string }; Returns: {
              "body": string | null,
"couple_id": string,
"created_at": string,
"from_user": string,
"id": string,
"kind": string,
"streak_id": string | null,
"to_user": string
            }
                          SetofOptions: {
        from: "*"
        to: "nudges"
        isOneToOne: true
        isSetofReturn: false
      } },
"set_timezone":
{ Args: { "p_timezone": string }; Returns: undefined
                           },
"today_state":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"unlock":
{ Args: { "p_code": string,"p_couple": string }; Returns: undefined
                           },
"use_freeze":
{ Args: { "p_streak": string }; Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
