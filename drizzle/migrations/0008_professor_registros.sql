CREATE TABLE public.professor_registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  equipe_id uuid NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
  turma text NOT NULL DEFAULT '',
  integrante_id text,
  integrante_nome text NOT NULL DEFAULT '',
  ciclo integer,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  texto text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.professor_registros TO service_role;
ALTER TABLE public.professor_registros ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.professor_listar_registros(_senha text)
RETURNS SETOF public.professor_registros
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  RETURN QUERY SELECT * FROM public.professor_registros ORDER BY created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.professor_salvar_registros(_senha text, _linhas jsonb)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  INSERT INTO public.professor_registros (tipo, equipe_id, turma, integrante_id, integrante_nome, ciclo, dados, texto)
  SELECT l.tipo, l.equipe_id, coalesce(l.turma, ''), l.integrante_id, coalesce(l.integrante_nome, ''), l.ciclo,
    coalesce(l.dados, '{}'::jsonb), coalesce(l.texto, '')
  FROM jsonb_to_recordset(_linhas) l(tipo text, equipe_id uuid, turma text, integrante_id text, integrante_nome text, ciclo integer, dados jsonb, texto text)
  WHERE l.tipo IN ('observacao', 'ocorrencia', 'avaliacao');
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.professor_apagar_registro(_senha text, _id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF trim(_senha) <> 'robotica8' THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  DELETE FROM public.professor_registros WHERE id = _id;
  RETURN true;
END; $$;

GRANT EXECUTE ON FUNCTION public.professor_listar_registros(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.professor_salvar_registros(text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.professor_apagar_registro(text, uuid) TO anon, authenticated, service_role;