/*
  # Corrigir schema da tabela players

  1. Verificar e adicionar colunas faltantes
    - `age` (integer, 13-100 anos)
    - `email` (text, único)
    - `server` (text)
    - `base_sector` (text)

  2. Garantir que todas as colunas necessárias existam
    - Usar IF NOT EXISTS para evitar erros
    - Adicionar constraints apropriados

  3. Atualizar índices se necessário
*/

-- Verificar se as colunas existem e adicionar se necessário
DO $$
BEGIN
  -- Adicionar coluna age se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'age'
  ) THEN
    ALTER TABLE players ADD COLUMN age integer CHECK (age >= 13 AND age <= 100);
  END IF;

  -- Adicionar coluna email se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'email'
  ) THEN
    ALTER TABLE players ADD COLUMN email text UNIQUE;
  END IF;

  -- Adicionar coluna server se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'server'
  ) THEN
    ALTER TABLE players ADD COLUMN server text;
  END IF;

  -- Adicionar coluna base_sector se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'base_sector'
  ) THEN
    ALTER TABLE players ADD COLUMN base_sector text;
  END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_age ON players(age);
CREATE INDEX IF NOT EXISTS idx_players_server ON players(server);

-- Atualizar view de reputação para incluir email
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

-- Comentários para documentação
COMMENT ON COLUMN players.age IS 'Idade do jogador (13-100 anos)';
COMMENT ON COLUMN players.email IS 'Email do usuário (sincronizado com auth.users)';
COMMENT ON COLUMN players.server IS 'Servidor do jogo onde o jogador atua';
COMMENT ON COLUMN players.base_sector IS 'Setor da base no Deep Desert (A1-I9)';