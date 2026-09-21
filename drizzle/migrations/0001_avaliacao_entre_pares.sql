CREATE TABLE public.alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ra text NOT NULL UNIQUE,
  nome text NOT NULL,
  nascimento date,
  turma text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alunos TO authenticated;
GRANT ALL ON public.alunos TO service_role;

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos visiveis para o app" ON public.alunos FOR SELECT USING (true);
CREATE POLICY "Alunos podem ser criados pelo app" ON public.alunos FOR INSERT WITH CHECK (true);
CREATE POLICY "Alunos podem ser editados pelo app" ON public.alunos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Alunos podem ser removidos pelo app" ON public.alunos FOR DELETE USING (true);

CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bimestre integer NOT NULL DEFAULT 3,
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  turma text NOT NULL DEFAULT '',
  avaliador_id text NOT NULL,
  avaliador_nome text NOT NULL DEFAULT '',
  avaliador_ra text NOT NULL DEFAULT '',
  avaliado_id text NOT NULL,
  avaliado_nome text NOT NULL DEFAULT '',
  participacao integer NOT NULL DEFAULT 0,
  organizacao integer NOT NULL DEFAULT 0,
  colaboracao integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bimestre, equipe_id, avaliador_id, avaliado_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes TO authenticated;
GRANT ALL ON public.avaliacoes TO service_role;

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avaliacoes visiveis para o app" ON public.avaliacoes FOR SELECT USING (true);
CREATE POLICY "Avaliacoes podem ser criadas pelo app" ON public.avaliacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Avaliacoes podem ser editadas pelo app" ON public.avaliacoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Avaliacoes podem ser removidas pelo app" ON public.avaliacoes FOR DELETE USING (true);

CREATE TABLE public.avaliacao_faltas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bimestre integer NOT NULL DEFAULT 3,
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  integrante_id text NOT NULL,
  nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bimestre, equipe_id, integrante_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacao_faltas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacao_faltas TO authenticated;
GRANT ALL ON public.avaliacao_faltas TO service_role;

ALTER TABLE public.avaliacao_faltas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faltas visiveis para o app" ON public.avaliacao_faltas FOR SELECT USING (true);
CREATE POLICY "Faltas podem ser criadas pelo app" ON public.avaliacao_faltas FOR INSERT WITH CHECK (true);
CREATE POLICY "Faltas podem ser removidas pelo app" ON public.avaliacao_faltas FOR DELETE USING (true);