"""
app/__init__.py
---------------
PREPIFY Flask application factory.
Creates app, configures JWT, CORS, and registers all route blueprints.
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

jwt = JWTManager()


def create_app():
    """
    Create and configure the Flask application.

    Returns:
        Flask: The configured Flask app instance.
    """
    # Create the Flask app
    app = Flask(__name__)

    # Load configuration from our Config class
    app.config.from_object(Config)

    # Enable CORS so the React frontend can talk to this backend
    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"))

    # Initialize JWT
    jwt.init_app(app)

    # --------------------------------------------------
    # Register route blueprints (one per feature area)
    # --------------------------------------------------
    from app.routes.notes import notes_bp
    from app.routes.flashcards import flashcards_bp
    from app.routes.quiz import quiz_bp
    from app.routes.chat import chat_bp
    from app.routes.auth import auth_bp
    from app.routes.attendance import attendance_bp
    from app.routes.pomodoro import pomodoro_bp
    from app.routes.goals import goals_bp

    app.register_blueprint(notes_bp, url_prefix="/api/notes")
    app.register_blueprint(flashcards_bp, url_prefix="/api/flashcards")
    app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
    app.register_blueprint(pomodoro_bp, url_prefix="/api/pomodoro")
    app.register_blueprint(goals_bp, url_prefix="/api/goals")

    # --------------------------------------------------
    # Health check route
    # --------------------------------------------------
    @app.route("/api/health")
    def health_check():
        """Simple health check endpoint."""
        return {"status": "ok", "message": "PREPIFY API is running!"}

    return app
