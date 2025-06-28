-- =====================================================
-- ADICIONAR CAMPO CLOSED_AT À TABELA GROUP_ADS - VERSÃO SIMPLIFICADA
-- =====================================================
-- Execute esta query no Supabase SQL Editor

-- 1. Adicionar o campo closed_at se não existir
ALTER TABLE group_ads 
ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_group_ads_closed_at ON group_ads(closed_at);

-- 3. Função para atualizar closed_at automaticamente
CREATE OR REPLACE FUNCTION update_closed_at_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'closed', definir closed_at
  IF NEW.status = 'closed' AND (OLD.status IS NULL OR OLD.status != 'closed') THEN
    NEW.closed_at = NOW();
  END IF;
  
  -- Se o status mudou de 'closed' para outro, limpar closed_at
  IF NEW.status != 'closed' AND OLD.status = 'closed' THEN
    NEW.closed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger
DROP TRIGGER IF EXISTS trigger_update_closed_at ON group_ads;
CREATE TRIGGER trigger_update_closed_at
  BEFORE UPDATE OF status ON group_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_closed_at_on_status_change();

-- 5. Atualizar grupos já encerrados (usar created_at como fallback)
UPDATE group_ads 
SET closed_at = created_at 
WHERE status = 'closed' AND closed_at IS NULL;

-- 6. Adicionar comentário
COMMENT ON COLUMN group_ads.closed_at IS 'Timestamp exato do encerramento do grupo';

-- 7. Verificação simples
SELECT 
  'closed_at field' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'group_ads' AND column_name = 'closed_at'
    ) THEN '✅ Campo existe'
    ELSE '❌ Campo não existe'
  END as result;

-- 8. Mostrar grupos encerrados
SELECT 
  id,
  title,
  status,
  created_at,
  closed_at,
  CASE 
    WHEN closed_at IS NOT NULL THEN '✅ Com closed_at'
    ELSE '❌ Sem closed_at'
  END as closed_at_status
FROM group_ads 
WHERE status = 'closed'
ORDER BY created_at DESC
LIMIT 5;

-- 9. Contar grupos por status
SELECT 
  status,
  COUNT(*) as total,
  COUNT(closed_at) as with_closed_at
FROM group_ads 
GROUP BY status
ORDER BY status;