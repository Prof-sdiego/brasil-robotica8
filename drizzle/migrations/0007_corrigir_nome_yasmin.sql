UPDATE public.equipes e SET integrantes = (
  SELECT jsonb_agg(CASE WHEN i->>'nome' = 'Yasmim B.' THEN jsonb_set(i, '{nome}', '"Yasmin B."') ELSE i END ORDER BY ord)
  FROM jsonb_array_elements(e.integrantes) WITH ORDINALITY AS t(i, ord)
) WHERE e.codigo_acesso = 'CETUS-8A1S';