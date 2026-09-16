ALTER TABLE public.equipes ADD COLUMN IF NOT EXISTS aviso_modo boolean NOT NULL DEFAULT false;
UPDATE public.equipes SET aviso_modo = true WHERE modo_pilotagem <> 'celular';
UPDATE public.equipes SET modo_pilotagem = 'celular' WHERE modo_pilotagem <> 'celular';