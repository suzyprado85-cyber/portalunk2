/*
  # Sistema de Pagamentos Automáticos

  1. Função de Trigger
    - `create_payment_on_event()` - Cria pagamento automaticamente quando evento é inserido
    - Calcula comissão baseada na porcentagem definida no evento
    - Define status inicial como 'pending'

  2. Trigger
    - Executa após INSERT na tabela events
    - Chama a função create_payment_on_event()

  3. Segurança
    - Função é SECURITY DEFINER para executar com privilégios do criador
    - Validações de dados antes da inserção
*/

-- Função para criar pagamento automaticamente quando evento é criado
CREATE OR REPLACE FUNCTION create_payment_on_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar se o evento tem valor de cache
  IF NEW.cache_value IS NULL OR NEW.cache_value <= 0 THEN
    RAISE NOTICE 'Evento sem valor de cache definido, pagamento não criado';
    RETURN NEW;
  END IF;

  -- Validar se a porcentagem de comissão está definida
  IF NEW.commission_percentage IS NULL THEN
    NEW.commission_percentage := 20.00; -- Default 20%
  END IF;

  -- Inserir pagamento na tabela payments
  INSERT INTO public.payments (
    event_id,
    amount,
    commission_amount,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.cache_value,
    ROUND(NEW.cache_value * (NEW.commission_percentage / 100), 2),
    'pending',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Pagamento criado automaticamente para evento %', NEW.title;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS create_payment_on_event_trigger ON public.events;
CREATE TRIGGER create_payment_on_event_trigger
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_on_event();

-- Comentário explicativo
COMMENT ON FUNCTION create_payment_on_event() IS 'Cria automaticamente um pagamento quando um evento é inserido';
COMMENT ON TRIGGER create_payment_on_event_trigger ON public.events IS 'Trigger que executa create_payment_on_event() após inserção de evento';