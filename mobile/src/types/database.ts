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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          mensagem: string | null
          professional_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          mensagem?: string | null
          professional_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          mensagem?: string | null
          professional_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          ativa: boolean
          created_at: string
          grupo: string
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          grupo: string
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          grupo?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          hirer_id: string
          id: string
          job_id: string
          last_message_at: string | null
          professional_id: string
        }
        Insert: {
          created_at?: string
          hirer_id: string
          id?: string
          job_id: string
          last_message_at?: string | null
          professional_id: string
        }
        Update: {
          created_at?: string
          hirer_id?: string
          id?: string
          job_id?: string
          last_message_at?: string | null
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_hirer_id_fkey"
            columns: ["hirer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dados_pessoais: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          logradouro: string | null
          nome_completo: string | null
          numero: string | null
          profile_id: string
          telefone: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          logradouro?: string | null
          nome_completo?: string | null
          numero?: string | null
          profile_id: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          logradouro?: string | null
          nome_completo?: string | null
          numero?: string | null
          profile_id?: string
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dados_pessoais_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          expo_token: string
          id: string
          platform: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expo_token: string
          id?: string
          platform: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expo_token?: string
          id?: string
          platform?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hirer_profiles: {
        Row: {
          created_at: string
          empresa: string | null
          logo_url: string | null
          profile_id: string
          rating_avg: number | null
          rating_count: number
          site: string | null
          sobre: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa?: string | null
          logo_url?: string | null
          profile_id: string
          rating_avg?: number | null
          rating_count?: number
          site?: string | null
          sobre?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa?: string | null
          logo_url?: string | null
          profile_id?: string
          rating_avg?: number | null
          rating_count?: number
          site?: string | null
          sobre?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hirer_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          category_id: string
          cidade: string | null
          closed_at: string | null
          cover_url: string | null
          created_at: string
          descricao: string
          destacada_ate: string | null
          duracao_horas: number | null
          endereco_texto: string | null
          hirer_id: string
          id: string
          is_urgent: boolean
          pay_amount: number | null
          pay_type: Database["public"]["Enums"]["pay_type"]
          point: unknown
          published_at: string | null
          requires_invoice: boolean
          starts_at: string
          status: Database["public"]["Enums"]["job_status"]
          titulo: string
          uf: string | null
          updated_at: string
          vagas_qtd: number
        }
        Insert: {
          category_id: string
          cidade?: string | null
          closed_at?: string | null
          cover_url?: string | null
          created_at?: string
          descricao: string
          destacada_ate?: string | null
          duracao_horas?: number | null
          endereco_texto?: string | null
          hirer_id: string
          id?: string
          is_urgent?: boolean
          pay_amount?: number | null
          pay_type?: Database["public"]["Enums"]["pay_type"]
          point?: unknown
          published_at?: string | null
          requires_invoice?: boolean
          starts_at: string
          status?: Database["public"]["Enums"]["job_status"]
          titulo: string
          uf?: string | null
          updated_at?: string
          vagas_qtd?: number
        }
        Update: {
          category_id?: string
          cidade?: string | null
          closed_at?: string | null
          cover_url?: string | null
          created_at?: string
          descricao?: string
          destacada_ate?: string | null
          duracao_horas?: number | null
          endereco_texto?: string | null
          hirer_id?: string
          id?: string
          is_urgent?: boolean
          pay_amount?: number | null
          pay_type?: Database["public"]["Enums"]["pay_type"]
          point?: unknown
          published_at?: string | null
          requires_invoice?: boolean
          starts_at?: string
          status?: Database["public"]["Enums"]["job_status"]
          titulo?: string
          uf?: string | null
          updated_at?: string
          vagas_qtd?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_hirer_id_fkey"
            columns: ["hirer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          corpo: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          conversation_id: string
          corpo: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          conversation_id?: string
          corpo?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          canal: Database["public"]["Enums"]["delivery_channel"]
          created_at: string
          error: string | null
          id: string
          notification_id: string
          provider_id: string | null
          status: string
        }
        Insert: {
          canal: Database["public"]["Enums"]["delivery_channel"]
          created_at?: string
          error?: string | null
          id?: string
          notification_id: string
          provider_id?: string | null
          status?: string
        }
        Update: {
          canal?: Database["public"]["Enums"]["delivery_channel"]
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string
          provider_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_events: {
        Row: {
          actor_id: string | null
          attempts: number
          created_at: string
          error: string | null
          evento: Database["public"]["Enums"]["notification_event"]
          id: string
          payload: Json
          processed_at: string | null
          target_ids: string[]
        }
        Insert: {
          actor_id?: string | null
          attempts?: number
          created_at?: string
          error?: string | null
          evento: Database["public"]["Enums"]["notification_event"]
          id?: string
          payload?: Json
          processed_at?: string | null
          target_ids?: string[]
        }
        Update: {
          actor_id?: string | null
          attempts?: number
          created_at?: string
          error?: string | null
          evento?: Database["public"]["Enums"]["notification_event"]
          id?: string
          payload?: Json
          processed_at?: string | null
          target_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_prefs: {
        Row: {
          categorias_mudas: string[]
          email_candidaturas: boolean
          email_vagas: boolean
          max_push_vagas_dia: number
          profile_id: string
          push_candidaturas: boolean
          push_chat: boolean
          push_status: boolean
          push_vagas: boolean
          quiet_end: string
          quiet_start: string
          updated_at: string
          urgente_ignora_silencio: boolean
        }
        Insert: {
          categorias_mudas?: string[]
          email_candidaturas?: boolean
          email_vagas?: boolean
          max_push_vagas_dia?: number
          profile_id: string
          push_candidaturas?: boolean
          push_chat?: boolean
          push_status?: boolean
          push_vagas?: boolean
          quiet_end?: string
          quiet_start?: string
          updated_at?: string
          urgente_ignora_silencio?: boolean
        }
        Update: {
          categorias_mudas?: string[]
          email_candidaturas?: boolean
          email_vagas?: boolean
          max_push_vagas_dia?: number
          profile_id?: string
          push_candidaturas?: boolean
          push_chat?: boolean
          push_status?: boolean
          push_vagas?: boolean
          quiet_end?: string
          quiet_start?: string
          updated_at?: string
          urgente_ignora_silencio?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_prefs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          corpo: string
          created_at: string
          data: Json
          evento: Database["public"]["Enums"]["notification_event"]
          id: string
          profile_id: string
          read_at: string | null
          titulo: string
        }
        Insert: {
          corpo: string
          created_at?: string
          data?: Json
          evento: Database["public"]["Enums"]["notification_event"]
          id?: string
          profile_id: string
          read_at?: string | null
          titulo: string
        }
        Update: {
          corpo?: string
          created_at?: string
          data?: Json
          evento?: Database["public"]["Enums"]["notification_event"]
          id?: string
          profile_id?: string
          read_at?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string
          id: string
          legenda: string | null
          media_url: string
          ordem: number
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          legenda?: string | null
          media_url: string
          ordem?: number
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          legenda?: string | null
          media_url?: string
          ordem?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          base_label: string | null
          base_point: unknown
          categorias: string[]
          created_at: string
          disponivel: boolean
          headline: string | null
          links: Json
          profile_id: string
          raio_km: number
          rating_avg: number | null
          rating_count: number
          updated_at: string
        }
        Insert: {
          base_label?: string | null
          base_point?: unknown
          categorias?: string[]
          created_at?: string
          disponivel?: boolean
          headline?: string | null
          links?: Json
          profile_id: string
          raio_km?: number
          rating_avg?: number | null
          rating_count?: number
          updated_at?: string
        }
        Update: {
          base_label?: string | null
          base_point?: unknown
          categorias?: string[]
          created_at?: string
          disponivel?: boolean
          headline?: string | null
          links?: Json
          profile_id?: string
          raio_km?: number
          rating_avg?: number | null
          rating_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cidade: string | null
          created_at: string
          id: string
          last_seen_at: string | null
          nome: string
          tipo: Database["public"]["Enums"]["account_type"]
          uf: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          id: string
          last_seen_at?: string | null
          nome: string
          tipo: Database["public"]["Enums"]["account_type"]
          uf?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          id?: string
          last_seen_at?: string | null
          nome?: string
          tipo?: Database["public"]["Enums"]["account_type"]
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comentario: string | null
          created_at: string
          id: string
          job_id: string
          nota: number
          rated_id: string
          rater_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          id?: string
          job_id: string
          nota: number
          rated_id: string
          rater_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          id?: string
          job_id?: string
          nota?: number
          rated_id?: string
          rater_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_job_location: {
        Args: {
          p_cidade?: string
          p_endereco?: string
          p_job_id: string
          p_lat: number
          p_lng: number
          p_uf?: string
        }
        Returns: undefined
      }
      admin_set_professional_location: {
        Args: {
          p_label?: string
          p_lat: number
          p_lng: number
          p_profile_id: string
          p_raio_km?: number
        }
        Returns: undefined
      }
      avaliacoes_pendentes: {
        Args: never
        Returns: {
          job_id: string
          rated_avatar: string
          rated_id: string
          rated_nome: string
          starts_at: string
          titulo: string
        }[]
      }
      avaliacoes_recebidas: {
        Args: { p_limit?: number; p_profile_id: string }
        Returns: {
          comentario: string
          created_at: string
          id: string
          job_titulo: string
          nota: number
          rater_avatar: string
          rater_id: string
          rater_nome: string
        }[]
      }
      candidates_for_job: {
        Args: { p_job_id: string }
        Returns: {
          profile_id: string
        }[]
      }
      delete_own_account: { Args: never; Returns: undefined }
      email_confirmado: { Args: never; Returns: boolean }
      emit_notification_event: {
        Args: {
          p_actor_id?: string
          p_evento: Database["public"]["Enums"]["notification_event"]
          p_payload?: Json
          p_target_ids?: string[]
        }
        Returns: string
      }
      fui_selecionado: { Args: { p_job_id: string }; Returns: boolean }
      hirer_cadastro_completo: {
        Args: { p_profile_id: string }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      is_job_owner: { Args: { p_job_id: string }; Returns: boolean }
      job_reach_count: { Args: { p_job_id: string }; Returns: number }
      jobs_count_no_raio: { Args: { p_raio_km: number }; Returns: number }
      jobs_feed: {
        Args: {
          p_categorias?: string[]
          p_limit?: number
          p_offset?: number
          p_only_urgent?: boolean
          p_point?: unknown
          p_raio_km?: number
        }
        Returns: {
          category_id: string
          cidade: string
          cover_url: string
          descricao: string
          distancia_km: number
          hirer_avatar: string
          hirer_id: string
          hirer_nome: string
          id: string
          is_urgent: boolean
          pay_amount: number
          pay_type: Database["public"]["Enums"]["pay_type"]
          requires_invoice: boolean
          starts_at: string
          titulo: string
          uf: string
        }[]
      }
      jobs_feed_para_mim: {
        Args: {
          p_categorias?: string[]
          p_limit?: number
          p_offset?: number
          p_only_urgent?: boolean
          p_raio_km?: number
        }
        Returns: {
          category_id: string
          cidade: string
          cover_url: string
          descricao: string
          distancia_km: number
          hirer_avatar: string
          hirer_id: string
          hirer_nome: string
          id: string
          is_urgent: boolean
          pay_amount: number
          pay_type: Database["public"]["Enums"]["pay_type"]
          requires_invoice: boolean
          starts_at: string
          titulo: string
          uf: string
        }[]
      }
      me_candidatei: { Args: { p_job_id: string }; Returns: boolean }
      my_account_type: {
        Args: never
        Returns: Database["public"]["Enums"]["account_type"]
      }
      reprocessar_notificacoes_pendentes: {
        Args: { p_limite?: number }
        Returns: number
      }
      set_job_location: {
        Args: {
          p_cidade?: string
          p_endereco?: string
          p_job_id: string
          p_lat: number
          p_lng: number
          p_uf?: string
        }
        Returns: undefined
      }
      set_professional_location: {
        Args: {
          p_label?: string
          p_lat: number
          p_lng: number
          p_raio_km?: number
        }
        Returns: undefined
      }
      vaga_aceita_candidatura: { Args: { p_job_id: string }; Returns: boolean }
    }
    Enums: {
      account_type: "profissional" | "contratante"
      application_status:
        | "aplicada"
        | "vista"
        | "selecionada"
        | "recusada"
        | "retirada"
      delivery_channel: "inapp" | "push" | "email"
      job_status:
        | "rascunho"
        | "aberta"
        | "preenchida"
        | "encerrada"
        | "cancelada"
      notification_event:
        | "job.published.nearby"
        | "application.received"
        | "application.selected"
        | "application.rejected"
        | "message.received"
        | "job.cancelled"
        | "job.reminder"
        | "rating.received"
      pay_type: "valor" | "a_combinar"
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
      account_type: ["profissional", "contratante"],
      application_status: [
        "aplicada",
        "vista",
        "selecionada",
        "recusada",
        "retirada",
      ],
      delivery_channel: ["inapp", "push", "email"],
      job_status: [
        "rascunho",
        "aberta",
        "preenchida",
        "encerrada",
        "cancelada",
      ],
      notification_event: [
        "job.published.nearby",
        "application.received",
        "application.selected",
        "application.rejected",
        "message.received",
        "job.cancelled",
        "job.reminder",
        "rating.received",
      ],
      pay_type: ["valor", "a_combinar"],
    },
  },
} as const
