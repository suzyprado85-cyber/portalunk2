/*
  # Tabela de Mídia dos DJs

  1. Nova Tabela
    - `dj_media` para armazenar arquivos e links de mídia dos DJs
    - Suporte a diferentes categorias (logo, presskit, backdrop, etc.)
    - Metadados como título, descrição, tamanho do arquivo

  2. Segurança
    - Enable RLS na tabela dj_media
    - Políticas para leitura pública e escrita apenas para admins
*/

-- Criar tabela dj_media se não existir
CREATE TABLE IF NOT EXISTS public.dj_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id uuid NOT NULL REFERENCES public.djs(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL DEFAULT 'other',
  file_url text NOT NULL,
  file_size bigint,
  category text NOT NULL DEFAULT 'other',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dj_media ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (qualquer usuário autenticado pode ver)
CREATE POLICY "Anyone can view DJ media"
  ON public.dj_media
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para inserção apenas por admins
CREATE POLICY "Only admins can insert DJ media"
  ON public.dj_media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Política para atualização apenas por admins
CREATE POLICY "Only admins can update DJ media"
  ON public.dj_media
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Política para exclusão apenas por admins
CREATE POLICY "Only admins can delete DJ media"
  ON public.dj_media
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dj_media_dj_id ON public.dj_media(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_media_category ON public.dj_media(category);
CREATE INDEX IF NOT EXISTS idx_dj_media_created_at ON public.dj_media(created_at);

-- Comentários
COMMENT ON TABLE public.dj_media IS 'Armazena arquivos de mídia e links externos dos DJs';
COMMENT ON COLUMN public.dj_media.category IS 'Categoria da mídia: logo, presskit, backdrop, performance, video, audio, other';
COMMENT ON COLUMN public.dj_media.file_type IS 'Tipo do arquivo: image, video, audio, document, link, other';