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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          created_at: string
          id: string
          nascimento: string | null
          nome: string
          ra: string
          turma: string
        }
        Insert: {
          created_at?: string
          id?: string
          nascimento?: string | null
          nome: string
          ra: string
          turma?: string
        }
        Update: {
          created_at?: string
          id?: string
          nascimento?: string | null
          nome?: string
          ra?: string
          turma?: string
        }
        Relationships: []
      }
      avaliacao_faltas: {
        Row: {
          bimestre: number
          created_at: string
          equipe_id: string
          id: string
          integrante_id: string
          nome: string
        }
        Insert: {
          bimestre?: number
          created_at?: string
          equipe_id: string
          id?: string
          integrante_id: string
          nome?: string
        }
        Update: {
          bimestre?: number
          created_at?: string
          equipe_id?: string
          id?: string
          integrante_id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_faltas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          avaliado_id: string
          avaliado_nome: string
          avaliador_id: string
          avaliador_nome: string
          avaliador_ra: string
          bimestre: number
          colaboracao: number
          created_at: string
          equipe_id: string
          id: string
          organizacao: number
          participacao: number
          turma: string
        }
        Insert: {
          avaliado_id: string
          avaliado_nome?: string
          avaliador_id: string
          avaliador_nome?: string
          avaliador_ra?: string
          bimestre?: number
          colaboracao?: number
          created_at?: string
          equipe_id: string
          id?: string
          organizacao?: number
          participacao?: number
          turma?: string
        }
        Update: {
          avaliado_id?: string
          avaliado_nome?: string
          avaliador_id?: string
          avaliador_nome?: string
          avaliador_ra?: string
          bimestre?: number
          colaboracao?: number
          created_at?: string
          equipe_id?: string
          id?: string
          organizacao?: number
          participacao?: number
          turma?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          ajustes: Json
          ajustes_atualizados_em: string | null
          ajustes_melhorias: Json
          atribuicao_botoes: Json
          aviso_catalogo: boolean
          aviso_modo: boolean
          aviso_velocidade: boolean
          checklist: Json
          codigo_acesso: string
          codigo_copiado_em: string | null
          codigo_gerado: boolean
          coreografias: Json
          created_at: string
          grupo_radio: number
          id: string
          integrantes: Json
          justificativa: string
          melhorias: Json
          melodia_abertura: string | null
          modo_pilotagem: string
          nome_equipe: string
          nome_microbit: string
          senha_robo: string
          sensibilidade: number
          turma: string
          updated_at: string
        }
        Insert: {
          ajustes?: Json
          ajustes_atualizados_em?: string | null
          ajustes_melhorias?: Json
          atribuicao_botoes?: Json
          aviso_catalogo?: boolean
          aviso_modo?: boolean
          aviso_velocidade?: boolean
          checklist?: Json
          codigo_acesso: string
          codigo_copiado_em?: string | null
          codigo_gerado?: boolean
          coreografias?: Json
          created_at?: string
          grupo_radio?: number
          id?: string
          integrantes?: Json
          justificativa?: string
          melhorias?: Json
          melodia_abertura?: string | null
          modo_pilotagem?: string
          nome_equipe: string
          nome_microbit?: string
          senha_robo?: string
          sensibilidade?: number
          turma: string
          updated_at?: string
        }
        Update: {
          ajustes?: Json
          ajustes_atualizados_em?: string | null
          ajustes_melhorias?: Json
          atribuicao_botoes?: Json
          aviso_catalogo?: boolean
          aviso_modo?: boolean
          aviso_velocidade?: boolean
          checklist?: Json
          codigo_acesso?: string
          codigo_copiado_em?: string | null
          codigo_gerado?: boolean
          coreografias?: Json
          created_at?: string
          grupo_radio?: number
          id?: string
          integrantes?: Json
          justificativa?: string
          melhorias?: Json
          melodia_abertura?: string | null
          modo_pilotagem?: string
          nome_equipe?: string
          nome_microbit?: string
          senha_robo?: string
          sensibilidade?: number
          turma?: string
          updated_at?: string
        }
        Relationships: []
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
