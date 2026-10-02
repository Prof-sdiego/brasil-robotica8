CREATE TABLE public.materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  quantidade_padrao integer NOT NULL DEFAULT 1,
  limite_ativo integer,
  uma_vez boolean NOT NULL DEFAULT false,
  precisa_devolver boolean NOT NULL DEFAULT false,
  cores jsonb NOT NULL DEFAULT '[]'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materiais TO anon, authenticated;
GRANT ALL ON public.materiais TO service_role;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Materiais visiveis" ON public.materiais FOR SELECT USING (true);
CREATE POLICY "Materiais criados pelo app" ON public.materiais FOR INSERT WITH CHECK (true);
CREATE POLICY "Materiais editados pelo app" ON public.materiais FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Materiais removidos pelo app" ON public.materiais FOR DELETE USING (true);

CREATE TABLE public.pedidos_material (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materiais(id) ON DELETE CASCADE,
  material_nome text NOT NULL DEFAULT '',
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  turma text NOT NULL DEFAULT '',
  nome_equipe text NOT NULL DEFAULT '',
  pedido_por text NOT NULL DEFAULT '',
  quantidade integer NOT NULL DEFAULT 1,
  cor text,
  status text NOT NULL DEFAULT 'pendente',
  visto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_material TO anon, authenticated;
GRANT ALL ON public.pedidos_material TO service_role;
ALTER TABLE public.pedidos_material ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pedidos visiveis" ON public.pedidos_material FOR SELECT USING (true);
CREATE POLICY "Pedidos criados pelo app" ON public.pedidos_material FOR INSERT WITH CHECK (true);
CREATE POLICY "Pedidos editados pelo app" ON public.pedidos_material FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Pedidos removidos pelo app" ON public.pedidos_material FOR DELETE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos_material;