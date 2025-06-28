-- =====================================================
-- MIGRAÇÃO FINAL - DUNE: AWAKENING PLAYER MATCHING
-- =====================================================
-- Esta migração adiciona todas as colunas necessárias
-- de forma segura, verificando se já existem antes

DO $$
BEGIN
  RAISE NOTICE '🏜️ Iniciando migração do Deep Desert Alliance...';
  
  -- Adicionar coluna age se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'age'
  ) THEN
    ALTER TABLE players ADD COLUMN age integer CHECK (age >= 13 AND age <= 100);
    RAISE NOTICE '✅ Coluna age adicionada com sucesso';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna age já existe';
  END IF;

  -- Adicionar coluna email se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'email'
  ) THEN
    ALTER TABLE players ADD COLUMN email text;
    RAISE NOTICE '✅ Coluna email adicionada com sucesso';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna email já existe';
  END IF;

  -- Adicionar coluna server se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'server'
  ) THEN
    ALTER TABLE players ADD COLUMN server text;
    RAISE NOTICE '✅ Coluna server adicionada com sucesso';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna server já existe';
  END IF;

  -- Adicionar coluna base_sector se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'base_sector'
  ) THEN
    ALTER TABLE players ADD COLUMN base_sector text;
    RAISE NOTICE '✅ Coluna base_sector adicionada com sucesso';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna base_sector já existe';
  END IF;
END $$;

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_age ON players(age);
CREATE INDEX IF NOT EXISTS idx_players_server ON players(server);
CREATE INDEX IF NOT EXISTS idx_players_base_sector ON players(base_sector);

-- =====================================================
-- ADICIONAR CONSTRAINT DE EMAIL ÚNICO
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'players' AND constraint_name = 'players_email_key'
  ) THEN
    ALTER TABLE players ADD CONSTRAINT players_email_key UNIQUE (email);
    RAISE NOTICE '✅ Constraint de email único adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Constraint de email único já existe';
  END IF;
END $$;

-- =====================================================
-- ATUALIZAR VIEWS PARA INCLUIR NOVOS CAMPOS
-- =====================================================

-- View de reputação dos jogadores
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

-- View de grupos ativos
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

-- =====================================================
-- ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN players.age IS 'Idade do jogador (13-100 anos)';
COMMENT ON COLUMN players.email IS 'Email do usuário (sincronizado com auth.users)';
COMMENT ON COLUMN players.server IS 'Servidor do jogo onde o jogador atua';
COMMENT ON COLUMN players.base_sector IS 'Setor da base no Deep Desert (A1-I9)';

-- =====================================================
-- VERIFICAÇÃO FINAL DO SCHEMA
-- =====================================================

DO $$
DECLARE
  missing_columns text[] := '{}';
  column_count integer;
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
  
  -- Contar total de colunas na tabela players
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'players';
  
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION '❌ Ainda faltam colunas: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '✅ Todas as % colunas necessárias estão presentes na tabela players', column_count;
    RAISE NOTICE '⚔️ O sistema Deep Desert Alliance está pronto para uso!';
  END IF;
END $$;

-- =====================================================
-- MOSTRAR ESTRUTURA FINAL DA TABELA
-- =====================================================

DO $$
DECLARE
  col_info RECORD;
BEGIN
  RAISE NOTICE '📋 ESTRUTURA FINAL DA TABELA PLAYERS:';
  RAISE NOTICE '================================================';
  
  FOR col_info IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'players' 
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '• % (%)', col_info.column_name, col_info.data_type;
  END LOOP;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE '🏜️ Que a especiaria flua pelos seus sistemas!';
END $$;