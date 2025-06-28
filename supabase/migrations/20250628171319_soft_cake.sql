-- Migração para adicionar colunas faltantes na tabela players
-- Esta migração é segura e só adiciona o que está faltando

DO $$
BEGIN
  -- Adicionar coluna age se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'age'
  ) THEN
    ALTER TABLE players ADD COLUMN age integer CHECK (age >= 13 AND age <= 100);
    RAISE NOTICE 'Coluna age adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna age já existe';
  END IF;

  -- Adicionar coluna email se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'email'
  ) THEN
    ALTER TABLE players ADD COLUMN email text;
    RAISE NOTICE 'Coluna email adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna email já existe';
  END IF;

  -- Adicionar coluna server se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'server'
  ) THEN
    ALTER TABLE players ADD COLUMN server text;
    RAISE NOTICE 'Coluna server adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna server já existe';
  END IF;

  -- Adicionar coluna base_sector se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'base_sector'
  ) THEN
    ALTER TABLE players ADD COLUMN base_sector text;
    RAISE NOTICE 'Coluna base_sector adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna base_sector já existe';
  END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_age ON players(age);
CREATE INDEX IF NOT EXISTS idx_players_server ON players(server);

-- Adicionar constraint de email único se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'players' AND constraint_name = 'players_email_key'
  ) THEN
    ALTER TABLE players ADD CONSTRAINT players_email_key UNIQUE (email);
    RAISE NOTICE 'Constraint de email único adicionada';
  ELSE
    RAISE NOTICE 'Constraint de email único já existe';
  END IF;
END $$;

-- Atualizar view de reputação (sempre recriar para garantir)
DROP VIEW IF EXISTS player_reputation;
CREATE VIEW player_reputation AS
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

-- Atualizar view de grupos ativos (sempre recriar para garantir)
DROP VIEW IF EXISTS active_groups;
CREATE VIEW active_groups AS
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

-- Verificação final
DO $$
DECLARE
  missing_columns text[] := '{}';
BEGIN
  -- Verificar se todas as colunas necessárias existem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'age') THEN
    missing_columns := array_append(missing_columns, 'age');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'email') THEN
    missing_columns := array_append(missing_columns, 'email');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'server') THEN
    missing_columns := array_append(missing_columns, 'server');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'base_sector') THEN
    missing_columns := array_append(missing_columns, 'base_sector');
  END IF;
  
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Ainda faltam colunas: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE '✅ Todas as colunas necessárias estão presentes!';
  END IF;
END $$;