CREATE TABLE public.avaliacao_aulas (
  equipe_id uuid PRIMARY KEY REFERENCES public.equipes(id) ON DELETE CASCADE,
  turma text NOT NULL DEFAULT '',
  nome_equipe text NOT NULL DEFAULT '',
  notas jsonb NOT NULL DEFAULT '{}'::jsonb,
  textos jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.avaliacao_aulas TO service_role;
ALTER TABLE public.avaliacao_aulas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.aluno_enviar_avaliacao_aulas(_codigo text, _notas jsonb, _textos jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE e record;
BEGIN
  SELECT id, turma, nome_equipe INTO e FROM public.equipes WHERE codigo_acesso = upper(trim(_codigo));
  IF e.id IS NULL THEN RAISE EXCEPTION 'Equipe não encontrada'; END IF;
  IF EXISTS (SELECT 1 FROM public.avaliacao_aulas WHERE equipe_id = e.id) THEN RAISE EXCEPTION 'Já enviada'; END IF;
  INSERT INTO public.avaliacao_aulas (equipe_id, turma, nome_equipe, notas, textos)
  VALUES (e.id, e.turma, e.nome_equipe, coalesce(_notas, '{}'), coalesce(_textos, '{}'));
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.aluno_avaliacao_aulas_enviada(_codigo text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.avaliacao_aulas a JOIN public.equipes e ON e.id = a.equipe_id
    WHERE e.codigo_acesso = upper(trim(_codigo)));
$$;

CREATE OR REPLACE FUNCTION public.professor_listar_avaliacao_aulas(_senha text)
RETURNS SETOF public.avaliacao_aulas LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  RETURN QUERY SELECT * FROM public.avaliacao_aulas ORDER BY created_at;
END; $$;

GRANT EXECUTE ON FUNCTION public.aluno_enviar_avaliacao_aulas(text, jsonb, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aluno_avaliacao_aulas_enviada(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.professor_listar_avaliacao_aulas(text) TO anon, authenticated, service_role;