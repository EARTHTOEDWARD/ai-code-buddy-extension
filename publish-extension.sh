#!/bin/bash

# AI Code Buddy Extension Publishing Script
# This script helps publish the extension to VSCode Marketplace

echo "🤖 AI Code Buddy Extension Publisher"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the extension directory?"
    exit 1
fi

# Check if @vscode/vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "📦 Installing @vscode/vsce..."
    npm install -g @vscode/vsce
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Package the extension
echo "📦 Packaging extension..."
vsce package

if [ $? -ne 0 ]; then
    echo "❌ Extension packaging failed"
    exit 1
fi

echo "✅ Extension packaged successfully!"
echo ""
echo "🚀 Next steps to publish to VSCode Marketplace:"
echo "1. Set up publisher account: https://marketplace.visualstudio.com/manage"
echo "2. Create Personal Access Token: https://dev.azure.com/"
echo "3. Login: vsce login EdwardFarrelly"
echo "4. Publish: vsce publish"
echo ""
echo "📍 Or install locally:"
echo "code --install-extension ai-code-buddy-1.0.0.vsix"
echo ""
echo "🔗 GitHub Repository: https://github.com/EARTHTOEDWARD/ai-code-buddy-extension"