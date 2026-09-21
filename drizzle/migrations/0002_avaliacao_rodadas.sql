CREATE TABLE public.avaliacao_rodadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT 'bimestral',
  bimestre integer NOT NULL DEFAULT 3,
  codigo text NOT NULL DEFAULT '',
  aberta boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacao_rodadas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacao_rodadas TO anon;
GRANT ALL ON public.avaliacao_rodadas TO service_role;

ALTER TABLE public.avaliacao_rodadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rodadas visiveis para o app" ON public.avaliacao_rodadas FOR SELECT USING (true);
CREATE POLICY "Rodadas podem ser criadas pelo app" ON public.avaliacao_rodadas FOR INSERT WITH CHECK (true);
CREATE POLICY "Rodadas podem ser editadas pelo app" ON public.avaliacao_rodadas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Rodadas podem ser removidas pelo app" ON public.avaliacao_rodadas FOR DELETE USING (true);

CREATE TABLE public.avaliacao_liberacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rodada_id uuid NOT NULL REFERENCES public.avaliacao_rodadas(id) ON DELETE CASCADE,
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  integrante_id text NOT NULL,
  nome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rodada_id, equipe_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacao_liberacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacao_liberacoes TO anon;
GRANT ALL ON public.avaliacao_liberacoes TO service_role;

ALTER TABLE public.avaliacao_liberacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Liberacoes visiveis para o app" ON public.avaliacao_liberacoes FOR SELECT USING (true);
CREATE POLICY "Liberacoes podem ser criadas pelo app" ON public.avaliacao_liberacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Liberacoes podem ser removidas pelo app" ON public.avaliacao_liberacoes FOR DELETE USING (true);

ALTER TABLE public.avaliacoes ADD COLUMN rodada_id uuid REFERENCES public.avaliacao_rodadas(id) ON DELETE CASCADE;
ALTER TABLE public.avaliacao_faltas ADD COLUMN rodada_id uuid REFERENCES public.avaliacao_rodadas(id) ON DELETE CASCADE;

INSERT INTO public.avaliacao_rodadas (nome, tipo, bimestre, codigo, aberta)
VALUES ('Avaliação do 3º bimestre', 'bimestral', 3, 'ROBO3', true);

UPDATE public.avaliacoes SET rodada_id = (SELECT id FROM public.avaliacao_rodadas ORDER BY created_at LIMIT 1) WHERE rodada_id IS NULL;
UPDATE public.avaliacao_faltas SET rodada_id = (SELECT id FROM public.avaliacao_rodadas ORDER BY created_at LIMIT 1) WHERE rodada_id IS NULL;

DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname, conrelid::regclass AS tabela
    FROM pg_constraint
    WHERE contype = 'u'
      AND conrelid IN ('public.avaliacoes'::regclass, 'public.avaliacao_faltas'::regclass)
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', c.tabela, c.conname);
  END LOOP;
END $$;

CREATE UNIQUE INDEX avaliacoes_rodada_unica ON public.avaliacoes (rodada_id, equipe_id, avaliador_id, avaliado_id);
CREATE UNIQUE INDEX avaliacao_faltas_rodada_unica ON public.avaliacao_faltas (rodada_id, equipe_id, integrante_id);
