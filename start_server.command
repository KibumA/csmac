#!/bin/bash
echo "----------------------------------------"
echo "Starting CSMAC Development Server"
echo "----------------------------------------"
cd "/Users/gaejib/Workspace/Business/CSMAC"

# Attempt to load user profile for paths
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc"
[ -f "$HOME/.bash_profile" ] && source "$HOME/.bash_profile"

# Ensure common paths are included
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/current/bin"

# Check for Node.js (Critical)
if ! command -v node &> /dev/null; then
    echo "❌ CRITICAL ERROR: Node.js is not installed!"
    echo "Opening download page..."
    open "https://nodejs.org/en/download/"
    read -p "Press enter after installing Node.js..."
    exit 1
fi

# Determine which command to use
CMD="pnpm"
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  'pnpm' global command not found."
    echo "🔄 Switching to 'npx pnpm' (Safe Mode) to avoid password requirements..."
    CMD="npx --yes pnpm"
fi

# Run install (in case it wasn't done)
echo "📦 Checking/Installing dependencies..."
$CMD install

# Run dev server
echo "🚀 Starting Server..."
echo "You can access the website at: http://localhost:3000"
$CMD dev
