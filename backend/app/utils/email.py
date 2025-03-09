import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_email(recipient, subject, body, html=None):
    """
    Send an email to the specified recipient.
    
    Args:
        recipient (str): Email address of the recipient
        subject (str): Subject of the email
        body (str): Plain text body of the email
        html (str, optional): HTML body of the email
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Get email configuration from app config
        mail_server = current_app.config.get('MAIL_SERVER')
        mail_port = current_app.config.get('MAIL_PORT')
        mail_username = current_app.config.get('MAIL_USERNAME')
        mail_password = current_app.config.get('MAIL_PASSWORD')
        mail_use_tls = current_app.config.get('MAIL_USE_TLS')
        mail_default_sender = current_app.config.get('MAIL_DEFAULT_SENDER')
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = mail_default_sender
        msg['To'] = recipient
        
        # Attach plain text and HTML parts
        msg.attach(MIMEText(body, 'plain'))
        if html:
            msg.attach(MIMEText(html, 'html'))
        
        # Connect to server and send
        if mail_use_tls:
            server = smtplib.SMTP(mail_server, mail_port)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(mail_server, mail_port)
        
        server.login(mail_username, mail_password)
        server.sendmail(mail_default_sender, recipient, msg.as_string())
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_candidate_invitation(candidate, exam_url):
    """
    Send an invitation email to a candidate with their unique exam link.
    
    Args:
        candidate: Candidate model instance
        exam_url: URL to access the exam
    """
    subject = f"Invitation to Complete Online Assessment"
    
    body = f"""
    Hello {candidate.name},
    
    You have been invited to complete an online assessment.
    
    Please click the link below to access your assessment:
    {exam_url}
    
    This link is unique to you and should not be shared with others.
    
    The assessment will take approximately {candidate.exam.duration_minutes} minutes to complete.
    Once you start the assessment, you must complete it in one session.
    
    Good luck!
    """
    
    html = f"""
    <html>
      <body>
        <p>Hello {candidate.name},</p>
        <p>You have been invited to complete an online assessment.</p>
        <p>Please click the link below to access your assessment:</p>
        <p><a href="{exam_url}">{exam_url}</a></p>
        <p>This link is unique to you and should not be shared with others.</p>
        <p>The assessment will take approximately {candidate.exam.duration_minutes} minutes to complete.
        Once you start the assessment, you must complete it in one session.</p>
        <p>Good luck!</p>
      </body>
    </html>
    """
    
    return send_email(candidate.email, subject, body, html)

def send_result_notification(result):
    """
    Send a notification email to a candidate with their exam results.
    
    Args:
        result: Result model instance
    """
    candidate = result.candidate
    exam = result.exam
    
    subject = f"Your Assessment Results"
    
    body = f"""
    Hello {candidate.name},
    
    Thank you for completing the online assessment.
    
    Your results:
    Score: {result.score:.2f}%
    Status: {"Passed" if result.passed else "Failed"}
    
    {result.feedback if result.feedback else ""}
    
    Thank you for your participation.
    """
    
    html = f"""
    <html>
      <body>
        <p>Hello {candidate.name},</p>
        <p>Thank you for completing the online assessment.</p>
        <h3>Your results:</h3>
        <p>Score: <strong>{result.score:.2f}%</strong></p>
        <p>Status: <strong>{"Passed" if result.passed else "Failed"}</strong></p>
        {f"<p>{result.feedback}</p>" if result.feedback else ""}
        <p>Thank you for your participation.</p>
      </body>
    </html>
    """
    
    return send_email(candidate.email, subject, body, html)

def send_admin_notification(result):
    """
    Send a notification email to the admin when a candidate completes an exam.
    
    Args:
        result: Result model instance
    """
    candidate = result.candidate
    exam = result.exam
    admin_email = exam.creator.email
    
    subject = f"Assessment Completed: {candidate.name}"
    
    body = f"""
    Hello,
    
    {candidate.name} ({candidate.email}) has completed the assessment: {exam.title}.
    
    Results:
    Score: {result.score:.2f}%
    Status: {"Passed" if result.passed else "Failed"}
    
    {"This assessment contains open-ended questions that require manual evaluation." if any(a.question.question_type == 'open_ended' for a in result.answers) else ""}
    
    Please log in to the admin panel to view the complete results.
    """
    
    html = f"""
    <html>
      <body>
        <p>Hello,</p>
        <p><strong>{candidate.name}</strong> ({candidate.email}) has completed the assessment: <strong>{exam.title}</strong>.</p>
        <h3>Results:</h3>
        <p>Score: <strong>{result.score:.2f}%</strong></p>
        <p>Status: <strong>{"Passed" if result.passed else "Failed"}</strong></p>
        {f"<p><em>This assessment contains open-ended questions that require manual evaluation.</em></p>" if any(a.question.question_type == 'open_ended' for a in result.answers) else ""}
        <p>Please log in to the admin panel to view the complete results.</p>
      </body>
    </html>
    """
    
    return send_email(admin_email, subject, body, html) 