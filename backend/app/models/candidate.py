from datetime import datetime
import uuid
from app import db

class Candidate(db.Model):
    """Candidate model for exam takers."""
    __tablename__ = 'candidates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    unique_link = db.Column(db.String(100), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    is_test_completed = db.Column(db.Boolean, default=False)
    test_start_time = db.Column(db.DateTime, nullable=True)
    test_end_time = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    
    # Relationships
    result = db.relationship('Result', backref='candidate', lazy=True, uselist=False)

    def __init__(self, name, email, exam_id):
        self.name = name
        self.email = email
        self.exam_id = exam_id
        self.unique_link = str(uuid.uuid4())

    def to_dict(self):
        """Convert candidate object to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'unique_link': self.unique_link,
            'is_test_completed': self.is_test_completed,
            'test_start_time': self.test_start_time.isoformat() if self.test_start_time else None,
            'test_end_time': self.test_end_time.isoformat() if self.test_end_time else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'exam_id': self.exam_id
        }

    def __repr__(self):
        return f'<Candidate {self.name}>' 