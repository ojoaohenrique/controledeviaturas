from decimal import Decimal

from flask import Blueprint, jsonify, request

from backend.models.base import SessionLocal
from backend.services.abastecimento_service import registrar_abastecimento
from backend.services.auth_service import AuthError, get_current_user_id

abastecimento_bp = Blueprint("abastecimento", __name__)


@abastecimento_bp.route("/abastecimento", methods=["POST"])
def novo_abastecimento():
    db = SessionLocal()
    try:
        try:
            user_id = get_current_user_id(request)
        except AuthError as exc:
            return jsonify({"error": str(exc)}), 401

        body = request.get_json(force=True) or {}
        required_fields = ["viatura_id", "km_abastecimento", "km_atual", "litros"]
        if any(f not in body for f in required_fields):
            return jsonify({"error": "Campos obrigatórios ausentes no abastecimento."}), 400

        try:
            registro = registrar_abastecimento(
                db,
                viatura_id=body["viatura_id"],
                km_abastecimento=Decimal(str(body["km_abastecimento"])),
                km_atual=Decimal(str(body["km_atual"])),
                litros=Decimal(str(body["litros"])),
                usuario_id=user_id,
            )
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

        return (
            jsonify(
                {
                    "id": str(registro.id),
                    "viatura_id": str(registro.viatura_id),
                    "km_abastecimento": float(registro.km_abastecimento),
                    "km_atual": float(registro.km_atual),
                    "litros": float(registro.litros),
                    "km_rodado": float(registro.km_rodado),
                    "media": float(registro.media),
                    "data_abastecimento": registro.data_abastecimento.isoformat(),
                    "usuario_id": str(registro.usuario_id),
                }
            ),
            201,
        )
    except Exception as exc:  # pragma: no cover
        db.rollback()
        return jsonify({"error": str(exc)}), 500
    finally:
        db.close()

