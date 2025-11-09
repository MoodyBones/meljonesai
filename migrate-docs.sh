#!/usr/bin/env bash
# Migration Script: Archive Old Docs & Setup New Documentation Structure
# For: MelJonesAI Project
# Date: 2025-11-09

set -e  # Exit on any error

echo "=================================================="
echo "MelJonesAI Documentation Migration Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Are you in the repo root?${NC}"
    echo "Please run this script from: /Users/melmini/Work/meljonesai"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking current repository structure...${NC}"
echo ""

# Check if .github exists
if [ -d ".github" ]; then
    echo -e "${GREEN}✓ Found .github directory${NC}"
    echo "Contents:"
    ls -la .github/
    echo ""
else
    echo -e "${YELLOW}⚠ No .github directory found${NC}"
fi

# Check if docs already exist in .github
if [ -d ".github/docs" ]; then
    echo -e "${YELLOW}⚠ Found .github/docs directory - will archive${NC}"
    OLD_DOCS_EXIST=true
else
    echo -e "${YELLOW}⚠ No .github/docs directory found${NC}"
    OLD_DOCS_EXIST=false
fi

# Check if there are any markdown files in .github root
GITHUB_MD_FILES=$(find .github -maxdepth 1 -name "*.md" 2>/dev/null | wc -l)
if [ "$GITHUB_MD_FILES" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $GITHUB_MD_FILES markdown files in .github root${NC}"
    find .github -maxdepth 1 -name "*.md"
    echo ""
    OLD_MD_EXIST=true
else
    OLD_MD_EXIST=false
fi

echo ""
echo -e "${BLUE}Step 2: Creating archive directory...${NC}"
ARCHIVE_DIR="archive/old-docs-2025-11-06"
mkdir -p "$ARCHIVE_DIR"
echo -e "${GREEN}✓ Created: $ARCHIVE_DIR${NC}"
echo ""

# Archive old docs if they exist
if [ "$OLD_DOCS_EXIST" = true ]; then
    echo -e "${BLUE}Step 3: Archiving old documentation from .github/docs...${NC}"
    git mv .github/docs/* "$ARCHIVE_DIR/" 2>/dev/null || {
        echo -e "${YELLOW}Note: Some files couldn't be moved with git mv, using regular mv...${NC}"
        mv .github/docs/* "$ARCHIVE_DIR/"
        git add "$ARCHIVE_DIR"
    }
    echo -e "${GREEN}✓ Archived .github/docs to $ARCHIVE_DIR${NC}"
    
    # Remove empty .github/docs directory
    rmdir .github/docs 2>/dev/null || echo -e "${YELLOW}Note: .github/docs directory not empty or doesn't exist${NC}"
    echo ""
fi

# Archive old markdown files in .github root if they exist
if [ "$OLD_MD_EXIST" = true ]; then
    echo -e "${BLUE}Step 3b: Archiving markdown files from .github root...${NC}"
    for file in .github/*.md; do
        if [ -f "$file" ]; then
            git mv "$file" "$ARCHIVE_DIR/" 2>/dev/null || {
                mv "$file" "$ARCHIVE_DIR/"
                git add "$ARCHIVE_DIR/$(basename "$file")"
            }
            echo -e "${GREEN}✓ Archived: $(basename "$file")${NC}"
        fi
    done
    echo ""
fi

echo -e "${BLUE}Step 4: Creating new documentation structure...${NC}"

# Create new docs directory structure
mkdir -p docs/learning-resources/questions
mkdir -p docs/learning-resources/posts

echo -e "${GREEN}✓ Created: docs/${NC}"
echo -e "${GREEN}✓ Created: docs/learning-resources/questions/${NC}"
echo -e "${GREEN}✓ Created: docs/learning-resources/posts/${NC}"
echo ""

echo -e "${BLUE}Step 5: Creating README in archive...${NC}"

# Create README in archive explaining what's there
cat > "$ARCHIVE_DIR/README.md" << 'EOF'
# Archived Documentation (2025-11-06)

This folder contains the original planning documentation created before the comprehensive documentation overhaul.

## What's Here

These documents were created during initial project setup but were replaced with a more comprehensive documentation suite.

## Current Documentation

For current, up-to-date documentation, see the `/docs` folder in the repository root.

**Start here:** [/docs/START_HERE.md](../../docs/START_HERE.md)

## Why Archived?

These docs are preserved for historical reference but should not be used for current development. The new documentation suite includes:

- Complete project specification
- Detailed 6-milestone roadmap
- GitHub Copilot integration guides
- Git workflow strategy
- Progress tracking system
- Learning resources with spaced repetition

## Archive Date

November 6, 2025
EOF

echo -e "${GREEN}✓ Created: $ARCHIVE_DIR/README.md${NC}"
echo ""

echo -e "${BLUE}Step 6: Creating placeholder files in new docs folder...${NC}"

# Create a README in docs folder
cat > docs/README.md << 'EOF'
# MelJonesAI Documentation

**Start here:** [START_HERE.md](START_HERE.md) ⭐

## Quick Navigation

**📖 Essential Reading (First Day)**
1. [START_HERE.md](START_HERE.md) - Complete overview and next steps
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Fast lookups and commands
3. [QUICKSTART.md](QUICKSTART.md) - Environment setup guide
4. [MILESTONE_SUMMARY.md](MILESTONE_SUMMARY.md) - Track your progress

**💻 Development Guides**
- [COPILOT_GUIDE_COMPLETE.md](COPILOT_GUIDE_COMPLETE.md) - Copy-paste AI prompts
- [GIT_STRATEGY.md](GIT_STRATEGY.md) - Branching and commit workflow

**📝 Reference**
- [INDEX.md](INDEX.md) - Complete document catalog
- [CHANGES.md](CHANGES.md) - Session history

**🎓 Learning Resources**
- [learning-resources/questions/](learning-resources/questions/) - Spaced repetition
- [learning-resources/posts/](learning-resources/posts/) - Deep dives

## Documentation Status

**Planning:** ✅ 100% Complete  
**Implementation:** 🎯 Ready to start  
**Confidence:** 90% 🎯

## Next Actions

1. Download new documentation files from Claude
2. Place them in this `docs/` folder
3. Follow [START_HERE.md](START_HERE.md) for implementation

---

*Documentation suite created: 2025-11-09*  
*Total size: ~260KB across 13 files*
EOF

echo -e "${GREEN}✓ Created: docs/README.md${NC}"
echo ""

# Create placeholder file to track what needs to be added
cat > docs/DOWNLOAD_INSTRUCTIONS.md << 'EOF'
# Download New Documentation Files

The new comprehensive documentation suite is ready! You need to download these files from Claude and place them in this `docs/` folder.

## Files to Download (13 files)

### Core Documents (Place in docs/)
1. **START_HERE.md** (17KB) ⭐ - Complete overview
2. **QUICK_REFERENCE.md** (8.6KB) ⭐ - Fast lookup guide
3. **QUICKSTART.md** (13KB) ⭐ - Setup guide
4. **MILESTONE_SUMMARY.md** (19KB) ⭐ - Progress tracking
5. **COPILOT_GUIDE_COMPLETE.md** (24KB) - AI prompts
6. **GIT_STRATEGY.md** (22KB) - Git workflow
7. **INDEX.md** (12KB) - Document catalog
8. **CHANGES.md** (13KB) - Session history

### Learning Resources (Place in learning-resources/)

**Questions (Place in learning-resources/questions/):**
9. **day_002_recall_questions.md** (9.5KB)

**Posts (Place in learning-resources/posts/):**
10. **day_002_linked_post_1.md** (7.5KB) - Technical deep dive
11. **day_002_linked_post_2.md** (9KB) - Product rationale

## How to Download

In Claude, use these links to download each file:

```
Core Documents:
computer:///mnt/user-data/outputs/START_HERE.md
computer:///mnt/user-data/outputs/QUICK_REFERENCE.md
computer:///mnt/user-data/outputs/QUICKSTART.md
computer:///mnt/user-data/outputs/MILESTONE_SUMMARY.md
computer:///mnt/user-data/outputs/COPILOT_GUIDE_COMPLETE.md
computer:///mnt/user-data/outputs/GIT_STRATEGY.md
computer:///mnt/user-data/outputs/INDEX.md
computer:///mnt/user-data/outputs/CHANGES.md

Learning Resources:
computer:///mnt/user-data/outputs/docs/learning-resources/questions/day_002_recall_questions.md
computer:///mnt/user-data/outputs/docs/learning-resources/posts/day_002_linked_post_1.md
computer:///mnt/user-data/outputs/docs/learning-resources/posts/day_002_linked_post_2.md
```

## After Downloading

1. Place core documents in `docs/`
2. Place questions in `docs/learning-resources/questions/`
3. Place posts in `docs/learning-resources/posts/`
4. Delete this file (DOWNLOAD_INSTRUCTIONS.md)
5. Run: `git add docs/`
6. Commit with the provided commit message below

## Commit Message

```
docs: add comprehensive documentation suite

- Add 13 new documentation files (260KB total)
- Archive old docs to archive/old-docs-2025-11-06/
- Include: project spec, roadmap, Git strategy, Copilot guides
- Add learning resources (Day 002) with spaced repetition
- Ready for 8-hour MVP implementation

See docs/START_HERE.md for complete overview.
```

## Verification

After adding files, verify with:
```bash
ls -lh docs/
ls -lh docs/learning-resources/questions/
ls -lh docs/learning-resources/posts/
```

You should see all 13 files listed above.
EOF

echo -e "${GREEN}✓ Created: docs/DOWNLOAD_INSTRUCTIONS.md${NC}"
echo ""

echo -e "${BLUE}Step 7: Updating main README.md...${NC}"

# Backup existing README if it exists
if [ -f "README.md" ]; then
    cp README.md README.md.backup
    echo -e "${GREEN}✓ Backed up existing README.md to README.md.backup${NC}"
fi

# Check if README already has documentation section
if grep -q "## 📚 Documentation" README.md 2>/dev/null; then
    echo -e "${YELLOW}⚠ README.md already has Documentation section - not modifying${NC}"
    echo "You may want to manually update it to point to docs/START_HERE.md"
else
    # Add documentation section to README
    cat >> README.md << 'EOF'

## 📚 Documentation

**Start here:** [docs/START_HERE.md](docs/START_HERE.md) ⭐

Complete project documentation is in the `docs/` folder:

- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Fast lookups and daily commands
- **[Setup Guide](docs/QUICKSTART.md)** - Environment configuration
- **[Progress Tracking](docs/MILESTONE_SUMMARY.md)** - Daily task checklists
- **[Copilot Guide](docs/COPILOT_GUIDE_COMPLETE.md)** - AI-assisted development
- **[Git Strategy](docs/GIT_STRATEGY.md)** - Branching and workflow
- **[Complete Index](docs/INDEX.md)** - All documentation catalog

### Quick Start

1. Read [docs/START_HERE.md](docs/START_HERE.md) for complete overview
2. Follow [docs/QUICKSTART.md](docs/QUICKSTART.md) for environment setup
3. Track progress in [docs/MILESTONE_SUMMARY.md](docs/MILESTONE_SUMMARY.md)
4. Use [docs/COPILOT_GUIDE_COMPLETE.md](docs/COPILOT_GUIDE_COMPLETE.md) for development

**Documentation Status:** Planning 100% ✅ | Implementation Ready 🎯
EOF
    echo -e "${GREEN}✓ Added documentation section to README.md${NC}"
fi
echo ""

echo -e "${BLUE}Step 8: Staging changes for Git...${NC}"

# Stage all changes
git add archive/
git add docs/
git add README.md 2>/dev/null || true
git add .github/ 2>/dev/null || true

echo -e "${GREEN}✓ Staged all changes${NC}"
echo ""

echo -e "${BLUE}Step 9: Showing what will be committed...${NC}"
echo ""
git status
echo ""

echo "=================================================="
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo "1. Download new documentation files from Claude"
echo "   See: docs/DOWNLOAD_INSTRUCTIONS.md for links"
echo ""
echo "2. Place files in docs/ folder:"
echo "   - Core docs → docs/"
echo "   - Questions → docs/learning-resources/questions/"
echo "   - Posts → docs/learning-resources/posts/"
echo ""
echo "3. After downloading, stage new files:"
echo "   ${BLUE}git add docs/${NC}"
echo ""
echo "4. Commit everything:"
echo "   ${BLUE}git commit -m \"docs: comprehensive documentation overhaul"
echo ""
echo "   - Archive old docs to archive/old-docs-2025-11-06/"
echo "   - Add 13-file documentation suite (260KB)"
echo "   - Include: specs, roadmap, Git strategy, Copilot guides"
echo "   - Add learning resources (Day 002)"
echo "   - Ready for 8-hour MVP implementation"
echo ""
echo "   See docs/START_HERE.md for complete overview.\"${NC}"
echo ""
echo "5. Push to GitHub:"
echo "   ${BLUE}git push${NC}"
echo ""
echo "=================================================="
echo -e "${GREEN}Structure Created:${NC}"
echo ""
echo "meljonesai/"
echo "├── archive/"
echo "│   └── old-docs-2025-11-06/    ← Old docs archived here"
echo "│       └── README.md           ← Explains what's archived"
echo "├── docs/                        ← New documentation home"
echo "│   ├── README.md               ← Navigation guide"
echo "│   ├── DOWNLOAD_INSTRUCTIONS.md ← How to get files"
echo "│   └── learning-resources/"
echo "│       ├── questions/"         ← Spaced repetition"
echo "│       └── posts/              ← Deep dives"
echo "├── .github/                     ← GitHub configs (kept)"
echo "└── README.md                    ← Updated with doc links"
echo ""
echo "=================================================="
echo ""
echo -e "${BLUE}📋 Review changes before committing:${NC}"
echo "   git status"
echo "   git diff --staged"
echo ""
echo -e "${BLUE}🎯 Follow docs/DOWNLOAD_INSTRUCTIONS.md next!${NC}"
echo ""
