import os
from supabase import create_client
from dotenv import load_dotenv

# Carrega .env apenas para desenvolvimento local.
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = None
SUPABASE_AVAILABLE = False

if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    SUPABASE_AVAILABLE = True


def get_supabase_client():
    """Retorna cliente Supabase ou lança erro com mensagem clara."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError(
            "As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY são necessárias."
            " Configure-as no painel da Vercel e redeploy."
        )
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
