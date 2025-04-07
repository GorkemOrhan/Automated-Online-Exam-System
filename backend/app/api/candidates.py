from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.candidate import Candidate
from ..models.exam import Exam
from ..models.result import Result
from .. import db
import uuid
from datetime import datetime

# Create candidates blueprint
candidates_bp = Blueprint('candidates', __name__)

@candidates_bp.route('', methods=['POST'])
@jwt_required()
def create_candidate():
    """Create a candidate or multiple candidates for an exam."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check if this is a bulk creation request (emails array is present)
    if 'emails' in data and isinstance(data['emails'], list):
        # Validate required fields for bulk creation
        if 'exam_id' not in data:
            return jsonify({'error': 'Missing required field: exam_id'}), 400
        
        # Check if exam exists and belongs to user
        exam = Exam.query.filter_by(id=data['exam_id'], creator_id=user_id).first()
        if not exam:
            return jsonify({'error': 'Exam not found or access denied'}), 404
        
        # Process each email
        created_candidates = []
        failed_emails = []
        
        for email in data['emails']:
            # Skip empty emails
            if not email or not isinstance(email, str) or not email.strip():
                continue
                
            email = email.strip()
            
            try:
                # Check if candidate with this email already exists for this exam
                existing_candidate = Candidate.query.filter_by(
                    email=email,
                    exam_id=data['exam_id']
                ).first()
                
                if existing_candidate:
                    failed_emails.append({
                        'email': email,
                        'reason': 'Email already exists for this exam'
                    })
                    continue
                
                # Generate name from email (part before @)
                name = email.split('@')[0]
                
                # Generate unique link
                unique_link = str(uuid.uuid4())
                
                # Create new candidate
                candidate = Candidate(
                    name=name,
                    email=email,
                    exam_id=data['exam_id'],
                    unique_link=unique_link
                )
                
                # Set additional attributes
                candidate.is_test_completed = False
                if data.get('send_invitation'):
                    candidate.invitation_sent = True
                    candidate.last_invited_at = datetime.utcnow()
                
                db.session.add(candidate)
                created_candidates.append(candidate)
                
            except Exception as e:
                failed_emails.append({
                    'email': email,
                    'reason': str(e)
                })
        
        # Commit all changes in one transaction
        db.session.commit()
        
        # Convert candidates to dictionaries for response
        candidates_dict = [candidate.to_dict() for candidate in created_candidates]
        
        return jsonify({
            'message': f'Created {len(created_candidates)} candidates ({len(failed_emails)} failed)',
            'candidates': candidates_dict,
            'failed_emails': failed_emails
        }), 201
    
    else:
        # Single candidate creation - validate required fields
        required_fields = ['name', 'email', 'exam_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if exam exists and belongs to user
        exam = Exam.query.filter_by(id=data['exam_id'], creator_id=user_id).first()
        if not exam:
            return jsonify({'error': 'Exam not found or access denied'}), 404
        
        # Check if candidate with this email already exists for this exam
        existing_candidate = Candidate.query.filter_by(
            email=data['email'],
            exam_id=data['exam_id']
        ).first()
        
        if existing_candidate:
            return jsonify({'error': 'A candidate with this email already exists for this exam'}), 400
        
        # Generate unique link
        unique_link = str(uuid.uuid4())
        
        # Create new candidate
        candidate = Candidate(
            name=data['name'],
            email=data['email'],
            exam_id=data['exam_id'],
            unique_link=unique_link
        )
        
        # Set additional attributes
        candidate.is_test_completed = False
        if data.get('send_invitation'):
            candidate.invitation_sent = True
            candidate.last_invited_at = datetime.utcnow()
        
        db.session.add(candidate)
        db.session.commit()
        
        return jsonify({
            'message': 'Candidate created successfully',
            'candidate': candidate.to_dict(),
            'unique_link': f"/exam/{unique_link}"
        }), 201


@candidates_bp.route('/<int:candidate_id>', methods=['GET'])
@jwt_required()
def get_candidate(candidate_id):
    """Get a specific candidate."""
    user_id = get_jwt_identity()
    
    # Join Candidate with Exam to check permissions
    candidate = Candidate.query.join(Exam).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found or access denied'}), 404
    
    return jsonify(candidate.to_dict()), 200


@candidates_bp.route('', methods=['GET'])
@jwt_required()
def get_candidates():
    """Get all candidates for the authenticated user."""
    user_id = get_jwt_identity()
    
    # Get all candidates across all exams owned by the user
    candidates = Candidate.query.join(Exam).filter(Exam.creator_id == user_id).all()
    
    return jsonify([candidate.to_dict() for candidate in candidates]), 200


@candidates_bp.route('/exams/<int:exam_id>/candidates', methods=['GET'])
@jwt_required()
def get_exam_candidates(exam_id):
    """Get all candidates for a specific exam."""
    user_id = get_jwt_identity()
    
    # Check if exam exists and belongs to user
    exam = Exam.query.filter_by(id=exam_id, creator_id=user_id).first()
    if not exam:
        return jsonify({'error': 'Exam not found or access denied'}), 404
    
    candidates = Candidate.query.filter_by(exam_id=exam_id).all()
    return jsonify([candidate.to_dict() for candidate in candidates]), 200


@candidates_bp.route('/<int:candidate_id>', methods=['DELETE'])
@jwt_required()
def delete_candidate(candidate_id):
    """Delete a candidate."""
    user_id = get_jwt_identity()
    
    # Join Candidate with Exam to check permissions
    candidate = Candidate.query.join(Exam).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found or access denied'}), 404
    
    db.session.delete(candidate)
    db.session.commit()
    
    return jsonify({'message': 'Candidate deleted successfully'}), 200


@candidates_bp.route('/<int:candidate_id>/send-invitation', methods=['POST'])
@jwt_required()
def send_invitation(candidate_id):
    """Send or resend an invitation to a candidate."""
    user_id = get_jwt_identity()
    
    # Join Candidate with Exam to check permissions
    candidate = Candidate.query.join(Exam).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found or access denied'}), 404
    
    # If the candidate doesn't have a unique link, generate one
    if not candidate.unique_link:
        candidate.unique_link = str(uuid.uuid4())
    
    # Update invitation timestamp
    candidate.last_invited_at = datetime.utcnow()
    db.session.commit()
    
    # In a real application, you would send an email here
    # For this example, we'll just return the link
    
    return jsonify({
        'message': 'Invitation sent successfully',
        'candidate': candidate.to_dict(),
        'unique_link': f"/exam/{candidate.unique_link}"
    }), 200


@candidates_bp.route('/access/<string:unique_link>', methods=['GET'])
def access_exam(unique_link):
    """Access an exam using a unique link."""
    candidate = Candidate.query.filter_by(unique_link=unique_link).first()
    
    if not candidate:
        return jsonify({'error': 'Invalid exam link'}), 404
    
    # Check if the exam is active
    exam = Exam.query.get(candidate.exam_id)
    if not exam or not exam.is_active:
        return jsonify({'error': 'This exam is not active'}), 403
    
    # Check if the candidate has already completed the test
    if candidate.is_test_completed:
        return jsonify({'error': 'You have already completed this exam'}), 403
    
    # If this is the first access, set the start time
    if not candidate.test_start_time:
        candidate.test_start_time = datetime.utcnow()
        db.session.commit()
    
    return jsonify({
        'message': 'Exam access granted',
        'exam': exam.to_dict(include_questions=True),
        'candidate': candidate.to_dict()
    }), 200


@candidates_bp.route('/submit/<string:unique_link>', methods=['POST'])
def submit_exam(unique_link):
    """Submit exam answers and process results."""
    candidate = Candidate.query.filter_by(unique_link=unique_link).first()
    
    if not candidate:
        return jsonify({'error': 'Invalid exam link'}), 404
    
    # Check if the candidate has already completed the test
    if candidate.is_test_completed:
        return jsonify({'error': 'You have already completed this exam'}), 403
    
    # Get the exam
    exam = Exam.query.get(candidate.exam_id)
    if not exam:
        return jsonify({'error': 'Exam not found'}), 404
    
    # Process submitted answers
    data = request.get_json()
    if 'answers' not in data:
        return jsonify({'error': 'No answers provided'}), 400
    
    # Calculate score
    total_points = 0
    earned_points = 0
    
    for question in exam.questions:
        total_points += question.points
        
        # Check if the question was answered
        if str(question.id) in data['answers']:
            answer = data['answers'][str(question.id)]
            
            # Process answer based on question type
            if question.question_type == 'multiple_choice':
                # For multiple choice, check if selected options match correct options
                correct_options = [opt.id for opt in question.options if opt.is_correct]
                if set(answer) == set(correct_options):
                    earned_points += question.points
            elif question.question_type == 'single_choice':
                # For single choice, check if selected option is correct
                for option in question.options:
                    if option.id == answer and option.is_correct:
                        earned_points += question.points
                        break
            elif question.question_type == 'true_false':
                # For true/false, check if answer matches correct option
                correct_option = next((opt.id for opt in question.options if opt.is_correct), None)
                if answer == correct_option:
                    earned_points += question.points
            elif question.question_type == 'text':
                # For text questions, store the answer for manual review
                # We won't automatically score text questions
                pass
    
    # Calculate percentage score
    percentage_score = (earned_points / total_points * 100) if total_points > 0 else 0
    
    # Determine if passed based on exam's passing score
    passed = percentage_score >= exam.passing_score
    
    # Create a result record
    result = Result(
        candidate_id=candidate.id,
        exam_id=exam.id,
        score=percentage_score,
        passed=passed,
        answers=data['answers']
    )
    
    # Update candidate record
    candidate.is_test_completed = True
    candidate.test_end_time = datetime.utcnow()
    
    db.session.add(result)
    db.session.commit()
    
    return jsonify({
        'message': 'Exam submitted successfully',
        'result': result.to_dict()
    }), 200


@candidates_bp.route('/<int:candidate_id>', methods=['PUT'])
@jwt_required()
def update_candidate(candidate_id):
    """Update a candidate."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Join Candidate with Exam to check permissions
    candidate = Candidate.query.join(Exam).filter(
        Candidate.id == candidate_id,
        Exam.creator_id == user_id
    ).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found or access denied'}), 404
    
    # Check if email has changed and if it's already taken
    if 'email' in data and data['email'] != candidate.email:
        existing_candidate = Candidate.query.filter_by(
            email=data['email'],
            exam_id=candidate.exam_id
        ).first()
        
        if existing_candidate and existing_candidate.id != candidate_id:
            return jsonify({'error': 'A candidate with this email already exists for this exam'}), 400
    
    # Update basic info
    if 'name' in data:
        candidate.name = data['name']
    
    if 'email' in data:
        candidate.email = data['email']
    
    # Update exam if provided
    if 'exam_id' in data:
        # Verify the exam belongs to the user
        new_exam = Exam.query.filter_by(id=data['exam_id'], creator_id=user_id).first()
        if not new_exam:
            return jsonify({'error': 'Exam not found or access denied'}), 404
        
        candidate.exam_id = data['exam_id']
    
    # Handle invitation status
    if 'send_invitation' in data and data['send_invitation']:
        candidate.invitation_sent = True
        candidate.last_invited_at = datetime.utcnow()
    
    candidate.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Candidate updated successfully',
        'candidate': candidate.to_dict()
    }), 200 