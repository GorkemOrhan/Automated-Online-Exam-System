from datetime import datetime
from .. import db

class Question(db.Model):
    """Question model for exam questions."""
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), nullable=False)  # 'multiple_choice', 'open_ended'
    points = db.Column(db.Float, nullable=False, default=1.0)
    order = db.Column(db.Integer, nullable=True)  # For non-randomized exams
    # Make explanation column nullable and with a server default
    explanation = db.Column(db.Text, nullable=True, server_default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    
    # Relationships
    options = db.relationship('Option', backref='question', lazy=True, cascade='all, delete-orphan')
    answers = db.relationship('Answer', backref='question', lazy=True)

    def __init__(self, text, question_type, points, exam_id, explanation='', order=None):
        self.text = text
        self.question_type = question_type
        self.points = points
        self.exam_id = exam_id
        self.explanation = explanation
        self.order = order

    def to_dict(self, include_correct_answers=False):
        """Convert question object to dictionary."""
        result = {
            'id': self.id,
            'text': self.text,
            'question_type': self.question_type,
            'points': self.points,
            'order': self.order,
            'exam_id': self.exam_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        # Try to access explanation, but don't fail if column doesn't exist yet
        try:
            result['explanation'] = self.explanation
        except:
            result['explanation'] = ''
        
        # Include options
        options_list = []
        for option in self.options:
            option_dict = {
                'id': option.id,
                'text': option.text,
                'order': option.order
            }
            if include_correct_answers and self.question_type in ['multiple_choice', 'single_choice', 'true_false']:
                option_dict['is_correct'] = option.is_correct
            options_list.append(option_dict)
        
        result['options'] = options_list
        return result

    def __repr__(self):
        return f'<Question {self.id}>'


class Option(db.Model):
    """Option model for multiple-choice questions."""
    __tablename__ = 'options'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)

    def __init__(self, text, is_correct=False, question_id=None, order=None):
        self.text = text
        self.is_correct = is_correct
        if question_id:
            self.question_id = question_id
        self.order = order

    def __repr__(self):
        return f'<Option {self.id}>' 