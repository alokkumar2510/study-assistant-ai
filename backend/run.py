"""
run.py
------
Entry point for the Flask development server.
Run this file to start the backend:
    python run.py
"""

from app import create_app

# Create the Flask application using the app factory
app = create_app()

if __name__ == "__main__":
    # Start the development server on port 5000
    # - debug=True enables auto-reload and detailed error pages
    # - host="0.0.0.0" makes it accessible from other devices on the network
    app.run(host="0.0.0.0", port=5000, debug=True)
