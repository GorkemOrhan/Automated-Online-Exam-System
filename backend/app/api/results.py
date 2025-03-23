from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.result import Result
from ..models.candidate import Candidate
from ..models.exam import Exam
from .. import db

# Create results blueprint
results_bp = Blueprint('results', __name__)

@results_bp.route('', methods=['GET'])
@jwt_required()
def get_all_results():
    """Get all results for exams created by the authenticated user."""
    user_id = get_jwt_identity()
    
    # Join the tables to filter results that belong to exams created by this user
    results = Result.query.join(
        Exam, Result.exam_id == Exam.id
    ).filter(
        Exam.creator_id == user_id
    ).all()
    
    return jsonify([result.to_dict() for result in results]), 200


@results_bp.route('/exams/<int:exam_id>', methods=['GET'])
@jwt_required()
def get_exam_results(exam_id):
    """Get all results for a specific exam."""
    user_id = get_jwt_identity()
    
    # Verify the exam belongs to the authenticated user
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    if not exam:
        return jsonify({'error': 'Exam not found or access denied'}), 404
    
    results = Result.query.filter_by(exam_id=exam_id).all()
    return jsonify([result.to_dict() for result in results]), 200


@results_bp.route('/<int:result_id>', methods=['GET'])
@jwt_required()
def get_result(result_id):
    """Get a specific result."""
    user_id = get_jwt_identity()
    
    # Join the tables to verify the result belongs to an exam created by this user
    result = Result.query.join(
        Exam, Result.exam_id == Exam.id
    ).filter(
        Result.id == result_id,
        Exam.creator_id == user_id
    ).first()
    
    if not result:
        return jsonify({'error': 'Result not found or access denied'}), 404
    
    return jsonify(result.to_dict()), 200


@results_bp.route('/candidates/<int:candidate_id>', methods=['GET'])
@jwt_required()
def get_candidate_results(candidate_id):
    """Get all results for a specific candidate."""
    user_id = get_jwt_identity()
    
    # Verify the candidate belongs to an exam created by the authenticated user
    candidate = Candidate.query.join(
        Exam, Candidate.exam_id == Exam.id
    ).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found or access denied'}), 404
    
    results = Result.query.filter_by(candidate_id=candidate_id).all()
    return jsonify([result.to_dict() for result in results]), 200


@results_bp.route('/<int:result_id>/review', methods=['PUT'])
@jwt_required()
def update_result_review(result_id):
    """Update manual review scores and feedback for a result."""
    user_id = get_jwt_identity()
    
    # Verify the result belongs to an exam created by this user
    result = Result.query.join(
        Exam, Result.exam_id == Exam.id
    ).filter(
        Result.id == result_id,
        Exam.creator_id == user_id
    ).first()
    
    if not result:
        return jsonify({'error': 'Result not found or access denied'}), 404
    
    data = request.get_json()
    
    # Update manual scores
    if 'manual_scores' in data:
        result.manual_scores = data['manual_scores']
    
    # Update feedback
    if 'feedback' in data:
        result.feedback = data['feedback']
    
    # Recalculate score if necessary
    if 'manual_scores' in data and result.manual_scores:
        # TODO: Implement score recalculation logic
        pass
    
    db.session.commit()
    
    return jsonify({
        'message': 'Result updated successfully',
        'result': result.to_dict()
    }), 200


@results_bp.route('/results/<int:result_id>/evaluate', methods=['PUT'])
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


@results_bp.route('/results/<int:result_id>/export', methods=['GET'])
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