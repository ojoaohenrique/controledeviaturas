from flask import Blueprint, jsonify, request

from services.auth_service import AuthError, get_current_user_id

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login_proxy():
    """
    Endpoint opcional para login via backend.
    No fluxo atual o login é feito direto no frontend com supabase-js,
    então aqui retornamos 501 para indicar que não é utilizado.
    """
    return jsonify({"error": "Login deve ser feito diretamente via Supabase Auth no frontend."}), 501


@auth_bp.route("/me", methods=["GET"])
def me():
    """
    Exemplo de endpoint autenticado: retorna apenas o user_id proveniente do token.
    Útil para testar se a integração com Supabase Auth está funcionando.
    """
    try:
        user_id = get_current_user_id(request)
        return jsonify({"user_id": user_id}), 200
    except AuthError as exc:
        return jsonify({"error": str(exc)}), 401

