# Backend Deployment Guide

This guide will help you deploy the backend of your Automated Online Exam System to work with your GitHub Pages frontend.

## Prerequisites

1. A GitHub account
2. Your project pushed to a GitHub repository
3. Your frontend already deployed to GitHub Pages
4. An account on a platform that supports Python/Flask applications (Render, Railway, Heroku, etc.)

## Step 1: Prepare Your Backend for Deployment

1. Make sure your backend has all the necessary dependencies in `requirements.txt`
2. Ensure your backend is configured to accept requests from your GitHub Pages domain
3. Update your backend to use environment variables for configuration

### Update CORS Configuration

In your Flask application, make sure CORS is properly configured to allow requests from your GitHub Pages domain:

```python
# In your app/__init__.py or wherever you configure your Flask app
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    # Configure CORS to allow requests from your GitHub Pages domain
    CORS(app, resources={r"/api/*": {"origins": [
        "https://yourusername.github.io",  # Replace with your GitHub Pages domain
        "http://localhost:3000"  # For local development
    ]}})
    # ... rest of your app configuration
    return app
```

## Step 2: Deploy Your Backend to Render (Recommended)

Render is a great platform for deploying Flask applications and offers a free tier.

1. Create an account on [Render](https://render.com/)
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure your web service:
   - Name: `automated-exam-system-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && gunicorn app:app`
   - Select the free plan
5. Add environment variables:
   - `SECRET_KEY`: A random string for Flask's secret key
   - `DATABASE_URL`: Your database connection string (Render provides a free PostgreSQL database)
   - Any other environment variables your application needs
6. Click "Create Web Service"

## Step 3: Connect Your Frontend to Your Backend

After your backend is deployed, you need to update your GitHub Actions workflow to use the correct backend URL:

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" then "Actions"
4. Add or update the `API_URL` secret:
   - Name: `API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (replace with your actual backend URL)
5. Trigger a new deployment of your frontend by pushing a change or manually running the workflow

## Step 4: Test Your Application

1. Go to your GitHub Pages URL: `https://yourusername.github.io/your-repo-name`
2. Try to log in with your admin credentials:
   - Email: `admin@example.com`
   - Password: `adminpassword`
3. If everything is set up correctly, you should be able to log in and access the admin dashboard

## Troubleshooting

### Login Failed Error

If you're still getting a "Login Failed" error:

1. Open your browser's developer tools (F12 or right-click > Inspect)
2. Go to the Network tab
3. Try to log in again
4. Look for the login request and check:
   - The request URL (make sure it's going to your backend)
   - The response (check for any error messages)
   - Any CORS errors in the console

### CORS Issues

If you see CORS errors in the console:

1. Make sure your backend's CORS configuration includes your GitHub Pages domain
2. Check that your backend is actually running and accessible
3. Verify that your API URL is correct in the GitHub repository secrets

### Database Issues

If your backend is deployed but you're still having issues:

1. Make sure your database is properly set up on your hosting platform
2. Check that the database connection string is correct
3. Verify that the admin user exists in the database

## Admin Credentials

According to your `init_db.py` file, the default admin credentials are:

- Email: `admin@example.com`
- Password: `adminpassword`

Make sure you've run the database initialization script on your deployed backend to create these credentials. 