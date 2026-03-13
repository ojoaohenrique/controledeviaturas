// Cliente Supabase centralizado
// Usa SUPABASE_URL e SUPABASE_ANON_KEY definidos no window

let supabaseClient = null;

function getSupabase() {
    if (supabaseClient) return supabaseClient;

    const url = window.SUPABASE_URL;
    const anonKey = window.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
        console.error("SUPABASE_URL ou SUPABASE_ANON_KEY não configurados.");
        throw new Error("Supabase não configurado.");
    }

    // globalThis.supabase vem do bundle UMD importado no HTML
    supabaseClient = window.supabase.createClient(url, anonKey);
    return supabaseClient;
}

