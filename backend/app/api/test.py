from flask import Blueprint, jsonify
import platform
import sys
import flask
import sqlalchemy
from .. import db
from ..models.user import User
from ..models.exam import Exam
from ..models.candidate import Candidate
from ..models.question import Question
from ..models.result import Result

# Create test blueprint
test_bp = Blueprint('test', __name__)

@test_bp.route('/ping', methods=['GET'])
def ping():
    """Simple endpoint to test API connectivity."""
    return jsonify({
        'status': 'success',
        'message': 'API is working correctly'
    }), 200

@test_bp.route('/version', methods=['GET'])
def version():
    """Endpoint to get the API version."""
    return jsonify({
        'version': '1.0.0',
        'status': 'success'
    }), 200

@test_bp.route('/system-info', methods=['GET'])
def system_info():
    """Return system information for debugging"""
    # Check database connection
    db_connected = True
    db_type = None
    db_version = None
    
    try:
        # Execute a simple query to check connection
        result = db.session.execute(db.text("SELECT 1"))
        
        # Get database info
        engine = db.session.get_bind()
        db_type = engine.dialect.name
        
        # Get version
        if db_type == 'sqlite':
            version = db.session.execute(db.text("SELECT sqlite_version()")).scalar()
            db_version = f"SQLite {version}"
        elif db_type == 'postgresql':
            version = db.session.execute(db.text("SHOW server_version")).scalar()
            db_version = f"PostgreSQL {version}"
        elif db_type == 'mysql':
            version = db.session.execute(db.text("SELECT VERSION()")).scalar()
            db_version = f"MySQL {version}"
    except Exception as e:
        db_connected = False
        print(f"Database connection error: {e}")
    
    # Get application stats
    stats = {
        'users': User.query.count(),
        'exams': Exam.query.count(),
        'candidates': Candidate.query.count(),
        'questions': Question.query.count(),
        'results': Result.query.count()
    }
    
    # System information
    info = {
        'python_version': platform.python_version(),
        'platform': platform.platform(),
        'flask_version': flask.__version__,
        'sqlalchemy_version': sqlalchemy.__version__,
        'environment': 'development' if flask.current_app.debug else 'production',
        'database': {
            'connected': db_connected,
            'type': db_type,
            'version': db_version
        },
        'stats': stats
    }
    
    return jsonify(info)

@test_bp.route('/error-test/<int:code>', methods=['GET'])
def error_test(code):
    """Endpoint to test error handling"""
    codes = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        422: "Unprocessable Entity",
        500: "Internal Server Error"
    }
    
    message = codes.get(code, "Unknown Error")
    
    response = {
        'status': 'error',
        'code': code,
        'message': message
    }
    
    return jsonify(response), code

@test_bp.route('/users', methods=['GET'])
def get_users():
    """Return a list of all users (for debugging only)."""
    users = User.query.all()
    return jsonify({
        'status': 'success',
        'users': [user.to_dict() for user in users]
    }), 200 