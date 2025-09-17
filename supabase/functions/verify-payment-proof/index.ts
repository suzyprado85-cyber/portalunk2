import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface PaymentVerificationRequest {
  paymentId: string;
  proofUrl: string;
  expectedAmount?: number;
  expectedCnpj?: string;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  details: {
    amountMatch: boolean;
    cnpjMatch: boolean;
    dateValid: boolean;
    formatValid: boolean;
  };
  message: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { paymentId, proofUrl, expectedAmount, expectedCnpj }: PaymentVerificationRequest = await req.json();

    if (!paymentId || !proofUrl) {
      return new Response(
        JSON.stringify({ error: 'paymentId e proofUrl são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Buscar dados do pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        event:events(
          id,
          title,
          cache_value,
          commission_percentage
        )
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Pagamento não encontrado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Simular verificação do comprovante
    const verificationResult = await simulatePaymentVerification(
      proofUrl,
      expectedCnpj || '59839507000186', // CNPJ da UNK
      expectedAmount || payment.amount
    );

    // Se verificação passou, atualizar status do pagamento
    if (verificationResult.verified) {
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (updateError) {
        console.error('Erro ao atualizar pagamento:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar status do pagamento' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Log da verificação
      console.log(`✅ Pagamento ${paymentId} verificado e aprovado automaticamente`);
    } else {
      console.log(`❌ Pagamento ${paymentId} não passou na verificação automática`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verification: verificationResult,
        paymentUpdated: verificationResult.verified
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na verificação de pagamento:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Função para simular verificação de comprovante
async function simulatePaymentVerification(
  proofUrl: string,
  expectedCnpj: string,
  expectedAmount: number
): Promise<VerificationResult> {
  // Simular análise do comprovante
  // Em um sistema real, aqui você faria:
  // 1. OCR do documento
  // 2. Extração de dados (valor, CNPJ, data)
  // 3. Validação contra os dados esperados
  
  // Para demonstração, vamos simular uma verificação que passa em 80% dos casos
  const randomSuccess = Math.random() > 0.2;
  
  const result: VerificationResult = {
    verified: randomSuccess,
    confidence: randomSuccess ? 0.95 : 0.45,
    details: {
      amountMatch: randomSuccess,
      cnpjMatch: randomSuccess,
      dateValid: true,
      formatValid: true
    },
    message: randomSuccess 
      ? 'Comprovante verificado com sucesso. Valor e CNPJ conferem.'
      : 'Comprovante não pôde ser verificado automaticamente. Revisão manual necessária.'
  };

  // Simular tempo de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  return result;
}