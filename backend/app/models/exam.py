from datetime import datetime
import uuid
from .. import db

class Exam(db.Model):
    """Exam model for defining tests."""
    __tablename__ = 'exams'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration_minutes = db.Column(db.Integer, nullable=False, default=60)
    passing_score = db.Column(db.Float, nullable=False, default=60.0)  # Percentage
    is_randomized = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    questions = db.relationship('Question', backref='exam', lazy=True, cascade='all, delete-orphan')
    candidates = db.relationship('Candidate', backref='exam', lazy=True)
    results = db.relationship('Result', backref='exam', lazy=True)

    def __init__(self, title, description, duration_minutes, passing_score, is_randomized, creator_id):
        self.title = title
        self.description = description
        self.duration_minutes = duration_minutes
        self.passing_score = passing_score
        self.is_randomized = is_randomized
        self.creator_id = creator_id

    def to_dict(self):
        """Convert exam object to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'duration_minutes': self.duration_minutes,
            'passing_score': self.passing_score,
            'is_randomized': self.is_randomized,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'creator_id': self.creator_id,
            'question_count': len(self.questions)
        }

    def __repr__(self):
        return f'<Exam {self.title}>' 