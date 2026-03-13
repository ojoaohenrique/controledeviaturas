from supabase import create_client
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env localizado na pasta backend
load_dotenv()

# URL do projeto Supabase (ex.: https://xxxx.supabase.co)
SUPABASE_URL = os.getenv("SUPABASE_URL")

# Chave de serviço do Supabase (NUNCA exponha em frontend ou repositório público)
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError(
        "SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados em .env. "
        "Verifique o arquivo backend/.env."
    )

# Cliente global do Supabase exportado para uso em todo o backend
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
