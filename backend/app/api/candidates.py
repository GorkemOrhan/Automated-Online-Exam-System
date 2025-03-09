from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api import api_bp
from app.models.exam import Exam
from app.models.candidate import Candidate
from app.models.result import Result
from app import db
from datetime import datetime

@api_bp.route('/candidates', methods=['POST'])
@jwt_required()
def create_candidate():
    """Create a new candidate for an exam."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'exam_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Verify exam exists and belongs to user
    exam = Exam.query.filter_by(id=data['exam_id'], creator_id=user_id).first()
    if not exam:
        return jsonify({'error': 'Exam not found or access denied'}), 404
    
    # Create new candidate
    candidate = Candidate(
        name=data['name'],
        email=data['email'],
        exam_id=data['exam_id']
    )
    
    db.session.add(candidate)
    db.session.commit()
    
    # TODO: Send email to candidate with unique link
    
    return jsonify({
        'message': 'Candidate created successfully',
        'candidate': candidate.to_dict()
    }), 201


@api_bp.route('/candidates/<int:candidate_id>', methods=['GET'])
@jwt_required()
def get_candidate(candidate_id):
    """Get a specific candidate by ID."""
    user_id = get_jwt_identity()
    candidate = Candidate.query.join(Exam).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    
    return jsonify(candidate.to_dict()), 200


@api_bp.route('/exams/<int:exam_id>/candidates', methods=['GET'])
@jwt_required()
def get_exam_candidates(exam_id):
    """Get all candidates for a specific exam."""
    user_id = get_jwt_identity()
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404
    
    candidates = Candidate.query.filter_by(exam_id=exam_id).all()
    return jsonify([candidate.to_dict() for candidate in candidates]), 200


@api_bp.route('/candidates/<int:candidate_id>', methods=['DELETE'])
@jwt_required()
def delete_candidate(candidate_id):
    """Delete a candidate."""
    user_id = get_jwt_identity()
    candidate = Candidate.query.join(Exam).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    
    db.session.delete(candidate)
    db.session.commit()
    
    return jsonify({'message': 'Candidate deleted successfully'}), 200


@api_bp.route('/exams/access/<string:unique_link>', methods=['GET'])
def access_exam(unique_link):
    """Access an exam using a unique link."""
    candidate = Candidate.query.filter_by(unique_link=unique_link).first()
    
    if not candidate:
        return jsonify({'error': 'Invalid access link'}), 404
    
    if candidate.is_test_completed:
        return jsonify({'error': 'Test already completed'}), 400
    
    # Mark test as started if not already
    if not candidate.test_start_time:
        candidate.test_start_time = datetime.utcnow()
        db.session.commit()
    
    # Get exam details
    exam = Exam.query.filter_by(id=candidate.exam_id).first()
    
    # Get questions (without correct answers)
    questions = []
    for question in exam.questions:
        question_dict = question.to_dict(include_correct_answers=False)
        questions.append(question_dict)
    
    # If exam is randomized, shuffle questions (this would be done in the frontend)
    
    return jsonify({
        'candidate': candidate.to_dict(),
        'exam': {
            'id': exam.id,
            'title': exam.title,
            'description': exam.description,
            'duration_minutes': exam.duration_minutes,
            'is_randomized': exam.is_randomized
        },
        'questions': questions
    }), 200


@api_bp.route('/exams/submit/<string:unique_link>', methods=['POST'])
def submit_exam(unique_link):
    """Submit exam answers."""
    candidate = Candidate.query.filter_by(unique_link=unique_link).first()
    
    if not candidate:
        return jsonify({'error': 'Invalid access link'}), 404
    
    if candidate.is_test_completed:
        return jsonify({'error': 'Test already completed'}), 400
    
    data = request.get_json()
    
    if 'answers' not in data:
        return jsonify({'error': 'No answers provided'}), 400
    
    # Mark test as completed
    candidate.is_test_completed = True
    candidate.test_end_time = datetime.utcnow()
    
    # Create result
    result = Result(
        candidate_id=candidate.id,
        exam_id=candidate.exam_id
    )
    
    db.session.add(result)
    db.session.commit()
    
    # Process answers
    from app.models.result import Answer
    from app.models.question import Question
    
    for answer_data in data['answers']:
        question_id = answer_data.get('question_id')
        question = Question.query.get(question_id)
        
        if not question:
            continue
        
        if question.question_type == 'multiple_choice':
            answer = Answer(
                result_id=result.id,
                question_id=question_id,
                selected_option_id=answer_data.get('selected_option_id')
            )
        else:  # open_ended
            answer = Answer(
                result_id=result.id,
                question_id=question_id,
                text_response=answer_data.get('text_response')
            )
        
        db.session.add(answer)
    
    db.session.commit()
    
    # Calculate score for multiple-choice questions
    result.calculate_score()
    db.session.commit()
    
    # TODO: Send email notifications
    
    return jsonify({
        'message': 'Exam submitted successfully',
        'result': result.to_dict()
    }), 200 