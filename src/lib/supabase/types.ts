export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type PublicTable<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: PublicTable<
        {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          city: string | null;
          state: string | null;
          latitude: number | null;
          longitude: number | null;
          education_level: string | null;
          subscription_status: string;
          terms_accepted_at: string | null;
          privacy_accepted_at: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          city?: string | null;
          state?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          education_level?: string | null;
          subscription_status?: string;
          terms_accepted_at?: string | null;
          privacy_accepted_at?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      user_preferences: PublicTable<
        {
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
          accepts_remote_or_other_city_exam: boolean;
          notification_channels: string[];
          notification_frequency: string;
          created_at: string;
          updated_at: string;
        },
        {
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
          accepts_remote_or_other_city_exam?: boolean;
          notification_channels?: string[];
          notification_frequency?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      admin_users: PublicTable<
        {
          user_id: string;
          role: "owner" | "admin";
          created_at: string;
        },
        {
          user_id: string;
          role?: "owner" | "admin";
          created_at?: string;
        }
      >;
      sources: PublicTable<
        {
          id: string;
          name: string;
          type: string;
          base_url: string;
          city: string | null;
          state: string | null;
          reliability_score: number;
          crawl_frequency: string | null;
          crawler_strategy: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          type: string;
          base_url: string;
          city?: string | null;
          state?: string | null;
          reliability_score?: number;
          crawl_frequency?: string | null;
          crawler_strategy?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      contests: PublicTable<
        {
          id: string;
          title: string;
          organization: string;
          sphere: string;
          city: string | null;
          state: string;
          latitude: number | null;
          longitude: number | null;
          board: string | null;
          status: string;
          official_url: string;
          source_id: string | null;
          summary: string | null;
          document_url: string | null;
          document_storage_path: string | null;
          confidence_score: number;
          publication_status: string;
          is_demo: boolean;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          title: string;
          organization: string;
          sphere?: string;
          city?: string | null;
          state: string;
          latitude?: number | null;
          longitude?: number | null;
          board?: string | null;
          status?: string;
          official_url: string;
          source_id?: string | null;
          summary?: string | null;
          document_url?: string | null;
          document_storage_path?: string | null;
          confidence_score?: number;
          publication_status?: string;
          is_demo?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      contest_roles: PublicTable<
        {
          id: string;
          contest_id: string;
          role_name: string;
          area: string | null;
          education_level: string | null;
          salary: number | null;
          salary_text: string | null;
          vacancies: number | null;
          reserve_list: boolean;
          workload: string | null;
          requirements: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          contest_id: string;
          role_name: string;
          area?: string | null;
          education_level?: string | null;
          salary?: number | null;
          salary_text?: string | null;
          vacancies?: number | null;
          reserve_list?: boolean;
          workload?: string | null;
          requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      contest_dates: PublicTable<
        {
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
        },
        {
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
        }
      >;
      saved_contests: PublicTable<
        {
          id: string;
          user_id: string;
          contest_id: string;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          contest_id: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      subscriptions: PublicTable<
        {
          id: string;
          user_id: string;
          provider: string;
          provider_subscription_id: string | null;
          status: "inactive" | "trialing" | "active" | "past_due" | "canceled" | "expired";
          plan: "radar_premium";
          trial_start: string | null;
          trial_end: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: "inactive" | "trialing" | "active" | "past_due" | "canceled" | "expired";
          plan?: "radar_premium";
          trial_start?: string | null;
          trial_end?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      audit_logs: PublicTable<
        {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before: Json | null;
          after: Json | null;
          created_at: string;
        },
        {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_owner: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
