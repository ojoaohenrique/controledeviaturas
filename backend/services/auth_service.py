import os
from typing import Optional

from flask import Request
from supabase import Client, create_client


class AuthError(Exception):
    """Erro genérico de autenticação."""


def _get_bearer_token(request: Request) -> str:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise AuthError("Cabeçalho Authorization ausente ou inválido.")
    return header.split(" ", 1)[1]


def get_current_user_id(request: Request) -> str:
    """
    Extrai e valida o token do Supabase e retorna o user_id (UUID como string).
    Usa o endpoint de verificação do próprio Supabase.
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    if not supabase_url or not supabase_key:
        raise AuthError("SUPABASE_URL ou SUPABASE_ANON_KEY não configurado.")

    token = _get_bearer_token(request)

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        response = supabase.auth.get_user(token)
        user = response.user
        if not user or not user.id:
            raise AuthError("Usuário não identificado no token.")
        return user.id
    except Exception as exc:
        raise AuthError(f"Token inválido ou expirado. Detalhes: {exc}")
