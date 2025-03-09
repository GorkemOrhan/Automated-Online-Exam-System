import csv
import io
import json
from datetime import datetime

def export_to_csv(result):
    """
    Export a result to CSV format.
    
    Args:
        result: Result model instance
    
    Returns:
        str: CSV data as a string
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Exam Result'])
    writer.writerow([])
    
    # Write exam and candidate info
    writer.writerow(['Exam Title', result.exam.title])
    writer.writerow(['Candidate Name', result.candidate.name])
    writer.writerow(['Candidate Email', result.candidate.email])
    writer.writerow(['Date Completed', result.candidate.test_end_time.strftime('%Y-%m-%d %H:%M:%S')])
    writer.writerow(['Score', f"{result.score:.2f}%"])
    writer.writerow(['Status', "Passed" if result.passed else "Failed"])
    writer.writerow([])
    
    # Write answers
    writer.writerow(['Question', 'Answer', 'Correct', 'Points Earned', 'Points Possible'])
    
    for answer in result.answers:
        question = answer.question
        
        if question.question_type == 'multiple_choice':
            answer_text = answer.selected_option.text if answer.selected_option else 'No answer'
            is_correct = 'Yes' if answer.is_correct else 'No'
        else:  # open_ended
            answer_text = answer.text_response or 'No answer'
            is_correct = 'N/A'
        
        writer.writerow([
            question.text,
            answer_text,
            is_correct,
            f"{answer.earned_points or 0:.2f}",
            f"{question.points:.2f}"
        ])
    
    # Add feedback if available
    if result.feedback:
        writer.writerow([])
        writer.writerow(['Feedback'])
        writer.writerow([result.feedback])
    
    return output.getvalue()

def export_to_json(result):
    """
    Export a result to JSON format.
    
    Args:
        result: Result model instance
    
    Returns:
        str: JSON data as a string
    """
    data = {
        'exam': {
            'id': result.exam.id,
            'title': result.exam.title,
            'description': result.exam.description,
            'passing_score': result.exam.passing_score
        },
        'candidate': {
            'id': result.candidate.id,
            'name': result.candidate.name,
            'email': result.candidate.email,
            'test_start_time': result.candidate.test_start_time.isoformat() if result.candidate.test_start_time else None,
            'test_end_time': result.candidate.test_end_time.isoformat() if result.candidate.test_end_time else None
        },
        'result': {
            'id': result.id,
            'score': result.score,
            'passed': result.passed,
            'feedback': result.feedback,
            'created_at': result.created_at.isoformat()
        },
        'answers': []
    }
    
    for answer in result.answers:
        question = answer.question
        
        answer_data = {
            'question': {
                'id': question.id,
                'text': question.text,
                'question_type': question.question_type,
                'points': question.points
            },
            'answer': {
                'id': answer.id,
                'is_correct': answer.is_correct,
                'earned_points': answer.earned_points
            }
        }
        
        if question.question_type == 'multiple_choice':
            if answer.selected_option:
                answer_data['answer']['selected_option'] = {
                    'id': answer.selected_option.id,
                    'text': answer.selected_option.text
                }
            else:
                answer_data['answer']['selected_option'] = None
        else:  # open_ended
            answer_data['answer']['text_response'] = answer.text_response
        
        data['answers'].append(answer_data)
    
    return json.dumps(data, indent=2) 