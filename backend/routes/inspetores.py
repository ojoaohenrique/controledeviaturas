from flask import Blueprint, jsonify, request

from backend.supabase_client import get_supabase_client

# Blueprint dedicado à rota de inspetores
inspetores_bp = Blueprint("inspetores", __name__)


def listar_inspetores():
    """
    Busca todos os registros da tabela 'inspetores' no Supabase.
    Retorna a lista de registros como uma lista de dicionários.
    """
    supabase = get_supabase_client()
    response = supabase.table("inspetores").select("*").execute()
    return response.data or []


def adicionar_inspetor(data):
    """
    Insere um novo registro na tabela 'inspetores'.
    Espera um dicionário com os campos compatíveis com a tabela.
    """
    supabase = get_supabase_client()
    response = supabase.table("inspetores").insert(data).execute()
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
    except ConnectionError as conn_err:
        return jsonify({"error": str(conn_err)}), 503  # Service Unavailable
    except Exception as exc:
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
    except ConnectionError as conn_err:
        return jsonify({"error": str(conn_err)}), 503  # Service Unavailable
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
