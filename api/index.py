from backend.models.base import init_db, SessionLocal
from backend.routes.inspetores import inspetores_bp
from backend.controllers.dashboard_controller import dashboard_bp
from backend.controllers.abastecimento_controller import abastecimento_bp
from backend.controllers.viaturas_controller import viaturas_bp
from backend.controllers.auth_controller import auth_bp
from flask_cors import CORS
from flask import Flask, jsonify, send_from_directory
from dotenv import load_dotenv
import os
import sys


def create_app() -> Flask:
    """Cria e configura a aplicação Flask principal."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(base_dir, '..', 'backend', '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)

    # Also try to load from root .env
    root_env = os.path.join(base_dir, '..', '.env')
    if os.path.exists(root_env):
        load_dotenv(root_env)

    app = Flask(__name__, static_folder='../frontend')

    # Configuração básica
    app.config["JSON_SORT_KEYS"] = False

    # CORS – ajuste ORIGINS conforme a URL que você usar no frontend
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
    )

    # Inicializa conexão com banco (Supabase Postgres)
    init_db()

    # Blueprints das diferentes áreas do sistema
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(viaturas_bp, url_prefix="/api")
    app.register_blueprint(abastecimento_bp, url_prefix="/api")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(inspetores_bp, url_prefix="/api")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Endpoint simples para verificar se o backend está de pé."""
        try:
            # Tenta abrir e fechar uma sessão rapidamente
            db = SessionLocal()
            db.execute("SELECT 1")
            db.close()
            return jsonify({"status": "ok"}), 200
        except Exception as exc:  # pragma: no cover - apenas diagnóstico
            return jsonify({"status": "error", "detail": str(exc)}), 500

    # Serve static files from frontend directory
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        frontend_dir = os.path.join(
            os.path.dirname(__file__), '..', 'frontend')
        if path and os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        # Default to login.html for root and unmatched routes
        if os.path.exists(os.path.join(frontend_dir, 'login.html')):
            return send_from_directory(frontend_dir, 'login.html')
        return jsonify({"status": "ok", "message": "GML Controle de Viaturas API"}), 200

    return app


# Instância global para o Vercel/Gunicorn encontrar
app = create_app()


