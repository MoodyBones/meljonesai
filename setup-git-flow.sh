#!/usr/bin/env bash
# Setup Git Flow - Create and Configure Develop Branch
# For: MelJonesAI Project
# Date: 2025-11-09

set -e

echo "=================================================="
echo "MelJonesAI - Git Flow Setup"
echo "Creating develop branch and configuring workflow"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if in repo
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not in a git repository!${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking current state...${NC}"
echo ""

# Show current branches
echo "Current branches:"
git branch -a
echo ""

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Current branch: ${GREEN}$CURRENT_BRANCH${NC}"
echo ""

# Check if develop already exists
if git show-ref --verify --quiet refs/heads/develop; then
    echo -e "${YELLOW}⚠ develop branch already exists locally${NC}"
    DEVELOP_EXISTS=true
else
    echo -e "${GREEN}✓ develop branch doesn't exist yet${NC}"
    DEVELOP_EXISTS=false
fi

# Check if develop exists on remote
if git ls-remote --heads origin develop | grep -q develop; then
    echo -e "${YELLOW}⚠ develop branch exists on remote${NC}"
    DEVELOP_REMOTE=true
else
    echo -e "${GREEN}✓ develop branch doesn't exist on remote${NC}"
    DEVELOP_REMOTE=false
fi

echo ""
echo -e "${BLUE}Step 2: Ensuring we're up to date with main...${NC}"

# Make sure main is up to date
git checkout main
git pull origin main

echo -e "${GREEN}✓ main branch updated${NC}"
echo ""

if [ "$DEVELOP_EXISTS" = false ]; then
    echo -e "${BLUE}Step 3: Creating develop branch from main...${NC}"
    git checkout -b develop
    echo -e "${GREEN}✓ Created develop branch${NC}"
else
    echo -e "${BLUE}Step 3: Switching to existing develop branch...${NC}"
    git checkout develop
    git pull origin develop 2>/dev/null || echo "develop not on remote yet"
    echo -e "${GREEN}✓ Switched to develop${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Pushing develop to GitHub...${NC}"

if [ "$DEVELOP_REMOTE" = false ]; then
    git push -u origin develop
    echo -e "${GREEN}✓ Pushed develop to GitHub${NC}"
else
    git push origin develop
    echo -e "${GREEN}✓ Updated develop on GitHub${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Verifying setup...${NC}"
echo ""

# Show all branches
echo "All branches:"
git branch -a
echo ""

# Show default remote branch
echo "Remote default branch:"
git remote show origin | grep "HEAD branch"
echo ""

echo "=================================================="
echo -e "${GREEN}✅ Git Flow Setup Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${YELLOW}NEXT STEPS (in GitHub UI):${NC}"
echo ""
echo "1. Set develop as default branch:"
REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
echo "   → Go to: $REPO_URL/settings/branches"
echo "   → Under 'Default branch', click the ↔️ switch icon"
echo "   → Select 'develop'"
echo "   → Click 'Update' and confirm"
echo ""
echo "2. Add branch protection for main:"
echo "   → Still in Settings → Branches"
echo "   → Click 'Add branch protection rule'"
echo "   → Branch name pattern: ${GREEN}main${NC}"
echo "   → Enable: ✅ Require pull request before merging"
echo "   → Enable: ✅ Require approvals (set to 1)"
echo "   → Click 'Create'"
echo ""
echo "3. (Optional) Add lighter protection for develop:"
echo "   → Click 'Add branch protection rule' again"
echo "   → Branch name pattern: ${GREEN}develop${NC}"
echo "   → Enable: ✅ Require pull request before merging"
echo "   → Leave approvals optional"
echo "   → Click 'Create'"
echo ""
echo "=================================================="
echo -e "${BLUE}Your New Workflow:${NC}"
echo ""
echo "┌─────────────────────────────────────┐"
echo "│ main (production)                   │"
echo "│   ↑ PR only                         │"
echo "│ develop (staging - you are here)    │"
echo "│   ↓ branch for features             │"
echo "│ feature/* (work branches)           │"
echo "└─────────────────────────────────────┘"
echo ""
echo -e "${GREEN}To start a new feature:${NC}"
echo "  git checkout develop"
echo "  git pull origin develop"
echo "  git checkout -b feature/m1-firebase"
echo ""
echo -e "${GREEN}To complete a feature:${NC}"
echo "  git push origin feature/m1-firebase"
echo "  # Create PR on GitHub: feature → develop"
echo "  # Merge PR"
echo "  git checkout develop"
echo "  git pull origin develop"
echo ""
echo -e "${GREEN}To release to production:${NC}"
echo "  # Create PR on GitHub: develop → main"
echo "  # Merge PR (triggers Hostinger deploy)"
echo "  git checkout main"
echo "  git pull origin main"
echo "  git tag -a v1.0.0 -m 'Release v1.0.0'"
echo "  git push --tags"
echo ""
echo "=================================================="
echo ""
echo -e "${YELLOW}📚 Documentation Updated:${NC}"
echo ""
echo "Download new Git strategy guide:"
echo "  GIT_STRATEGY_UPDATED.md"
echo ""
echo "This explains:"
echo "  - Complete Git Flow workflow"
echo "  - Branch protection setup"
echo "  - Daily commands"
echo "  - Milestone mapping"
echo "  - Emergency hotfix process"
echo ""
echo "=================================================="
echo ""
echo -e "${GREEN}You're on develop branch now. Ready to start M1!${NC}"
echo ""
