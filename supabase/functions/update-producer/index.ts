import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { producerId, updates } = await req.json();

    if (!producerId || !updates || typeof updates !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Parâmetros inválidos: é necessário producerId e updates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🧩 Atualizando produtor via edge function:', producerId);

    // Buscar user_id e email atual do perfil
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('id', producerId)
      .single();

    if (fetchError || !currentProfile) {
      console.error('❌ Produtor não encontrado:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Produtor não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se o email mudou, atualizar também no Auth
    if (updates.email && updates.email !== currentProfile.email) {
      console.log('✉️ Atualizando email no Auth:', updates.email);
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        currentProfile.user_id,
        { email: updates.email }
      );

      if (authUpdateError) {
        console.error('❌ Erro ao atualizar email no Auth:', authUpdateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar email no Auth' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Campos permitidos para atualização no perfil
    const allowedFields = [
      'name',
      'email',
      'phone',
      'company_name',
      'company_document',
      'address',
      'city',
      'state',
      'contact_person',
      'is_active',
    ];

    const profileUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) profileUpdates[key] = (updates as Record<string, unknown>)[key];
    }

    // Atualizar o perfil
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', producerId)
      .select('*')
      .single();

    if (profileError) {
      console.error('❌ Erro ao atualizar perfil:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar perfil' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Produtor atualizado com sucesso');

    return new Response(
      JSON.stringify({ producer: updatedProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erro na função update-producer:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
