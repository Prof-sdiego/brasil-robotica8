CREATE TABLE public.fila_banheiro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  turma text NOT NULL DEFAULT '',
  nome_equipe text NOT NULL DEFAULT '',
  integrante_id text NOT NULL,
  nome text NOT NULL DEFAULT '',
  dia date NOT NULL,
  status text NOT NULL DEFAULT 'fila',
  saiu_em timestamptz,
  voltou_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX fila_banheiro_uma_vez ON public.fila_banheiro (equipe_id, integrante_id, dia) WHERE status <> 'cancelado';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fila_banheiro TO anon, authenticated;
GRANT ALL ON public.fila_banheiro TO service_role;
ALTER TABLE public.fila_banheiro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fila visivel" ON public.fila_banheiro FOR SELECT USING (true);
CREATE POLICY "Fila criada pelo app" ON public.fila_banheiro FOR INSERT WITH CHECK (true);
CREATE POLICY "Fila editada pelo app" ON public.fila_banheiro FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Fila removida pelo app" ON public.fila_banheiro FOR DELETE USING (true);

CREATE TABLE public.presencas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  turma text NOT NULL DEFAULT '',
  integrante_id text NOT NULL,
  nome text NOT NULL DEFAULT '',
  dia date NOT NULL,
  presente boolean NOT NULL DEFAULT true,
  marcado_por text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (equipe_id, integrante_id, dia)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presencas TO anon, authenticated;
GRANT ALL ON public.presencas TO service_role;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Presencas visiveis" ON public.presencas FOR SELECT USING (true);
CREATE POLICY "Presencas criadas pelo app" ON public.presencas FOR INSERT WITH CHECK (true);
CREATE POLICY "Presencas editadas pelo app" ON public.presencas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Presencas removidas pelo app" ON public.presencas FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.fila_banheiro;
ALTER PUBLICATION supabase_realtime ADD TABLE public.presencas;