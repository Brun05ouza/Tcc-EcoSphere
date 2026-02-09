-- Adiciona coluna is_admin em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- RLS: admins podem ver/atualizar is_admin (por enquanto, apenas via service role)
-- Usuários normais não podem alterar is_admin
COMMENT ON COLUMN public.profiles.is_admin IS 'Indica se o usuário é administrador (sem validação de email)';
