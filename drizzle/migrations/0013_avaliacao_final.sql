CREATE TABLE public.avaliacao_final (
  equipe_id uuid PRIMARY KEY REFERENCES public.equipes(id) ON DELETE CASCADE,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  notas jsonb NOT NULL DEFAULT '{}'::jsonb,
  media numeric,
  finalizada boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.avaliacao_final TO service_role;
ALTER TABLE public.avaliacao_final ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.professor_listar_final(_senha text)
RETURNS SETOF public.avaliacao_final
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  RETURN QUERY SELECT * FROM public.avaliacao_final;
END; $$;

CREATE OR REPLACE FUNCTION public.professor_salvar_final(_senha text, _equipe_id uuid, _dados jsonb, _notas jsonb, _media numeric, _finalizada boolean)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  INSERT INTO public.avaliacao_final (equipe_id, dados, notas, media, finalizada, updated_at)
  VALUES (_equipe_id, coalesce(_dados, '{}'), coalesce(_notas, '{}'), _media, coalesce(_finalizada, false), now())
  ON CONFLICT (equipe_id) DO UPDATE SET dados = EXCLUDED.dados, notas = EXCLUDED.notas,
    media = EXCLUDED.media, finalizada = EXCLUDED.finalizada, updated_at = now();
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.aluno_nota_final(_codigo text)
RETURNS TABLE(notas jsonb, media numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT f.notas, f.media FROM public.avaliacao_final f
  JOIN public.equipes e ON e.id = f.equipe_id
  WHERE e.codigo_acesso = upper(trim(_codigo)) AND f.finalizada;
$$;

GRANT EXECUTE ON FUNCTION public.professor_listar_final(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.professor_salvar_final(text, uuid, jsonb, jsonb, numeric, boolean) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aluno_nota_final(text) TO anon, authenticated, service_role;