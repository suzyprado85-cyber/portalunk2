/*
  # Atualização automática de pagamentos em atraso

  1. Função para atualizar pagamentos em atraso
    - Marca pagamentos como 'overdue' quando a data do evento passou
    - Executa automaticamente para eventos concluídos sem pagamento

  2. Trigger para execução automática
    - Executa quando eventos são atualizados para 'completed'
    - Verifica se há pagamentos pendentes para marcar como atrasados
*/

-- Função para atualizar pagamentos em atraso
CREATE OR REPLACE FUNCTION update_overdue_payments()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar pagamentos para 'overdue' quando:
  -- 1. O evento foi concluído (status = 'completed')
  -- 2. A data do evento já passou
  -- 3. O pagamento ainda está pendente ou processando
  UPDATE payments 
  SET 
    status = 'overdue',
    updated_at = now()
  WHERE 
    status IN ('pending', 'processing')
    AND event_id IN (
      SELECT e.id 
      FROM events e 
      WHERE 
        e.status = 'completed' 
        AND e.event_date < CURRENT_DATE
    );
    
  -- Log quantos pagamentos foram atualizados
  RAISE NOTICE 'Pagamentos atualizados para overdue: %', ROW_COUNT;
END;
$$;

-- Trigger para executar automaticamente quando eventos são marcados como completed
CREATE OR REPLACE FUNCTION check_overdue_payments_on_event_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se o evento foi marcado como completed e a data já passou
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.event_date < CURRENT_DATE THEN
    -- Atualizar pagamentos pendentes deste evento para overdue
    UPDATE payments 
    SET 
      status = 'overdue',
      updated_at = now()
    WHERE 
      event_id = NEW.id 
      AND status IN ('pending', 'processing');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_check_overdue_payments'
  ) THEN
    CREATE TRIGGER trigger_check_overdue_payments
      AFTER UPDATE ON events
      FOR EACH ROW
      EXECUTE FUNCTION check_overdue_payments_on_event_completion();
  END IF;
END $$;

-- Executar uma vez para atualizar pagamentos existentes
SELECT update_overdue_payments();