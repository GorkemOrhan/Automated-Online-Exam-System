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

### GitHub Pages Deployment (Frontend Only)

This project is configured to deploy the frontend to GitHub Pages using GitHub Actions:

1. Push your code to GitHub
2. Go to your repository settings and enable GitHub Pages
   - Navigate to Settings > Pages
   - Under "Build and deployment", select "GitHub Actions" as the source
3. The frontend will be automatically deployed when you push to the main branch
4. Your site will be available at `https://[username].github.io/[repository-name]`

#### Workflow Options

We've provided two GitHub Actions workflow files for deployment:

1. **Standard Workflow** (`.github/workflows/frontend-deploy.yml`): A basic workflow for deploying Next.js to GitHub Pages
2. **Official Next.js Workflow** (`.github/workflows/nextjs.yml`): Based on GitHub's official Next.js deployment template

If you encounter issues with one workflow, try using the other by manually triggering it from the Actions tab.

#### Connecting to Backend

Since GitHub Pages only hosts static content, you'll need to deploy your backend separately. After deploying your backend:

1. Go to your GitHub repository settings
2. Navigate to Settings > Secrets and variables > Actions
3. Add a new repository secret:
   - Name: `API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend-api.com/api`)
4. Trigger a new deployment by pushing a change or manually running the workflow

For more detailed instructions, see the [GitHub Pages Deployment Guide](docs/github-pages-deployment.md).

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