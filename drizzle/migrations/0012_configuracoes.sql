CREATE TABLE public.configuracoes (chave text PRIMARY KEY, valor jsonb NOT NULL DEFAULT 'null'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE ON public.configuracoes TO anon, authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config visivel" ON public.configuracoes FOR SELECT USING (true);
CREATE POLICY "Config criada pelo app" ON public.configuracoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Config editada pelo app" ON public.configuracoes FOR UPDATE USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracoes;