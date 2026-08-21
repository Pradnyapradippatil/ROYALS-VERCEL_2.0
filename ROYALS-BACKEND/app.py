from flask import Flask
from flask_cors import CORS

from dotenv import load_dotenv

from config.config import configure_app

from routes.contact_routes import contact_bp
from routes.career_routes import career_bp
from routes.test_routes import test_bp


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


# ==========================================
# CREATE FLASK APP
# ==========================================

app = Flask(__name__)


# ==========================================
# CONFIGURATION
# ==========================================

configure_app(app)


# ==========================================
# CORS
# ==========================================

CORS(app)




# ==========================================
# REGISTER BLUEPRINTS
# ==========================================

app.register_blueprint(contact_bp)
app.register_blueprint(career_bp)
app.register_blueprint(test_bp)


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return "Royals Backend is running!"


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":

    app.run(debug=True)