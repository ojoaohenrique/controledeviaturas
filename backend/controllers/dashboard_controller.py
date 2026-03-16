from flask import Blueprint, jsonify, request

from backend.models.base import SessionLocal
from backend.services.auth_service import AuthError, get_current_user_id
from backend.services.dashboard_service import obter_dashboard

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard", methods=["GET"])
def dashboard():
    db = SessionLocal()
    try:
        try:
            _ = get_current_user_id(request)
        except AuthError as exc:
            return jsonify({"error": str(exc)}), 401

        dados = obter_dashboard(db)
        return jsonify(dados), 200
    except Exception as exc:  # pragma: no cover
        return jsonify({"error": str(exc)}), 500
    finally:
        db.close()

