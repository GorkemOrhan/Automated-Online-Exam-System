from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api import api_bp
from app.models.exam import Exam
from app.models.question import Question, Option
from app import db

@api_bp.route('/questions', methods=['POST'])
@jwt_required()
def create_question():
    """Create a new question for an exam."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['text', 'question_type', 'points', 'exam_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Verify exam exists and belongs to user
    exam = Exam.query.filter_by(id=data['exam_id'], creator_id=user_id).first()
    if not exam:
        return jsonify({'error': 'Exam not found or access denied'}), 404
    
    # Create new question
    question = Question(
        text=data['text'],
        question_type=data['question_type'],
        points=data['points'],
        exam_id=data['exam_id'],
        order=data.get('order')
    )
    
    db.session.add(question)
    db.session.commit()
    
    # If it's a multiple-choice question, add options
    if question.question_type == 'multiple_choice' and 'options' in data:
        for option_data in data['options']:
            option = Option(
                text=option_data['text'],
                is_correct=option_data.get('is_correct', False),
                question_id=question.id,
                order=option_data.get('order')
            )
            db.session.add(option)
        
        db.session.commit()
    
    return jsonify({
        'message': 'Question created successfully',
        'question': question.to_dict(include_correct_answers=True)
    }), 201


@api_bp.route('/questions/<int:question_id>', methods=['GET'])
@jwt_required()
def get_question(question_id):
    """Get a specific question by ID."""
    user_id = get_jwt_identity()
    question = Question.query.join(Exam).filter(
        Question.id == question_id,
        Exam.creator_id == user_id
    ).first()
    
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    return jsonify(question.to_dict(include_correct_answers=True)), 200


@api_bp.route('/questions/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_question(question_id):
    """Update an existing question."""
    user_id = get_jwt_identity()
    question = Question.query.join(Exam).filter(
        Question.id == question_id,
        Exam.creator_id == user_id
    ).first()
    
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    data = request.get_json()
    
    # Update question fields
    if 'text' in data:
        question.text = data['text']
    if 'question_type' in data:
        question.question_type = data['question_type']
    if 'points' in data:
        question.points = data['points']
    if 'order' in data:
        question.order = data['order']
    
    # Update options if provided
    if 'options' in data and question.question_type == 'multiple_choice':
        # Delete existing options
        for option in question.options:
            db.session.delete(option)
        
        # Add new options
        for option_data in data['options']:
            option = Option(
                text=option_data['text'],
                is_correct=option_data.get('is_correct', False),
                question_id=question.id,
                order=option_data.get('order')
            )
            db.session.add(option)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Question updated successfully',
        'question': question.to_dict(include_correct_answers=True)
    }), 200


@api_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_question(question_id):
    """Delete a question."""
    user_id = get_jwt_identity()
    question = Question.query.join(Exam).filter(
        Question.id == question_id,
        Exam.creator_id == user_id
    ).first()
    
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({'message': 'Question deleted successfully'}), 200 