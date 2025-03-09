# Automated Online Exam System

A web-based platform for conducting online exams with automatic scoring and reporting.

## Features

- Personalized test links for candidates
- Multiple-choice and open-ended question support
- Timed exam environment
- Automatic scoring and result compilation
- Email notifications for candidates and HR team
- Admin interface for test management

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **Email**: SMTP

## Project Structure

```
automated-online-exam-system/
├── frontend/               # Next.js frontend application
├── backend/                # Flask backend application
├── database/               # Database scripts and migrations
└── docs/                   # Documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- PostgreSQL
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### Database Setup
```bash
# Instructions for setting up PostgreSQL database
```

## Development Roadmap

1. Project setup and repository structure
2. Database schema design
3. Backend API development
4. Frontend user interface development
5. Authentication and authorization
6. Exam creation and management
7. Exam taking functionality
8. Automatic scoring and reporting
9. Email notifications
10. Admin dashboard
11. Testing and bug fixes
12. Deployment 