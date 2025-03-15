# GitHub Pages Deployment Guide

This guide will help you deploy the frontend of the Automated Online Exam System to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Your project pushed to a GitHub repository
3. Basic knowledge of Git commands

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

## Step 2: Enable GitHub Pages in Your Repository

1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll down to the "Pages" section in the sidebar
4. Under "Build and deployment", select "GitHub Actions" as the source

## Step 3: Configure Your Backend API URL

Since GitHub Pages only hosts static content, your backend needs to be hosted elsewhere. Once you have your backend deployed, you need to tell your frontend where to find it:

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" then "Actions"
4. Click on "New repository secret"
5. Name: `API_URL`
6. Value: Your backend API URL (e.g., `https://your-backend-api.com/api`)
7. Click "Add secret"

## Step 4: Trigger the Deployment

You can trigger the deployment in two ways:

1. Push a change to the `frontend` directory on the `main` branch
2. Manually trigger the workflow:
   - Go to your GitHub repository
   - Click on "Actions"
   - Select the "Simple Next.js Deployment" workflow (recommended)
   - Click on "Run workflow"
   - Select the branch (usually `main`) and click "Run workflow"

## Step 5: Access Your Deployed Frontend

After the workflow completes successfully:

1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll down to the "Pages" section
4. You'll see a message like "Your site is published at https://username.github.io/repo-name/"
5. Click on the URL to visit your deployed frontend

## Troubleshooting

### My frontend can't connect to the backend

Make sure:
1. Your backend is properly deployed and accessible
2. You've set the `API_URL` secret in your GitHub repository
3. Your backend has CORS configured to allow requests from your GitHub Pages URL

### The deployment workflow is failing

Check the workflow logs:
1. Go to your GitHub repository
2. Click on "Actions"
3. Click on the failed workflow run
4. Examine the logs to identify the issue

### Common Issues and Solutions

#### Cache-related Errors

If you see errors related to caching like "Cache not found for keys", try using our simplified workflow:

1. Go to your GitHub repository
2. Click on "Actions"
3. Select the "Simple Next.js Deployment" workflow
4. Click on "Run workflow"

We've provided three different workflow files with increasing levels of simplicity:

1. `.github/workflows/frontend-deploy.yml` - Our original workflow
2. `.github/workflows/nextjs.yml` - Based on GitHub's official Next.js template
3. `.github/workflows/simple-nextjs.yml` - A simplified workflow without complex caching

#### Next.js Build Errors

If your Next.js build is failing, check:
1. That all dependencies are installed
2. Your code doesn't have any syntax errors
3. You're not using features that aren't compatible with static exports

#### Static Export Issues

If you're having issues with the static export:
1. Make sure your Next.js version supports the `output: 'export'` configuration
2. Check that you're not using any features that aren't compatible with static exports (like API routes)
3. Ensure all your images are properly handled with the `unoptimized: true` setting

#### GitHub Actions Version Compatibility

If you're still encountering issues with GitHub Actions, try:
1. Using the latest versions of actions (we've updated to v4 where available)
2. Adding the `actions/configure-pages` step before the upload step
3. Using the simplified workflow that avoids complex caching mechanisms 