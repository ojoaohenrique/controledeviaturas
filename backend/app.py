import os

from dotenv import load_dotenv
from flask import Flask, jsonify, Response, send_from_directory
from flask_cors import CORS

from backend.controllers.auth_controller import auth_bp
from backend.controllers.viaturas_controller import viaturas_bp
from backend.controllers.abastecimento_controller import abastecimento_bp
from backend.controllers.dashboard_controller import dashboard_bp
from backend.routes.inspetores import inspetores_bp
from backend.models.base import init_db, SessionLocal


def create_app() -> Flask:
    """Cria e configura a aplicação Flask principal."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Load .env from backend or root for local development
    load_dotenv(os.path.join(base_dir, ".env"))
    load_dotenv(os.path.join(base_dir, '..', '.env'))

    # The static_folder path is relative to this file's location in /backend
    app = Flask(__name__, static_folder='../frontend')

    app.config["JSON_SORT_KEYS"] = False

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
        except Exception as exc:
            return jsonify({"status": "error", "detail": str(exc)}), 500

    @app.route("/js/env.js")
    def env_js():
        """Serves frontend environment variables as a JavaScript file."""
        # Note: Ensure the SUPABASE_KEY environment variable is set to the public 'anon' key,
        # as this will be exposed on the client side.
        content = f"""
window.ENV_SUPABASE_URL = "{os.getenv('SUPABASE_URL', '')}";
window.ENV_SUPABASE_ANON_KEY = "{os.getenv('SUPABASE_KEY', '')}";
window.ENV_API_BASE_URL = "/api";
"""
        return Response(content, mimetype='application/javascript')


    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        """Serves static files and the SPA's entry point."""
        static_folder = app.static_folder
        # If the path points to an existing file, serve it.
        if path != "" and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        # Otherwise, serve the SPA's entry point for client-side routing.
        else:
            return send_from_directory(static_folder, 'login.html')

    return app
