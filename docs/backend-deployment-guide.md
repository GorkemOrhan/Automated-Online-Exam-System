# Backend Deployment Guide for Render

This guide explains how to deploy your Flask backend API to Render.com and connect it with your GitHub Pages frontend.

## Step 1: Prepare Your Repository

You've already completed this step! The necessary files have been created:

1. `backend/render.yaml`: Configuration file for Render
2. Updated CORS settings in `backend/app/__init__.py`
3. Updated GitHub Actions workflow in `.github/workflows/publish.yml`

## Step 2: Deploy Your Backend to Render

1. **Create a Render Account**
   - Go to [render.com](https://render.com/) and sign up for a free account
   - Connect your GitHub account when prompted

2. **Create a New Web Service**
   - From your Render dashboard, click **New** and select **Web Service**
   - Find and select your GitHub repository
   - Render should automatically detect the `render.yaml` file in your backend directory
   - If not, manually configure:
     - Name: `exam-system-api` (or choose your own name)
     - Environment: `Python 3`
     - Root Directory: `backend` (if your backend is in a subdirectory)
     - Build Command: `pip install -r requirements.txt && python init_db.py`
     - Start Command: `gunicorn app:app`
     - Select the free plan ($0/month)

3. **Set Environment Variables**
   - When prompted, you'll need to set these "secret" environment variables:
     - `SECRET_KEY`: Generate a secure random string (e.g., `openssl rand -hex 32`)
     - `JWT_SECRET_KEY`: Generate another secure random string (different from SECRET_KEY)
     - `ADMIN_PASSWORD`: Create a secure password for the admin user

4. **Deploy Your Service**
   - Click **Create Web Service**
   - Render will build and deploy your backend API
   - This might take a few minutes

5. **Get Your API URL**
   - Once deployed, Render will provide a URL for your API
   - It will look something like: `https://exam-system-api.onrender.com`
   - **Important**: Add `/api` to the end when using it in the next step

## Step 3: Connect Your Frontend to Your Backend

1. **Add API URL to GitHub Secrets**
   - Go to your GitHub repository
   - Click on **Settings**
   - Click on **Secrets and variables** then **Actions**
   - Add a new repository secret:
     - Name: `BACKEND_API_URL`
     - Value: `https://exam-system-api.onrender.com/api` (replace with your actual Render URL)

2. **Update CORS Configuration**
   - In `backend/app/__init__.py`, replace `yourusername.github.io` with your actual GitHub Pages domain
   - This will typically be: `yourusername.github.io` or `organization.github.io/repository-name`
   - Commit and push this change to your repository

3. **Trigger Frontend Redeployment**
   - Make a small change to any file in your frontend directory
   - Commit and push the change to GitHub
   - This will trigger the GitHub Actions workflow to rebuild your frontend with the new API URL

## Step 4: Test Your Application

1. **Check Backend API Health**
   - Visit `https://your-render-service.onrender.com/api/auth/test`
   - You should see a success message

2. **Test Your Frontend**
   - Go to your GitHub Pages URL: `https://yourusername.github.io/repository-name`
   - Try to log in with the admin credentials:
     - Email: `admin@example.com`
     - Password: The password you set in the `ADMIN_PASSWORD` environment variable

## Troubleshooting

### CORS Issues
If you see CORS errors in your browser console:
- Double-check your CORS configuration in `app/__init__.py`
- Make sure your GitHub Pages domain is correctly listed in the allowed origins
- Remember that it can take a few minutes for Render to apply your changes

### Database Issues
Render's free tier uses an ephemeral filesystem, which means your SQLite database will be reset when the service restarts. For a production app:
- Consider upgrading to a paid Render tier with persistent storage
- Or migrate to Render's PostgreSQL service (available on paid plans)

### Cold Starts
Render's free tier will put your application to sleep after 15 minutes of inactivity, causing a delay on the first request. This is normal behavior for the free tier.

### Authentication Problems
If you can't log in:
- Make sure the admin user was created during the initialization (`python init_db.py`)
- Check if your frontend is using the correct API URL
- Look at the browser's developer tools network tab for any error responses

## Maintenance

Remember that:
- Any changes to your backend code will automatically trigger a redeployment on Render (if you connected your GitHub repository)
- Any changes to your frontend code will trigger a GitHub Pages redeployment
- You can manually redeploy from the Render dashboard if needed 