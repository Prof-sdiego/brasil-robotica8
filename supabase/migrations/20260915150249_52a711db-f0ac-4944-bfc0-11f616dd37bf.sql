CREATE TABLE public.equipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_acesso TEXT NOT NULL UNIQUE,
  turma TEXT NOT NULL,
  nome_equipe TEXT NOT NULL,
  grupo_radio INTEGER NOT NULL DEFAULT 11,
  sensibilidade INTEGER NOT NULL DEFAULT 6,
  melhorias JSONB NOT NULL DEFAULT '[]'::jsonb,
  melodia_abertura TEXT,
  coreografias JSONB NOT NULL DEFAULT '[]'::jsonb,
  integrantes JSONB NOT NULL DEFAULT '[]'::jsonb,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  justificativa TEXT NOT NULL DEFAULT '',
  codigo_gerado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipes TO authenticated;
GRANT ALL ON public.equipes TO service_role;

ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipes visiveis para o app" ON public.equipes FOR SELECT USING (true);
CREATE POLICY "Equipes podem ser criadas pelo app" ON public.equipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Equipes podem ser editadas pelo app" ON public.equipes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Equipes podem ser removidas pelo app" ON public.equipes FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.equipes_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER equipes_updated_at BEFORE UPDATE ON public.equipes
FOR EACH ROW EXECUTE FUNCTION public.equipes_set_updated_at();

INSERT INTO public.equipes (codigo_acesso, turma, nome_equipe, grupo_radio) VALUES
('LIMA-7X4K', '8A', 'Equipe 1', 11),
('NOVA-3B8P', '8A', 'Equipe 2', 12),
('ZETA-9K2M', '8A', 'Equipe 3', 13),
('ORCA-5T1J', '8A', 'Equipe 4', 14),
('VEGA-2W6H', '8A', 'Equipe 5', 15),
('IRIS-8N4C', '8A', 'Equipe 6', 16),
('KAPA-4R7D', '8B', 'Equipe 1', 17),
('TARA-6Y3F', '8B', 'Equipe 2', 18),
('MIRA-1Q9G', '8B', 'Equipe 3', 19),
('LYRA-7Z5B', '8B', 'Equipe 4', 20),
('ONIX-3E8V', '8B', 'Equipe 5', 21),
('RUBI-9U2L', '8B', 'Equipe 6', 22),
('ASTRO-5I6N', '8C', 'Equipe 1', 23),
('BRAVO-2O4X', '8C', 'Equipe 2', 24),
('CETUS-8A1S', '8C', 'Equipe 3', 25),
('DELTA-4P7T', '8C', 'Equipe 4', 26),
('ECO-6S3Z', '8C', 'Equipe 5', 27),
('FENIX-1D9R', '8C', 'Equipe 6', 28);