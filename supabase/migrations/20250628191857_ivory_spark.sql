/*
  # Adicionar campo closed_at para grupos

  1. Alterações na tabela group_ads
    - Adicionar campo `closed_at` (timestamp, nullable)
    - Este campo será preenchido apenas quando o grupo for encerrado

  2. Função para atualizar closed_at automaticamente
    - Trigger que preenche closed_at quando status muda para 'closed'

  3. Índice para performance
    - Índice no campo closed_at para consultas de avaliação
*/

-- Adicionar campo closed_at à tabela group_ads
ALTER TABLE group_ads 
ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_group_ads_closed_at ON group_ads(closed_at);

-- Função para atualizar closed_at automaticamente
CREATE OR REPLACE FUNCTION update_closed_at_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'closed', definir closed_at
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = NOW();
  END IF;
  
  -- Se o status mudou de 'closed' para outro, limpar closed_at
  IF NEW.status != 'closed' AND OLD.status = 'closed' THEN
    NEW.closed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar closed_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_closed_at ON group_ads;
CREATE TRIGGER trigger_update_closed_at
  BEFORE UPDATE OF status ON group_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_closed_at_on_status_change();

-- Atualizar grupos já encerrados para ter closed_at
UPDATE group_ads 
SET closed_at = updated_at 
WHERE status = 'closed' AND closed_at IS NULL;

-- Comentário para documentação
COMMENT ON COLUMN group_ads.closed_at IS 'Timestamp exato do encerramento do grupo (preenchido automaticamente quando status = closed)';

-- Verificação
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_ads' AND column_name = 'closed_at'
  ) THEN
    RAISE NOTICE '✅ Campo closed_at adicionado com sucesso à tabela group_ads';
  ELSE
    RAISE EXCEPTION '❌ Falha ao adicionar campo closed_at';
  END IF;
END $$;