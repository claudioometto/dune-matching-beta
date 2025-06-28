/*
  # Adicionar campos de autenticação à tabela players

  1. Alterações na tabela players
    - Adicionar campo `email` (obrigatório, único)
    - Adicionar campo `age` (idade do jogador)
    - Adicionar campo `server` (servidor do jogo)
    - Adicionar campo `base_sector` (setor da base no deep desert)
    - Modificar campo `id` para aceitar UUID do auth.users

  2. Segurança
    - Atualizar políticas RLS para usar auth.uid()
    - Garantir que jogadores só podem editar seus próprios dados

  3. Índices
    - Adicionar índice no campo email para performance
*/

-- Adicionar novos campos à tabela players
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS email text UNIQUE,
ADD COLUMN IF NOT EXISTS age integer CHECK (age >= 13 AND age <= 100),
ADD COLUMN IF NOT EXISTS server text,
ADD COLUMN IF NOT EXISTS base_sector text;

-- Tornar email obrigatório (depois que dados existentes forem migrados)
-- ALTER TABLE players ALTER COLUMN email SET NOT NULL;

-- Adicionar índice no email para performance
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);

-- Atualizar políticas RLS para usar autenticação
DROP POLICY IF EXISTS "Players can read all profiles" ON players;
DROP POLICY IF EXISTS "Players can insert their own profile" ON players;
DROP POLICY IF EXISTS "Players can update their own profile" ON players;

-- Novas políticas RLS baseadas em autenticação
CREATE POLICY "Authenticated users can read all player profiles"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own player profile"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own player profile"
  ON players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own player profile"
  ON players
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Atualizar view de reputação para incluir novos campos
DROP VIEW IF EXISTS player_reputation;
CREATE OR REPLACE VIEW player_reputation AS
SELECT 
  p.id,
  p.nickname,
  p.name,
  p.email,
  COALESCE(AVG(r.stars), 0) as average_rating,
  COUNT(r.id) as total_ratings,
  COUNT(CASE WHEN r.stars >= 4 THEN 1 END) as positive_ratings
FROM players p
LEFT JOIN ratings r ON p.id = r.to_player_id
GROUP BY p.id, p.nickname, p.name, p.email;

-- Atualizar view de grupos ativos
DROP VIEW IF EXISTS active_groups;
CREATE OR REPLACE VIEW active_groups AS
SELECT 
  ga.*,
  p.nickname as host_nickname,
  p.name as host_name,
  p.email as host_email,
  COUNT(gm.id) as current_members
FROM group_ads ga
JOIN players p ON ga.host_id = p.id
LEFT JOIN group_matches gm ON ga.id = gm.group_id AND gm.status = 'accepted'
WHERE ga.status = 'open'
GROUP BY ga.id, p.nickname, p.name, p.email;

-- Função para sincronizar dados do auth.users com players
CREATE OR REPLACE FUNCTION sync_user_to_player()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando um novo usuário é criado no auth.users,
  -- não criamos automaticamente um player
  -- O player será criado quando o usuário preencher o formulário
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronização (opcional, para uso futuro)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION sync_user_to_player();

-- Comentários para documentação
COMMENT ON COLUMN players.email IS 'Email do usuário (sincronizado com auth.users)';
COMMENT ON COLUMN players.age IS 'Idade do jogador (13-100 anos)';
COMMENT ON COLUMN players.server IS 'Servidor do jogo onde o jogador atua';
COMMENT ON COLUMN players.base_sector IS 'Setor da base no Deep Desert (A1-I9)';