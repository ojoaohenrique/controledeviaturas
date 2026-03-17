import os
from functools import lru_cache
from dotenv import load_dotenv
from supabase import create_client

# Carrega .env apenas para desenvolvimento local.
load_dotenv()


def _get_env_vars():
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
    return url, key


@lru_cache(maxsize=1)
def get_supabase_client():
    """Retorna o cliente Supabase. Lança RuntimeError em caso de configuração incorreta."""
    supabase_url, supabase_service_key = _get_env_vars()

    if not supabase_url or not supabase_service_key:
        raise RuntimeError(
            "Supabase não configurado: SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidos."
        )

    try:
        client = create_client(supabase_url, supabase_service_key)
    except Exception as exc:
        raise RuntimeError(
            "Falha ao criar cliente Supabase. Verifique SUPABASE_SERVICE_KEY e SUPABASE_URL."
        ) from exc

    return client
