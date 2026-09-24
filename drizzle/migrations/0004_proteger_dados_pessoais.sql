DROP POLICY IF EXISTS "Alunos podem ser criados pelo app" ON public.alunos;
DROP POLICY IF EXISTS "Alunos podem ser editados pelo app" ON public.alunos;
DROP POLICY IF EXISTS "Alunos podem ser removidos pelo app" ON public.alunos;
DROP POLICY IF EXISTS "Alunos visiveis para o app" ON public.alunos;
REVOKE ALL ON public.alunos FROM anon, authenticated;
GRANT ALL ON public.alunos TO service_role;

DROP POLICY IF EXISTS "Avaliacoes podem ser criadas pelo app" ON public.avaliacoes;
DROP POLICY IF EXISTS "Avaliacoes podem ser editadas pelo app" ON public.avaliacoes;
DROP POLICY IF EXISTS "Avaliacoes podem ser removidas pelo app" ON public.avaliacoes;
DROP POLICY IF EXISTS "Avaliacoes visiveis para o app" ON public.avaliacoes;
REVOKE ALL ON public.avaliacoes FROM anon, authenticated;
GRANT ALL ON public.avaliacoes TO service_role;