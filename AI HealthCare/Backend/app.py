from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, bcrypt
from routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)
    CORS(app)
    
    app.register_blueprint(api, url_prefix='/api')
    
    @app.route('/')
    def home():
        return {
            'message': 'Welcome to AI HealthCare API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'register': '/api/auth/register',
                'login': '/api/auth/login',
                'current_user': '/api/auth/me'
            }
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)