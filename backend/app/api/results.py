from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api import api_bp
from app.models.exam import Exam
from app.models.candidate import Candidate
from app.models.result import Result, Answer
from app import db

@api_bp.route('/results/<int:result_id>', methods=['GET'])
@jwt_required()
def get_result(result_id):
    """Get a specific result by ID."""
    user_id = get_jwt_identity()
    result = Result.query.join(Exam).filter(
        Result.id == result_id,
        Exam.creator_id == user_id
    ).first()
    
    if not result:
        return jsonify({'error': 'Result not found'}), 404
    
    return jsonify(result.to_dict(include_answers=True)), 200


@api_bp.route('/exams/<int:exam_id>/results', methods=['GET'])
@jwt_required()
def get_exam_results(exam_id):
    """Get all results for a specific exam."""
    user_id = get_jwt_identity()
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404
    
    results = Result.query.filter_by(exam_id=exam_id).all()
    return jsonify([result.to_dict() for result in results]), 200


@api_bp.route('/candidates/<int:candidate_id>/result', methods=['GET'])
@jwt_required()
def get_candidate_result(candidate_id):
    """Get the result for a specific candidate."""
    user_id = get_jwt_identity()
    candidate = Candidate.query.join(Exam).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    
    result = Result.query.filter_by(candidate_id=candidate_id).first()
    
    if not result:
        return jsonify({'error': 'Result not found'}), 404
    
    return jsonify(result.to_dict(include_answers=True)), 200


@api_bp.route('/results/<int:result_id>/evaluate', methods=['PUT'])
@jwt_required()
def evaluate_open_ended(result_id):
    """Evaluate open-ended answers for a result."""
    user_id = get_jwt_identity()
    result = Result.query.join(Exam).filter(
        Result.id == result_id,
        Exam.creator_id == user_id
    ).first()
    
    if not result:
        return jsonify({'error': 'Result not found'}), 404
    
    data = request.get_json()
    
    if 'evaluations' not in data:
        return jsonify({'error': 'No evaluations provided'}), 400
    
    for eval_data in data['evaluations']:
        answer_id = eval_data.get('answer_id')
        points_awarded = eval_data.get('points_awarded')
        
        if not answer_id or points_awarded is None:
            continue
        
        answer = Answer.query.filter_by(id=answer_id, result_id=result_id).first()
        
        if not answer or answer.question.question_type != 'open_ended':
            continue
        
        answer.evaluate_open_ended(points_awarded)
    
    db.session.commit()
    
    # Recalculate score
    result.calculate_score()
    
    if 'feedback' in data:
        result.feedback = data['feedback']
    
    db.session.commit()
    
    # TODO: Send email notification to candidate
    
    return jsonify({
        'message': 'Result evaluated successfully',
        'result': result.to_dict(include_answers=True)
    }), 200


@api_bp.route('/results/<int:result_id>/export', methods=['GET'])
@jwt_required()
def export_result(result_id):
    """Export a result to PDF or Excel."""
    user_id = get_jwt_identity()
    result = Result.query.join(Exam).filter(
        Result.id == result_id,
        Exam.creator_id == user_id
    ).first()
    
    if not result:
        return jsonify({'error': 'Result not found'}), 404
    
    # TODO: Implement export functionality
    
    return jsonify({
        'message': 'Export functionality not implemented yet',
        'result': result.to_dict()
    }), 501  # Not Implemented 