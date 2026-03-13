import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from controllers.auth_controller import auth_bp
from controllers.viaturas_controller import viaturas_bp
from controllers.abastecimento_controller import abastecimento_bp
from controllers.dashboard_controller import dashboard_bp
from routes.inspetores import inspetores_bp
from models.base import init_db, SessionLocal


def create_app() -> Flask:
    """Cria e configura a aplicação Flask principal."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(base_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)

    app = Flask(__name__)

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

    return app

# Instância global para o Vercel/Gunicorn encontrar
app = create_app()

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=bool(os.environ.get("FLASK_DEBUG", "1") == "1"))
