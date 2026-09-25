CREATE OR REPLACE FUNCTION public.aluno_conferir_identidade(
  _codigo text,
  _equipe_id uuid,
  _integrante_id text,
  _ra text,
  _tipo text,
  _resposta text
)
RETURNS TABLE(ok boolean, erro text, ra text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _integrante_nome text;
  _aluno public.alunos%ROWTYPE;
  _ra_limpo text;
  _ra_aluno text;
  _nome_integrante text;
  _nome_aluno text;
  _resposta_limpa text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.equipes e
    WHERE e.id = _equipe_id
      AND upper(trim(e.codigo_acesso)) = upper(trim(_codigo))
  ) THEN
    RETURN QUERY SELECT false, 'Não achei esta equipe. Saiam e entrem de novo com o código da equipe.', NULL::text;
    RETURN;
  END IF;

  SELECT integrante->>'nome'
    INTO _integrante_nome
  FROM public.equipes e
  CROSS JOIN LATERAL jsonb_array_elements(e.integrantes) integrante
  WHERE e.id = _equipe_id AND integrante->>'id' = _integrante_id
  LIMIT 1;

  IF _integrante_nome IS NULL THEN
    RETURN QUERY SELECT false, 'Essa pessoa não é desta equipe.', NULL::text;
    RETURN;
  END IF;

  _ra_limpo := regexp_replace(_ra, '\D', '', 'g');
  _ra_limpo := regexp_replace(_ra_limpo, '^0+', '');
  IF length(_ra_limpo) < 5 THEN
    RETURN QUERY SELECT false, 'Não achei esse RA na lista da escola. Confira os números.', NULL::text;
    RETURN;
  END IF;

  SELECT a.* INTO _aluno
  FROM public.alunos a
  WHERE (
    regexp_replace(regexp_replace(a.ra, '\D', '', 'g'), '^0+', '') = _ra_limpo
    OR _ra_limpo LIKE regexp_replace(regexp_replace(a.ra, '\D', '', 'g'), '^0+', '') || '%'
    OR regexp_replace(regexp_replace(a.ra, '\D', '', 'g'), '^0+', '') LIKE _ra_limpo || '%'
  )
  LIMIT 1;

  IF _aluno.id IS NULL THEN
    RETURN QUERY SELECT false, 'Não achei esse RA na lista da escola. Confira os números.', NULL::text;
    RETURN;
  END IF;

  _nome_integrante := lower(regexp_replace(translate(_integrante_nome, 'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç', 'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'), '[^a-zA-Z ]', '', 'g'));
  _nome_aluno := lower(regexp_replace(translate(_aluno.nome, 'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇáàâãäéèêëíìîïóòôõöúùûüç', 'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'), '[^a-zA-Z ]', '', 'g'));
  IF split_part(trim(_nome_integrante), ' ', 1) <> split_part(trim(_nome_aluno), ' ', 1) THEN
    RETURN QUERY SELECT false, 'Esse RA é de outra pessoa. Digite o seu.', NULL::text;
    RETURN;
  END IF;

  IF _aluno.nascimento IS NULL THEN
    RETURN QUERY SELECT false, 'A data de nascimento não está cadastrada. Avise o professor.', NULL::text;
    RETURN;
  END IF;

  _resposta_limpa := lower(trim(_resposta));
  IF (_tipo = 'dia' AND regexp_replace(_resposta_limpa, '\D', '', 'g')::integer <> extract(day from _aluno.nascimento)::integer)
    OR (_tipo = 'ano' AND regexp_replace(_resposta_limpa, '\D', '', 'g')::integer <> extract(year from _aluno.nascimento)::integer)
    OR (_tipo = 'mes' AND CASE
      WHEN regexp_replace(_resposta_limpa, '\D', '', 'g') <> '' THEN regexp_replace(_resposta_limpa, '\D', '', 'g')::integer
      ELSE array_position(ARRAY['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'], translate(_resposta_limpa, 'çáàâãéèêíìîóòôõúùû', 'caaaaeeeiiioooouuu'))
    END <> extract(month from _aluno.nascimento)::integer)
  THEN
    RETURN QUERY SELECT false, 'A data de nascimento não bate. Tente de novo.', NULL::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, NULL::text, _aluno.ra;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN QUERY SELECT false, 'A data de nascimento não bate. Tente de novo.', NULL::text;
END;
$$;

CREATE OR REPLACE FUNCTION public.aluno_listar_avaliadores(_codigo text, _equipe_id uuid)
RETURNS TABLE(id uuid, rodada_id uuid, equipe_id uuid, avaliador_id text, avaliador_nome text, avaliado_id text, avaliado_nome text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.equipes e
    WHERE e.id = _equipe_id AND upper(trim(e.codigo_acesso)) = upper(trim(_codigo))
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN QUERY
  SELECT a.id, a.rodada_id, a.equipe_id, a.avaliador_id, a.avaliador_nome, a.avaliado_id, a.avaliado_nome
  FROM public.avaliacoes a
  WHERE a.equipe_id = _equipe_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.aluno_salvar_avaliacoes(
  _codigo text,
  _rodada_id uuid,
  _equipe_id uuid,
  _avaliador_id text,
  _avaliador_ra text,
  _notas jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _turma text;
  _integrantes jsonb;
  _avaliador_nome text;
  _bimestre integer;
BEGIN
  SELECT e.turma, e.integrantes INTO _turma, _integrantes
  FROM public.equipes e
  WHERE e.id = _equipe_id AND upper(trim(e.codigo_acesso)) = upper(trim(_codigo));
  IF _integrantes IS NULL THEN RAISE EXCEPTION 'Acesso negado'; END IF;

  SELECT integrante->>'nome' INTO _avaliador_nome
  FROM jsonb_array_elements(_integrantes) integrante
  WHERE integrante->>'id' = _avaliador_id LIMIT 1;
  IF _avaliador_nome IS NULL THEN RAISE EXCEPTION 'Acesso negado'; END IF;

  SELECT r.bimestre INTO _bimestre
  FROM public.avaliacao_rodadas r WHERE r.id = _rodada_id AND r.aberta = true;
  IF _bimestre IS NULL THEN RAISE EXCEPTION 'Avaliação fechada'; END IF;

  IF jsonb_array_length(_notas) > 20 OR EXISTS (
    SELECT 1 FROM jsonb_to_recordset(_notas) n(avaliado_id text, participacao integer, organizacao integer, colaboracao integer)
    WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_integrantes) i WHERE i->>'id' = n.avaliado_id)
      OR n.participacao NOT BETWEEN 0 AND 10
      OR n.organizacao NOT BETWEEN 0 AND 10
      OR n.colaboracao NOT BETWEEN 0 AND 10
  ) THEN RAISE EXCEPTION 'Notas inválidas'; END IF;

  INSERT INTO public.avaliacoes (
    rodada_id, bimestre, equipe_id, turma, avaliador_id, avaliador_nome, avaliador_ra,
    avaliado_id, avaliado_nome, participacao, organizacao, colaboracao
  )
  SELECT _rodada_id, _bimestre, _equipe_id, _turma, _avaliador_id, _avaliador_nome, _avaliador_ra,
    n.avaliado_id, i->>'nome', n.participacao, n.organizacao, n.colaboracao
  FROM jsonb_to_recordset(_notas) n(avaliado_id text, participacao integer, organizacao integer, colaboracao integer)
  JOIN LATERAL (
    SELECT integrante AS i FROM jsonb_array_elements(_integrantes) integrante
    WHERE integrante->>'id' = n.avaliado_id LIMIT 1
  ) alvo ON true
  ON CONFLICT (rodada_id, equipe_id, avaliador_id, avaliado_id) DO UPDATE SET
    participacao = EXCLUDED.participacao,
    organizacao = EXCLUDED.organizacao,
    colaboracao = EXCLUDED.colaboracao;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.aluno_conferir_identidade(text, uuid, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.aluno_listar_avaliadores(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.aluno_salvar_avaliacoes(text, uuid, uuid, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.aluno_conferir_identidade(text, uuid, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aluno_listar_avaliadores(text, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aluno_salvar_avaliacoes(text, uuid, uuid, text, text, jsonb) TO anon, authenticated, service_role;