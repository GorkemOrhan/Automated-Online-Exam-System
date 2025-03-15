#!/bin/bash

# This script helps set up GitHub Pages for your repository

echo "Setting up GitHub Pages for Automated Online Exam System (Frontend Only)"
echo "=================================================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "Not in a git repository. Please run this script from the root of your git repository."
    exit 1
fi

# Get the repository URL
REPO_URL=$(git config --get remote.origin.url)
if [ -z "$REPO_URL" ]; then
    echo "No remote repository found. Please add a remote repository first."
    echo "Example: git remote add origin https://github.com/username/repo.git"
    exit 1
fi

echo "Repository URL: $REPO_URL"
echo ""

# Extract username and repo name
if [[ $REPO_URL == *"github.com"* ]]; then
    if [[ $REPO_URL == *"https"* ]]; then
        # HTTPS URL
        USERNAME=$(echo $REPO_URL | sed -E 's/https:\/\/github.com\/([^\/]+)\/([^\/]+)(\.git)?/\1/')
        REPO_NAME=$(echo $REPO_URL | sed -E 's/https:\/\/github.com\/([^\/]+)\/([^\/]+)(\.git)?/\2/')
    else
        # SSH URL
        USERNAME=$(echo $REPO_URL | sed -E 's/git@github.com:([^\/]+)\/([^\/]+)(\.git)?/\1/')
        REPO_NAME=$(echo $REPO_URL | sed -E 's/git@github.com:([^\/]+)\/([^\/]+)(\.git)?/\2/')
    fi
    
    echo "Username: $USERNAME"
    echo "Repository name: $REPO_NAME"
    echo ""
    
    echo "To set up GitHub Pages:"
    echo "1. Go to https://github.com/$USERNAME/$REPO_NAME/settings/pages"
    echo "2. Under 'Build and deployment', select 'GitHub Actions' as the source"
    echo "3. Push your code to GitHub to trigger the GitHub Actions workflow"
    echo ""
    echo "Your frontend will be available at: https://$USERNAME.github.io/$REPO_NAME"
    echo ""
    echo "Don't forget to set up your backend separately!"
    echo "After deploying your backend, add the API URL as a secret in your GitHub repository:"
    echo "1. Go to https://github.com/$USERNAME/$REPO_NAME/settings/secrets/actions"
    echo "2. Add a new repository secret named 'API_URL' with the value of your backend URL"
else
    echo "Not a GitHub repository. This script only works with GitHub repositories."
    exit 1
fi 