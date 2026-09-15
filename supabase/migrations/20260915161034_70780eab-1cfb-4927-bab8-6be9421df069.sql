ALTER TABLE public.equipes
  ADD COLUMN IF NOT EXISTS ajustes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ajustes_melhorias jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ajustes_atualizados_em timestamptz,
  ADD COLUMN IF NOT EXISTS codigo_copiado_em timestamptz,
  ADD COLUMN IF NOT EXISTS aviso_catalogo boolean NOT NULL DEFAULT false;

UPDATE public.equipes
SET melhorias = COALESCE(
      (SELECT jsonb_agg(v) FROM jsonb_array_elements(melhorias) v
       WHERE v #>> '{}' NOT IN ('farol', 'contador_tempo')),
      '[]'::jsonb),
    aviso_catalogo = true
WHERE melhorias @> '["farol"]'::jsonb OR melhorias @> '["contador_tempo"]'::jsonb;