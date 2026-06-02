export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          city: string | null;
          state: string | null;
          education_level: string | null;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          city?: string | null;
          state?: string | null;
          education_level?: string | null;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          states: string[];
          cities: string[];
          radius_km: number;
          education_levels: string[];
          desired_roles: string[];
          areas: string[];
          min_salary: number | null;
          accepts_temporary: boolean;
          accepts_reserve_list: boolean;
          notification_channels: string[];
          notification_frequency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          states?: string[];
          cities?: string[];
          radius_km?: number;
          education_levels?: string[];
          desired_roles?: string[];
          areas?: string[];
          min_salary?: number | null;
          accepts_temporary?: boolean;
          accepts_reserve_list?: boolean;
          notification_channels?: string[];
          notification_frequency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_preferences"]["Insert"]>;
      };
      sources: {
        Row: {
          id: string;
          name: string;
          type: string;
          base_url: string;
          city: string | null;
          state: string | null;
          reliability_score: number;
          crawl_frequency: string;
          crawler_strategy: string;
          status: string;
          last_crawled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          base_url: string;
          city?: string | null;
          state?: string | null;
          reliability_score?: number;
          crawl_frequency?: string;
          crawler_strategy?: string;
          status?: string;
          last_crawled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sources"]["Insert"]>;
      };
      contests: {
        Row: {
          id: string;
          title: string;
          organization: string;
          city: string | null;
          state: string | null;
          board: string | null;
          status: string;
          official_url: string;
          source_id: string | null;
          confidence_score: number;
          publication_status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          organization: string;
          city?: string | null;
          state?: string | null;
          board?: string | null;
          status?: string;
          official_url: string;
          source_id?: string | null;
          confidence_score?: number;
          publication_status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contests"]["Insert"]>;
      };
      contest_roles: {
        Row: {
          id: string;
          contest_id: string;
          role_name: string;
          area: string | null;
          education_level: string | null;
          salary: number | null;
          salary_text: string | null;
          vacancies: number | null;
          reserve_list: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contest_id: string;
          role_name: string;
          area?: string | null;
          education_level?: string | null;
          salary?: number | null;
          salary_text?: string | null;
          vacancies?: number | null;
          reserve_list?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contest_roles"]["Insert"]>;
      };
      contest_dates: {
        Row: {
          id: string;
          contest_id: string;
          event_type: string;
          date_start: string | null;
          date_end: string | null;
          description: string | null;
          is_estimated: boolean;
          confidence_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contest_id: string;
          event_type: string;
          date_start?: string | null;
          date_end?: string | null;
          description?: string | null;
          is_estimated?: boolean;
          confidence_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contest_dates"]["Insert"]>;
      };
      saved_contests: {
        Row: {
          id: string;
          user_id: string;
          contest_id: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contest_id: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_contests"]["Insert"]>;
      };
      admin_users: {
        Row: {
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
