import os
import signal
import sys
from app import create_app
from flask import current_app

# Explicitly set development configuration
os.environ["FLASK_CONFIG"] = "development"
os.environ["FLASK_DEBUG"] = "1"

# Get configuration from environment
config_name = os.environ.get("FLASK_CONFIG", "default")
app = create_app(config_name)


def signal_handler(sig, frame):
    print("\n⛔ Shutting down server...")
    sys.exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5000))

    # Set debug mode based on environment
    debug = os.environ.get("FLASK_DEBUG", "1").lower() in ["1", "true"]

    # Print database connection info
    with app.app_context():
        db_uri = current_app.config.get("SQLALCHEMY_DATABASE_URI", "")
        if "mysql" in db_uri:
            print(f"🔌 Connected to MySQL database: {db_uri.split('/')[-1]}")
        elif "sqlite" in db_uri:
            print(f"🔌 Using SQLite database")
        else:
            print(f"🔌 Database: {db_uri}")

    # Only use 0.0.0.0 if in debug mode or network access is explicitly enabled
    network_access = os.environ.get("NETWORK_ACCESS", "1").lower() in ["1", "true"]
    if not (debug or network_access) and host == "0.0.0.0":
        host = "127.0.0.1"

    # SSL settings
    ssl_enabled = os.environ.get("SSL_ENABLED", "0").lower() in ["1", "true"]
    cert_file = os.environ.get(
        "SSL_CERT", os.path.join(os.path.dirname(__file__), "certs", "cert.pem")
    )
    key_file = os.environ.get(
        "SSL_KEY", os.path.join(os.path.dirname(__file__), "certs", "key.pem")
    )

    # Check if certificates exist if SSL is enabled
    https_available = (
        ssl_enabled and os.path.exists(cert_file) and os.path.exists(key_file)
    )

    if https_available:
        print(f"🔒 Running with HTTPS on port {port}")
        app.run(host=host, port=port, debug=debug, ssl_context=(cert_file, key_file))
    else:
        if ssl_enabled:
            print(f"⚠️ SSL certificates not found. Falling back to HTTP.")
        print(f"🌐 Running with HTTP on port {port}")
        app.run(host=host, port=port, debug=debug)
