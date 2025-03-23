from datetime import datetime
from .. import db

class Result(db.Model):
    """Result model for exam results."""
    __tablename__ = 'results'

    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Float, nullable=True)  # Percentage
    passed = db.Column(db.Boolean, nullable=True)
    feedback = db.Column(db.Text, nullable=True)  # For manual evaluation
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    
    # Relationships
    answers = db.relationship('Answer', backref='result', lazy=True, cascade='all, delete-orphan')

    def __init__(self, candidate_id, exam_id):
        self.candidate_id = candidate_id
        self.exam_id = exam_id

    def calculate_score(self):
        """Calculate the score based on answers."""
        total_points = sum(answer.question.points for answer in self.answers)
        earned_points = sum(answer.earned_points for answer in self.answers if answer.earned_points is not None)
        
        if total_points > 0:
            self.score = (earned_points / total_points) * 100
            # Get the passing score from the exam
            exam_passing_score = self.exam.passing_score
            self.passed = self.score >= exam_passing_score
        else:
            self.score = 0
            self.passed = False
        
        return self.score

    def to_dict(self, include_answers=False):
        """Convert result object to dictionary."""
        result = {
            'id': self.id,
            'score': self.score,
            'passed': self.passed,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'candidate_id': self.candidate_id,
            'exam_id': self.exam_id
        }
        
        if include_answers:
            result['answers'] = [answer.to_dict() for answer in self.answers]
        
        return result

    def __repr__(self):
        return f'<Result {self.id}>'


class Answer(db.Model):
    """Answer model for candidate responses to questions."""
    __tablename__ = 'answers'

    id = db.Column(db.Integer, primary_key=True)
    selected_option_id = db.Column(db.Integer, db.ForeignKey('options.id'), nullable=True)  # For multiple-choice
    text_response = db.Column(db.Text, nullable=True)  # For open-ended
    is_correct = db.Column(db.Boolean, nullable=True)  # For multiple-choice
    earned_points = db.Column(db.Float, nullable=True)  # Points earned for this answer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    result_id = db.Column(db.Integer, db.ForeignKey('results.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    
    # Relationships
    selected_option = db.relationship('Option', foreign_keys=[selected_option_id], lazy=True)

    def __init__(self, result_id, question_id, selected_option_id=None, text_response=None):
        self.result_id = result_id
        self.question_id = question_id
        self.selected_option_id = selected_option_id
        self.text_response = text_response
        
        # Automatically evaluate multiple-choice answers
        if selected_option_id and not text_response:
            self.evaluate_multiple_choice()
        
    def evaluate_multiple_choice(self):
        """Evaluate if the selected option is correct for multiple-choice questions."""
        if self.selected_option_id and self.question.question_type == 'multiple_choice':
            option = next((o for o in self.question.options if o.id == self.selected_option_id), None)
            if option:
                self.is_correct = option.is_correct
                self.earned_points = self.question.points if self.is_correct else 0
            else:
                self.is_correct = False
                self.earned_points = 0
        else:
            self.is_correct = None
            self.earned_points = None

    def evaluate_open_ended(self, points_awarded):
        """Manually evaluate open-ended answers."""
        if self.question.question_type == 'open_ended' and self.text_response:
            self.earned_points = min(points_awarded, self.question.points)
            self.earned_points = max(self.earned_points, 0)  # Ensure non-negative

    def to_dict(self):
        """Convert answer object to dictionary."""
        return {
            'id': self.id,
            'selected_option_id': self.selected_option_id,
            'text_response': self.text_response,
            'is_correct': self.is_correct,
            'earned_points': self.earned_points,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'result_id': self.result_id,
            'question_id': self.question_id
        }

    def __repr__(self):
        return f'<Answer {self.id}>' 