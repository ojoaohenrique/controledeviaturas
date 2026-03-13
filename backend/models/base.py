import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

engine = None
SessionLocal = sessionmaker(autocommit=False, autoflush=False)


def init_db() -> None:
    """
    Inicializa o engine SQLAlchemy usando SUPABASE_DB_URL.
    Exemplo de URL:
    postgresql+psycopg2://usuario:senha@host:5432/postgres
    """
    global engine, SessionLocal

    if engine is not None:
        return

    database_url = os.getenv("SUPABASE_DB_URL")
    if not database_url:
        raise RuntimeError(
            "Variável de ambiente SUPABASE_DB_URL não configurada. "
            "Defina-a no arquivo .env dentro de backend/."
        )

    engine = create_engine(database_url)
    SessionLocal.configure(bind=engine)

