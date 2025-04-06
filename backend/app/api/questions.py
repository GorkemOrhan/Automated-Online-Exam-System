from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.question import Question, Option
from ..models.exam import Exam
from .. import db

# Create questions blueprint
questions_bp = Blueprint('questions', __name__)

@questions_bp.route('', methods=['GET'])
@jwt_required()
def get_all_questions():
    """Get all questions with optional filtering."""
    user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    exam_id = request.args.get('exam_id')
    question_type = request.args.get('question_type')
    search_text = request.args.get('search')
    
    # Start with a query that joins with exams to check permissions
    query = Question.query.join(Exam).filter(Exam.creator_id == user_id)
    
    # Apply filters if provided
    if exam_id:
        query = query.filter(Question.exam_id == exam_id)
    
    if question_type:
        query = query.filter(Question.question_type == question_type)
    
    if search_text:
        query = query.filter(Question.text.ilike(f'%{search_text}%'))
    
    # Execute query and get results
    questions = query.all()
    
    # Add exam title to each question
    result = []
    for question in questions:
        question_dict = question.to_dict(include_correct_answers=True)
        
        # Add exam title
        exam = Exam.query.get(question.exam_id)
        if exam:
            question_dict['exam_title'] = exam.title
        
        result.append(question_dict)
    
    return jsonify(result), 200

@questions_bp.route('', methods=['POST'])
@jwt_required()
def create_question():
    """Create a new question for an exam."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['exam_id', 'question_text', 'question_type', 'points']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if exam exists and belongs to user
    exam = Exam.query.filter_by(id=data['exam_id'], creator_id=user_id).first()
    if not exam:
        return jsonify({'error': 'Exam not found or access denied'}), 404
    
    # Validate question type
    valid_types = ['single_choice', 'multiple_choice', 'true_false', 'text']
    if data['question_type'] not in valid_types:
        return jsonify({'error': f'Invalid question type. Must be one of: {", ".join(valid_types)}'}), 400
    
    # Create new question with or without explanation
    try:
        question = Question(
            exam_id=data['exam_id'],
            text=data['question_text'],
            question_type=data['question_type'],
            points=data['points'],
            explanation=data.get('explanation', '')
        )
    except:
        # If explanation column doesn't exist, create without it
        question = Question(
            exam_id=data['exam_id'],
            text=data['question_text'],
            question_type=data['question_type'],
            points=data['points']
        )
    
    # Add options if provided
    options = data.get('options', [])
    if not options and question.question_type in ['single_choice', 'multiple_choice', 'true_false']:
        return jsonify({'error': 'Options are required for this question type'}), 400
    
    for option_data in options:
        option = Option(
            text=option_data.get('option_text', ''),
            is_correct=option_data.get('is_correct', False)
        )
        question.options.append(option)
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify({
        'message': 'Question created successfully',
        'question': question.to_dict(include_correct_answers=True)
    }), 201

@questions_bp.route('/<int:question_id>', methods=['GET'])
@jwt_required()
def get_question(question_id):
    """Get a specific question by ID."""
    user_id = get_jwt_identity()
    
    # Join Question with Exam to check permissions
    question = Question.query.join(Exam).filter(
        Question.id == question_id,
        Exam.creator_id == user_id
    ).first()
    
    if not question:
        return jsonify({'error': 'Question not found or access denied'}), 404
    
    return jsonify(question.to_dict(include_correct_answers=True)), 200

@questions_bp.route('/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    """Update an existing question."""
    user_id = get_jwt_identity()
    
    # Join Question with Exam to check permissions
    question = Question.query.join(Exam).filter(
        Question.id == question_id,
        Exam.creator_id == user_id
    ).first()
    
    if not question:
        return jsonify({'error': 'Question not found or access denied'}), 404
    
    data = request.get_json()
    
    # Update question fields
    if 'question_text' in data:
        question.text = data['question_text']
    if 'question_type' in data:
        # Validate question type
        valid_types = ['single_choice', 'multiple_choice', 'true_false', 'text']
        if data['question_type'] not in valid_types:
            return jsonify({'error': f'Invalid question type. Must be one of: {", ".join(valid_types)}'}), 400
        question.question_type = data['question_type']
    if 'points' in data:
        question.points = data['points']
    
    # Try to update explanation if column exists
    if 'explanation' in data:
        try:
            question.explanation = data['explanation']
        except:
            # If the column doesn't exist, ignore this field
            pass
    
    # Update options if provided
    if 'options' in data:
        # Remove existing options
        for option in question.options:
            db.session.delete(option)
        
        # Add new options
        for option_data in data['options']:
            option = Option(
                text=option_data.get('option_text', ''),
                is_correct=option_data.get('is_correct', False)
            )
            question.options.append(option)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Question updated successfully',
        'question': question.to_dict(include_correct_answers=True)
    }), 200

@questions_bp.route('/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    """Delete a question."""
    user_id = get_jwt_identity()
    
    # Join Question with Exam to check permissions
    question = Question.query.join(Exam).filter(
        Question.id == question_id,
        Exam.creator_id == user_id
    ).first()
    
    if not question:
        return jsonify({'error': 'Question not found or access denied'}), 404
    
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({'message': 'Question deleted successfully'}), 200

@questions_bp.route('/bulk', methods=['POST'])
@jwt_required()
def bulk_create_questions():
    """Create multiple questions for an exam in one request."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if 'exam_id' not in data:
        return jsonify({'error': 'Missing exam_id field'}), 400
    if 'questions' not in data or not isinstance(data['questions'], list):
        return jsonify({'error': 'Questions must be provided as a list'}), 400
    
    # Check if exam exists and belongs to user
    exam = Exam.query.filter_by(id=data['exam_id'], creator_id=user_id).first()
    if not exam:
        return jsonify({'error': 'Exam not found or access denied'}), 404
    
    created_questions = []
    
    try:
        for q_data in data['questions']:
            # Validate required fields for each question
            required_fields = ['question_text', 'question_type', 'points']
            for field in required_fields:
                if field not in q_data:
                    return jsonify({'error': f'Missing required field: {field} in question'}), 400
            
            # Validate question type
            valid_types = ['single_choice', 'multiple_choice', 'true_false', 'text']
            if q_data['question_type'] not in valid_types:
                return jsonify({'error': f'Invalid question type. Must be one of: {", ".join(valid_types)}'}), 400
            
            # Create new question with or without explanation
            try:
                question = Question(
                    exam_id=data['exam_id'],
                    text=q_data['question_text'],
                    question_type=q_data['question_type'],
                    points=q_data['points'],
                    explanation=q_data.get('explanation', '')
                )
            except:
                # If explanation column doesn't exist, create without it
                question = Question(
                    exam_id=data['exam_id'],
                    text=q_data['question_text'],
                    question_type=q_data['question_type'],
                    points=q_data['points']
                )
            
            # Add options if provided
            options = q_data.get('options', [])
            if not options and question.question_type in ['single_choice', 'multiple_choice', 'true_false']:
                return jsonify({'error': 'Options are required for this question type'}), 400
            
            for option_data in options:
                option = Option(
                    text=option_data.get('option_text', ''),
                    is_correct=option_data.get('is_correct', False)
                )
                question.options.append(option)
            
            db.session.add(question)
            created_questions.append(question)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully created {len(created_questions)} questions',
            'questions': [q.to_dict(include_correct_answers=True) for q in created_questions]
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create questions: {str(e)}'}), 500 