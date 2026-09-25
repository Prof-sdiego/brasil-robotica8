CREATE OR REPLACE FUNCTION public.professor_listar_avaliacoes(_senha text)
RETURNS SETOF public.avaliacoes LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  RETURN QUERY SELECT * FROM public.avaliacoes;
END; $$;

CREATE OR REPLACE FUNCTION public.professor_listar_alunos(_senha text)
RETURNS TABLE(id uuid, ra text, nome text, nascimento date, turma text) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  RETURN QUERY SELECT a.id, a.ra, a.nome, a.nascimento, a.turma FROM public.alunos a ORDER BY a.nome;
END; $$;

CREATE OR REPLACE FUNCTION public.professor_salvar_alunos(_senha text, _linhas jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  INSERT INTO public.alunos (ra, nome, nascimento, turma)
  SELECT l.ra, l.nome, l.nascimento, coalesce(l.turma, '')
  FROM jsonb_to_recordset(_linhas) l(ra text, nome text, nascimento date, turma text)
  WHERE l.ra ~ '^\d{4,20}$' AND length(trim(l.nome)) > 0
  ON CONFLICT (ra) DO UPDATE SET nome = EXCLUDED.nome, nascimento = EXCLUDED.nascimento, turma = EXCLUDED.turma;
  RETURN true;
END; $$;

GRANT EXECUTE ON FUNCTION public.professor_listar_avaliacoes(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.professor_listar_alunos(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.professor_salvar_alunos(text, jsonb) TO anon, authenticated;