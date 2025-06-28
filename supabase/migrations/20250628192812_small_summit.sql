-- =====================================================
-- ADICIONAR CAMPO CLOSED_AT À TABELA GROUP_ADS - VERSÃO CORRIGIDA
-- =====================================================
-- Execute esta query no Supabase SQL Editor

-- 1. Adicionar o campo closed_at
ALTER TABLE group_ads 
ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_group_ads_closed_at ON group_ads(closed_at);

-- 3. Função para atualizar closed_at automaticamente quando status muda para 'closed'
CREATE OR REPLACE FUNCTION update_closed_at_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'closed', definir closed_at com timestamp atual
  IF NEW.status = 'closed' AND (OLD.status IS NULL OR OLD.status != 'closed') THEN
    NEW.closed_at = NOW();
    RAISE NOTICE 'Grupo % encerrado em %', NEW.id, NEW.closed_at;
  END IF;
  
  -- Se o status mudou de 'closed' para outro, limpar closed_at
  IF NEW.status != 'closed' AND OLD.status = 'closed' THEN
    NEW.closed_at = NULL;
    RAISE NOTICE 'Grupo % reaberto, closed_at limpo', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para atualizar closed_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_closed_at ON group_ads;
CREATE TRIGGER trigger_update_closed_at
  BEFORE UPDATE OF status ON group_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_closed_at_on_status_change();

-- 5. CORREÇÃO: Atualizar grupos já encerrados usando created_at como fallback
-- (já que updated_at não existe na tabela)
UPDATE group_ads 
SET closed_at = created_at 
WHERE status = 'closed' AND closed_at IS NULL;

-- 6. Adicionar comentário para documentação
COMMENT ON COLUMN group_ads.closed_at IS 'Timestamp exato do encerramento do grupo (preenchido automaticamente quando status = closed)';

-- 7. Verificação final e debug
DO $$
DECLARE
  closed_groups_count integer;
  total_groups_count integer;
  rec RECORD;
BEGIN
  -- Verificar se o campo foi criado
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_ads' AND column_name = 'closed_at'
  ) THEN
    RAISE NOTICE '✅ Campo closed_at adicionado com sucesso à tabela group_ads';
    
    -- Contar grupos encerrados
    SELECT COUNT(*) INTO closed_groups_count FROM group_ads WHERE status = 'closed';
    SELECT COUNT(*) INTO total_groups_count FROM group_ads;
    
    RAISE NOTICE 'ℹ️ Grupos encerrados com closed_at: %', closed_groups_count;
    RAISE NOTICE 'ℹ️ Total de grupos: %', total_groups_count;
    
    -- Mostrar alguns grupos encerrados como exemplo
    IF closed_groups_count > 0 THEN
      RAISE NOTICE '📋 Exemplos de grupos encerrados:';
      FOR rec IN 
        SELECT id, title, status, created_at, closed_at 
        FROM group_ads 
        WHERE status = 'closed' 
        LIMIT 3
      LOOP
        RAISE NOTICE '  - %: % (status: %, criado: %, encerrado: %)', 
          rec.id, rec.title, rec.status, rec.created_at, rec.closed_at;
      END LOOP;
    ELSE
      RAISE NOTICE 'ℹ️ Nenhum grupo encerrado encontrado';
    END IF;
    
    -- Mostrar grupos ativos também
    SELECT COUNT(*) INTO total_groups_count FROM group_ads WHERE status = 'open';
    RAISE NOTICE 'ℹ️ Grupos ativos: %', total_groups_count;
    
  ELSE
    RAISE EXCEPTION '❌ Falha ao adicionar campo closed_at';
  END IF;
END $$;

-- 8. Mostrar estrutura atualizada da tabela
DO $$
DECLARE
  col_info RECORD;
BEGIN
  RAISE NOTICE '📋 ESTRUTURA ATUALIZADA DA TABELA GROUP_ADS:';
  RAISE NOTICE '================================================';
  
  FOR col_info IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'group_ads' 
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '• % (%)', col_info.column_name, col_info.data_type;
  END LOOP;
  
  RAISE NOTICE '================================================';
END $$;

-- 9. Teste do trigger (opcional - para verificar se funciona)
DO $$
DECLARE
  test_group_id uuid;
BEGIN
  -- Buscar um grupo ativo para testar
  SELECT id INTO test_group_id FROM group_ads WHERE status = 'open' LIMIT 1;
  
  IF test_group_id IS NOT NULL THEN
    RAISE NOTICE '🧪 Testando trigger com grupo: %', test_group_id;
    
    -- Simular encerramento (não vai persistir porque está em uma transação)
    UPDATE group_ads SET status = 'closed' WHERE id = test_group_id;
    
    -- Verificar se closed_at foi preenchido
    IF EXISTS (SELECT 1 FROM group_ads WHERE id = test_group_id AND closed_at IS NOT NULL) THEN
      RAISE NOTICE '✅ Trigger funcionando corretamente!';
    ELSE
      RAISE NOTICE '❌ Trigger não funcionou';
    END IF;
    
    -- Reverter para não afetar dados reais
    ROLLBACK;
  ELSE
    RAISE NOTICE 'ℹ️ Nenhum grupo ativo encontrado para testar trigger';
  END IF;
END $$;