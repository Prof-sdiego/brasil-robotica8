ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS aviso_velocidade boolean NOT NULL DEFAULT false;

UPDATE public.equipes
SET aviso_velocidade = true,
    ajustes = jsonb_strip_nulls(
      ajustes
      || CASE WHEN (ajustes->>'velocidade_maxima')::numeric > 200 THEN jsonb_build_object('velocidade_maxima', 200) ELSE '{}'::jsonb END
      || CASE WHEN (ajustes->>'velocidade_coreografia')::numeric > 200 THEN jsonb_build_object('velocidade_coreografia', 200) ELSE '{}'::jsonb END
      || CASE WHEN (ajustes->>'forca_giro')::numeric > 200 THEN jsonb_build_object('forca_giro', 200) ELSE '{}'::jsonb END
    )
WHERE (ajustes->>'velocidade_maxima')::numeric > 200
   OR (ajustes->>'velocidade_coreografia')::numeric > 200
   OR (ajustes->>'forca_giro')::numeric > 200;

UPDATE public.equipes
SET ajustes_melhorias = ajustes_melhorias #- '{turbo,velocidade_normal}'
WHERE ajustes_melhorias -> 'turbo' ? 'velocidade_normal';