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
          rodada_id: string | null
        }
        Insert: {
          bimestre?: number
          created_at?: string
          equipe_id: string
          id?: string
          integrante_id: string
          nome?: string
          rodada_id?: string | null
        }
        Update: {
          bimestre?: number
          created_at?: string
          equipe_id?: string
          id?: string
          integrante_id?: string
          nome?: string
          rodada_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_faltas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_faltas_rodada_id_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "avaliacao_rodadas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao_liberacoes: {
        Row: {
          created_at: string
          equipe_id: string
          id: string
          integrante_id: string
          nome: string
          rodada_id: string
        }
        Insert: {
          created_at?: string
          equipe_id: string
          id?: string
          integrante_id: string
          nome?: string
          rodada_id: string
        }
        Update: {
          created_at?: string
          equipe_id?: string
          id?: string
          integrante_id?: string
          nome?: string
          rodada_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_liberacoes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_liberacoes_rodada_id_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "avaliacao_rodadas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao_rodadas: {
        Row: {
          aberta: boolean
          bimestre: number
          codigo: string
          created_at: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          aberta?: boolean
          bimestre?: number
          codigo?: string
          created_at?: string
          id?: string
          nome: string
          tipo?: string
        }
        Update: {
          aberta?: boolean
          bimestre?: number
          codigo?: string
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          avaliado_id: string
          avaliado_nome: string
          avaliador_id: string
          avaliador_nome: string
          avaliador_ra: string
          bimestre: number
          colaboracao: number | null
          created_at: string
          equipe_id: string
          id: string
          organizacao: number | null
          participacao: number | null
          rodada_id: string | null
          turma: string
        }
        Insert: {
          avaliado_id: string
          avaliado_nome?: string
          avaliador_id: string
          avaliador_nome?: string
          avaliador_ra?: string
          bimestre?: number
          colaboracao?: number | null
          created_at?: string
          equipe_id: string
          id?: string
          organizacao?: number | null
          participacao?: number | null
          rodada_id?: string | null
          turma?: string
        }
        Update: {
          avaliado_id?: string
          avaliado_nome?: string
          avaliador_id?: string
          avaliador_nome?: string
          avaliador_ra?: string
          bimestre?: number
          colaboracao?: number | null
          created_at?: string
          equipe_id?: string
          id?: string
          organizacao?: number | null
          participacao?: number | null
          rodada_id?: string | null
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
          {
            foreignKeyName: "avaliacoes_rodada_id_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "avaliacao_rodadas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          updated_at?: string
          valor?: Json
        }
        Update: {
          chave?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
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
      fila_banheiro: {
        Row: {
          created_at: string
          dia: string
          equipe_id: string
          id: string
          integrante_id: string
          nome: string
          nome_equipe: string
          saiu_em: string | null
          status: string
          turma: string
          voltou_em: string | null
        }
        Insert: {
          created_at?: string
          dia: string
          equipe_id: string
          id?: string
          integrante_id: string
          nome?: string
          nome_equipe?: string
          saiu_em?: string | null
          status?: string
          turma?: string
          voltou_em?: string | null
        }
        Update: {
          created_at?: string
          dia?: string
          equipe_id?: string
          id?: string
          integrante_id?: string
          nome?: string
          nome_equipe?: string
          saiu_em?: string | null
          status?: string
          turma?: string
          voltou_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fila_banheiro_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          ativo: boolean
          cores: Json
          created_at: string
          id: string
          limite_ativo: number | null
          nome: string
          precisa_devolver: boolean
          quantidade_padrao: number
          uma_vez: boolean
        }
        Insert: {
          ativo?: boolean
          cores?: Json
          created_at?: string
          id?: string
          limite_ativo?: number | null
          nome: string
          precisa_devolver?: boolean
          quantidade_padrao?: number
          uma_vez?: boolean
        }
        Update: {
          ativo?: boolean
          cores?: Json
          created_at?: string
          id?: string
          limite_ativo?: number | null
          nome?: string
          precisa_devolver?: boolean
          quantidade_padrao?: number
          uma_vez?: boolean
        }
        Relationships: []
      }
      pedidos_material: {
        Row: {
          cor: string | null
          created_at: string
          devolve_cor: string | null
          devolve_pedido_id: string | null
          equipe_id: string
          id: string
          material_id: string
          material_nome: string
          nome_equipe: string
          pedido_por: string
          quantidade: number
          status: string
          turma: string
          visto: boolean
        }
        Insert: {
          cor?: string | null
          created_at?: string
          devolve_cor?: string | null
          devolve_pedido_id?: string | null
          equipe_id: string
          id?: string
          material_id: string
          material_nome?: string
          nome_equipe?: string
          pedido_por?: string
          quantidade?: number
          status?: string
          turma?: string
          visto?: boolean
        }
        Update: {
          cor?: string | null
          created_at?: string
          devolve_cor?: string | null
          devolve_pedido_id?: string | null
          equipe_id?: string
          id?: string
          material_id?: string
          material_nome?: string
          nome_equipe?: string
          pedido_por?: string
          quantidade?: number
          status?: string
          turma?: string
          visto?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_material_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_material_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          created_at: string
          dia: string
          equipe_id: string
          id: string
          integrante_id: string
          marcado_por: string
          nome: string
          presente: boolean
          turma: string
        }
        Insert: {
          created_at?: string
          dia: string
          equipe_id: string
          id?: string
          integrante_id: string
          marcado_por?: string
          nome?: string
          presente?: boolean
          turma?: string
        }
        Update: {
          created_at?: string
          dia?: string
          equipe_id?: string
          id?: string
          integrante_id?: string
          marcado_por?: string
          nome?: string
          presente?: boolean
          turma?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_registros: {
        Row: {
          ciclo: number | null
          created_at: string
          dados: Json
          equipe_id: string
          id: string
          integrante_id: string | null
          integrante_nome: string
          texto: string
          tipo: string
          turma: string
        }
        Insert: {
          ciclo?: number | null
          created_at?: string
          dados?: Json
          equipe_id: string
          id?: string
          integrante_id?: string | null
          integrante_nome?: string
          texto?: string
          tipo: string
          turma?: string
        }
        Update: {
          ciclo?: number | null
          created_at?: string
          dados?: Json
          equipe_id?: string
          id?: string
          integrante_id?: string | null
          integrante_nome?: string
          texto?: string
          tipo?: string
          turma?: string
        }
        Relationships: [
          {
            foreignKeyName: "professor_registros_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aluno_conferir_identidade: {
        Args: {
          _codigo: string
          _equipe_id: string
          _integrante_id: string
          _ra: string
          _resposta: string
          _tipo: string
        }
        Returns: {
          erro: string
          ok: boolean
          ra: string
        }[]
      }
      aluno_listar_avaliadores: {
        Args: { _codigo: string; _equipe_id: string }
        Returns: {
          avaliado_id: string
          avaliado_nome: string
          avaliador_id: string
          avaliador_nome: string
          equipe_id: string
          id: string
          rodada_id: string
        }[]
      }
      aluno_salvar_avaliacoes: {
        Args: {
          _avaliador_id: string
          _avaliador_ra: string
          _codigo: string
          _equipe_id: string
          _notas: Json
          _rodada_id: string
        }
        Returns: boolean
      }
      professor_apagar_registro: {
        Args: { _id: string; _senha: string }
        Returns: boolean
      }
      professor_listar_alunos: {
        Args: { _senha: string }
        Returns: {
          id: string
          nascimento: string
          nome: string
          ra: string
          turma: string
        }[]
      }
      professor_listar_avaliacoes: {
        Args: { _senha: string }
        Returns: {
          avaliado_id: string
          avaliado_nome: string
          avaliador_id: string
          avaliador_nome: string
          avaliador_ra: string
          bimestre: number
          colaboracao: number | null
          created_at: string
          equipe_id: string
          id: string
          organizacao: number | null
          participacao: number | null
          rodada_id: string | null
          turma: string
        }[]
        SetofOptions: {
          from: "*"
          to: "avaliacoes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      professor_listar_registros: {
        Args: { _senha: string }
        Returns: {
          ciclo: number | null
          created_at: string
          dados: Json
          equipe_id: string
          id: string
          integrante_id: string | null
          integrante_nome: string
          texto: string
          tipo: string
          turma: string
        }[]
        SetofOptions: {
          from: "*"
          to: "professor_registros"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      professor_salvar_alunos: {
        Args: { _linhas: Json; _senha: string }
        Returns: boolean
      }
      professor_salvar_registros: {
        Args: { _linhas: Json; _senha: string }
        Returns: boolean
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
