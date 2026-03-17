import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

engine = None
SessionLocal = sessionmaker(autocommit=False, autoflush=False)
DB_AVAILABLE = False


def init_db() -> None:
    """
    Inicializa o engine SQLAlchemy usando SUPABASE_DB_URL ou POSTGRES_URL.
    """
    global engine, SessionLocal, DB_AVAILABLE

    if engine is not None:
        return

    database_url = os.getenv("SUPABASE_DB_URL") or os.getenv("POSTGRES_URL")
    if not database_url:
        # Não falha na inicialização para que o frontend carregue.
        return

    try:
        engine = create_engine(database_url)
        SessionLocal.configure(bind=engine)
        DB_AVAILABLE = True
    except Exception:
        # Se o URL estiver inválido ou a conexão falhar, não quebramos o startup.
        engine = None
        DB_AVAILABLE = False

