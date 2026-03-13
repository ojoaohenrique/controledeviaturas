from flask import Blueprint, jsonify, request

from supabase_client import supabase

# Blueprint dedicado à rota de inspetores
inspetores_bp = Blueprint("inspetores", __name__)


def listar_inspetores():
    """
    Busca todos os registros da tabela 'inspetores' no Supabase.
    Retorna a lista de registros como uma lista de dicionários.
    """
    response = supabase.table("inspetores").select("*").execute()
    # response.data já é uma lista de dicts vinda do Supabase Python client
    return response.data or []


def adicionar_inspetor(data):
    """
    Insere um novo registro na tabela 'inspetores'.
    Espera um dicionário com os campos compatíveis com a tabela.
    """
    response = supabase.table("inspetores").insert(data).execute()
    # Retorna o primeiro registro inserido (Supabase devolve lista)
    if response.data:
        return response.data[0]
    return None


@inspetores_bp.route("/inspetores", methods=["GET"])
def get_inspetores():
    """
    GET /inspetores
    Lista todos os inspetores cadastrados no Supabase.
    """
    try:
        inspetores = listar_inspetores()
        return jsonify(inspetores), 200
    except Exception as exc:  # pragma: no cover - rota de exemplo
        return jsonify({"error": str(exc)}), 500


@inspetores_bp.route("/inspetores", methods=["POST"])
def post_inspetor():
    """
    POST /inspetores
    Insere um novo inspetor na tabela.
    Exemplo de corpo JSON:
    {
      "nome": "INSP MAIK",
      "matricula": "123",
      "turno": "Diurno"
    }
    """
    try:
        payload = request.get_json(force=True) or {}
        if not payload:
            return jsonify({"error": "Corpo da requisição vazio."}), 400

        novo = adicionar_inspetor(payload)
        return jsonify(novo), 201
    except Exception as exc:  # pragma: no cover - rota de exemplo
        return jsonify({"error": str(exc)}), 500

