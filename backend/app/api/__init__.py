# This file intentionally left empty to make the directory a package
# Blueprint registrations are handled in the app/__init__.py file

from flask import Blueprint

api_bp = Blueprint('api', __name__)

# Import routes after creating the blueprint to avoid circular imports
from app.api import auth, exams, questions, candidates, results 