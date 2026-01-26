#!/bin/bash
echo "----------------------------------------"
echo "Starting CSMAC Mobile App (Field Worker)"
echo "----------------------------------------"
cd "/Users/gaejib/Workspace/Business/CSMAC"

# Attempt to load user profile for paths
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc"
[ -f "$HOME/.bash_profile" ] && source "$HOME/.bash_profile"

export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/current/bin"

# Determine which command to use
CMD="pnpm"
if ! command -v pnpm &> /dev/null; then
    CMD="npx --yes pnpm"
fi

echo "📂 Working Directory: $(pwd)"
echo "🚀 Starting Mobile App..."
echo "----------------------------------------"
echo "👉 Press 'a' to open Android"
echo "👉 Press 'i' to open iPhone"
echo "----------------------------------------"

# Run only the mobile app
$CMD --filter mobile dev
