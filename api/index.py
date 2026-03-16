import os

# This is the Vercel entry point.
# The `PYTHONPATH` in vercel.json adds the project root to the path.
# This allows us to import directly from the `backend` module.

# Import the app factory from the backend module
from backend.app import create_app

# Instância global para o Vercel/Gunicorn encontrar
# Vercel's Python WSGI server looks for a variable named `app`.
app = create_app()

# This block is for local development and will not run on Vercel.
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Use debug=True for local development to get auto-reloading and stack traces.
    app.run(host="0.0.0.0", port=port, debug=True)
