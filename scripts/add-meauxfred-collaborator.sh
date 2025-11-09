#!/bin/bash

# Script to add MeauxFred (Graphic Designer) as a collaborator to GitHub repos
# Usage: ./add-meauxfred-collaborator.sh [username]
# Default repo: Meaux-Cloud-Internal-Company-Workspace-
# Default username: MeauxFred

REPO_NAME="Meaux-Cloud-Internal-Company-Workspace-"
USERNAME="${1:-MeauxFred}"

echo "🔧 Adding collaborator to GitHub repo..."
echo "Repository: InnerAnimal/$REPO_NAME"
echo "Username: $USERNAME"
echo "Repo URL: git@github.com:InnerAnimal/$REPO_NAME.git"
echo ""

# Check if GitHub CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub CLI not authenticated"
    echo "Run: gh auth login"
    exit 1
fi

# Add collaborator
echo "Adding $USERNAME as collaborator..."
gh api repos/InnerAnimal/$REPO_NAME/collaborators/$USERNAME \
    -X PUT \
    -f permission=push

if [ $? -eq 0 ]; then
    echo "✅ Successfully added $USERNAME to InnerAnimal/$REPO_NAME"
    echo "They will receive an invitation email."
else
    echo "❌ Failed to add collaborator"
    echo ""
    echo "Alternative: Use GitHub web interface:"
    echo "https://github.com/InnerAnimal/$REPO_NAME/settings/access"
    exit 1
fi

