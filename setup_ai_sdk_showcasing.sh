#!/usr/bin/env bash
set -euo pipefail

# Script to set up GitHub Copilot agent configuration and dependencies
# Usage: ./setup_ai_sdk_showcasing.sh <target_directory>

# Check if target directory is provided
if [ $# -eq 0 ]; then
  echo "Usage: ./setup_ai_sdk_showcasing.sh <target_directory>" >&2
  echo "Example: ./setup_ai_sdk_showcasing.sh ./next-js-app-router" >&2
  exit 1
fi

TARGET_DIR="$1"

# Verify target directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "📦 Target directory '$TARGET_DIR' does not exist. Creating Next.js app..."
#  exit 1
   pnpm create next-app@latest $TARGET_DIR --use-pnpm --typescript --eslint --tailwind --app --react-compiler --no-src-dir --no-import-alias
fi

# Step 1: CD into the target directory
echo "📁 Changing to directory: $TARGET_DIR"
cd "$TARGET_DIR" || exit 1

# Step 2: Create ./generated/docs-copilot directory
echo "📂 Creating directory: ./generated/docs-copilot"
mkdir -p ./generated/docs-copilot

# Step 3: Create GitHub Copilot agent instructions file
mkdir -p ./.github
INSTRUCTIONS_FILE="./.github/copilot-instructions.md"
echo "✍️  Creating Copilot instructions file: $INSTRUCTIONS_FILE"

cat > "$INSTRUCTIONS_FILE" << 'EOF'
# GitHub Copilot Agent Instructions

## Project Overview
This project is a modern web application built with a cutting-edge tech stack.

## Development Environment

### Package Manager
- **Primary Package Manager**: pnpm
- All dependencies should be managed through pnpm
- Use `pnpm install`, `pnpm add`, and `pnpm remove` commands

### Command Execution Environment
- **Shell**: Git Bash (bash.exe on Windows)
- All commands should be executable in a Git Bash console
- Use Unix-style command syntax and paths with forward slashes

### Documentation Generation
- Generated documentation should be saved under: `./generated/docs-copilot`
- Focus on quality over quantity - avoid creating excessive documentation
- Document only essential features, APIs, and setup procedures

## Technology Stack

The project uses the following technologies and frameworks:

### Core Framework & Language
- **Next.js**: React framework for production
- **TypeScript**: Static typing for JavaScript
- **React**: Version 19.2 - Modern component library with latest features

### AI & Utilities
- **@ai-sdk**: AI integration library for LLM interactions
- **@ai-sdk/react**: React hooks and utilities for AI features
- **zod**: Schema validation and type inference library

### Styling
- **Tailwind CSS**: Version 4 - Utility-first CSS framework
- TailwindUI compatible components recommended

### Code Quality
- **ESLint**: JavaScript/TypeScript linting and code style enforcement
- Follow existing ESLint configuration rules
- Ensure code passes all linting checks before committing

## Development Workflow

1. **Before Starting**: Run `pnpm install` to install all dependencies
2. **Development**: Use `pnpm dev` to start the development server
3. **Linting**: Run `pnpm lint` to check code quality
4. **Building**: Use `pnpm build` to create production build
5. **Type Checking**: Run `pnpm type-check` if available (TypeScript)

## Code Guidelines

- Write TypeScript with strict mode enabled
- Use React functional components with hooks
- Leverage Zod for runtime schema validation
- Implement error boundaries for better error handling
- Use Tailwind CSS utilities instead of custom CSS when possible
- Keep components small and focused on single responsibility

## Documentation Standards

When generating documentation:
- Include setup and installation instructions
- Document public APIs and main components
- Provide code examples for complex features
- Keep examples concise and runnable
- Update documentation when making breaking changes

## Notes

- Ensure all generated files are properly formatted
- Test changes locally before committing
- Follow the existing code style and patterns in the project
EOF

echo "✅ Instructions file created successfully"

# Step 4: Update globals.css with CSS inspection suppression comment
echo "📝 Updating globals.css with CSS inspection suppression..."

GLOBALS_CSS_FILE="./app/globals.css"

if [ -f "$GLOBALS_CSS_FILE" ]; then
  # Check if the file contains @theme inline
  if grep -q "@theme inline" "$GLOBALS_CSS_FILE"; then
    # Add the noinspection comment above --font-sans: var(--font-geist-sans);
    sed -i '/--font-sans: var(--font-geist-sans);/i\  \/\* noinspection CssUnresolvedCustomProperty \*\/' "$GLOBALS_CSS_FILE"

    # Add the noinspection comment above --font-mono: var(--font-geist-mono);
    sed -i '/--font-mono: var(--font-geist-mono);/i\  \/\* noinspection CssUnresolvedCustomProperty \*\/' "$GLOBALS_CSS_FILE"

    echo "✅ CSS inspection suppression comments added to globals.css"
  else
    echo "⚠️  @theme inline not found in $GLOBALS_CSS_FILE. Skipping CSS update."
  fi
else
  echo "⚠️  globals.css not found at $GLOBALS_CSS_FILE. Skipping CSS update."
fi

# Step 5: Add npm modules
echo "📦 Installing npm modules: ai, @ai-sdk/react, zod"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "⚠️  Warning: package.json not found in $TARGET_DIR"
  echo "   Skipping npm module installation. Please ensure package.json exists."
else
  pnpm add ai @ai-sdk/react zod
  echo "✅ npm modules installed successfully"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Location: $(pwd)"
echo "📄 Copilot Instructions: ./generated/docs-copilot/.copilot-instructions.md"
echo "📦 Installed Packages: ai, @ai-sdk/react, zod"
echo ""
echo "Next steps:"
echo "1. Review the Copilot instructions file"
echo "2. Start development with: pnpm dev"
echo "3. Check linting with: pnpm lint"
echo ""
