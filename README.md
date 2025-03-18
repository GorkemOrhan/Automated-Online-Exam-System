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

## Deployment

### Complete Deployment Guide

For a full-stack application to work properly, you need to deploy both the frontend and backend:

1. **Frontend**: Deploy to GitHub Pages (static hosting)
2. **Backend**: Deploy to a platform that supports Python/Flask (Render, Railway, Heroku, etc.)
3. **Connect**: Configure the frontend to communicate with your deployed backend

For detailed instructions, see:
- [GitHub Pages Deployment Guide](docs/github-pages-deployment.md) (Frontend)
- [Backend Deployment Guide](docs/backend-deployment.md) (Backend)

### GitHub Pages Deployment (Frontend Only)

This project is configured to deploy the frontend to GitHub Pages using GitHub Actions:

1. Push your code to GitHub
2. Go to your repository settings and enable GitHub Pages
   - Navigate to Settings > Pages
   - Under "Build and deployment", select "GitHub Actions" as the source
3. The frontend will be automatically deployed when you push to the main branch
4. Your site will be available at `https://[username].github.io/[repository-name]`

#### Workflow Options

We've provided three GitHub Actions workflow files for deployment:

1. **Standard Workflow** (`.github/workflows/frontend-deploy.yml`): A basic workflow for deploying Next.js to GitHub Pages
2. **Official Next.js Workflow** (`.github/workflows/nextjs.yml`): Based on GitHub's official Next.js deployment template
3. **Simplified Workflow** (`.github/workflows/simple-nextjs.yml`): A streamlined workflow without complex caching (recommended for most users)

If you encounter issues with one workflow, try using another by manually triggering it from the Actions tab. The simplified workflow is recommended for most users as it avoids cache-related errors.

### Backend Deployment

Since GitHub Pages only hosts static content, you need to deploy your backend separately:

1. Choose a hosting platform that supports Python/Flask applications (Render, Railway, Heroku, etc.)
2. Deploy your backend code to the platform
3. Configure environment variables and database connections
4. Run the database initialization script to create the admin user

### Connecting Frontend to Backend

After deploying both parts:

1. Go to your GitHub repository settings
2. Navigate to Settings > Secrets and variables > Actions
3. Add a new repository secret:
   - Name: `API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend-api.com/api`)
4. Trigger a new deployment of your frontend

## Admin Access

The default admin credentials (set in `init_db.py`) are:
- Email: `admin@example.com`
- Password: `adminpassword`

Make sure your backend is properly deployed and the database is initialized before attempting to log in.

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