from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.exam import Exam
from ..models.question import Question, Option
from .. import db

# Create exams blueprint
exams_bp = Blueprint('exams', __name__)

@exams_bp.route('', methods=['GET'])
@jwt_required()
def get_exams():
    """Get all exams for the authenticated user."""
    user_id = get_jwt_identity()
    exams = Exam.query.filter_by(creator_id=user_id).all()
    return jsonify([exam.to_dict() for exam in exams]), 200


@exams_bp.route('/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_exam(exam_id):
    """Get a specific exam by ID."""
    user_id = get_jwt_identity()
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404
    
    return jsonify(exam.to_dict()), 200


@exams_bp.route('', methods=['POST'])
@jwt_required()
def create_exam():
    """Create a new exam."""
    try:
        user_id = get_jwt_identity()
        print(f"User ID from JWT: {user_id}")
        
        if not user_id:
            print("No user ID found in token")
            return jsonify({'error': 'Invalid authentication token'}), 401
            
        # Check if user exists
        from ..models.user import User
        user = User.query.get(user_id)
        if not user:
            print(f"User with ID {user_id} not found")
            return jsonify({'error': 'User not found'}), 404
            
        print(f"User found: {user.username}")
        
        # Get and validate request data
        data = request.get_json()
        if not data:
            print("No JSON data in request")
            return jsonify({'error': 'No data provided'}), 400
            
        print(f"Received data: {data}")
        
        # Validate required fields
        required_fields = ['title', 'duration_minutes', 'passing_score']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        # Validate data types
        try:
            duration_minutes = int(data['duration_minutes'])
            passing_score = float(data['passing_score'])
        except (ValueError, TypeError) as e:
            print(f"Data type error: {e}")
            return jsonify({'error': f'Invalid data type: {str(e)}'}), 400
        
        # Create new exam
        exam = Exam(
            title=data['title'],
            description=data.get('description', ''),
            duration_minutes=duration_minutes,
            passing_score=passing_score,
            is_randomized=data.get('is_randomized', False),
            creator_id=user_id
        )
        
        db.session.add(exam)
        db.session.commit()
        
        print(f"Exam created successfully: {exam.id}")
        
        return jsonify({
            'message': 'Exam created successfully',
            'exam': exam.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating exam: {str(e)}")
        return jsonify({'error': f'Failed to create exam: {str(e)}'}), 500


@exams_bp.route('/<int:exam_id>', methods=['PUT'])
@jwt_required()
def update_exam(exam_id):
    """Update an existing exam."""
    user_id = get_jwt_identity()
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404
    
    data = request.get_json()
    
    # Update exam fields
    if 'title' in data:
        exam.title = data['title']
    if 'description' in data:
        exam.description = data['description']
    if 'duration_minutes' in data:
        exam.duration_minutes = data['duration_minutes']
    if 'passing_score' in data:
        exam.passing_score = data['passing_score']
    if 'is_randomized' in data:
        exam.is_randomized = data['is_randomized']
    if 'is_active' in data:
        exam.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Exam updated successfully',
        'exam': exam.to_dict()
    }), 200


@exams_bp.route('/<int:exam_id>', methods=['DELETE'])
@jwt_required()
def delete_exam(exam_id):
    """Delete an exam."""
    user_id = get_jwt_identity()
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404
    
    db.session.delete(exam)
    db.session.commit()
    
    return jsonify({'message': 'Exam deleted successfully'}), 200


@exams_bp.route('/<int:exam_id>/questions', methods=['GET'])
@jwt_required()
def get_exam_questions(exam_id):
    """Get all questions for a specific exam."""
    user_id = get_jwt_identity()
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404
    
    questions = Question.query.filter_by(exam_id=exam_id).all()
    return jsonify([question.to_dict(include_correct_answers=True) for question in questions]), 200 