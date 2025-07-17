# AI Code Buddy - VSCode Extension

A powerful VSCode extension that integrates ChatGPT o3/o3-mini and Claude Code for enhanced AI-powered coding collaboration.

## Features

### 🤖 Multi-Model AI Integration
- **ChatGPT o3/o3-mini** support via OpenAI API
- **Claude Code** terminal integration  
- **GitHub Copilot** compatibility
- Easy model switching and configuration

### 📦 Smart Repository Packaging
- **Repomix Integration** - Convert entire repositories to AI-friendly format
- **Private Repository Support** - No need to make repos public
- **Configurable Patterns** - Include/exclude specific file types
- **Security Scanning** - Built-in sensitive data detection

### 🧠 Intelligent Context Management
- **File Context Sharing** - Add individual files to AI context
- **Selection Context** - Share specific code selections
- **Token Management** - Automatic context size optimization
- **Cross-Model Sharing** - Share context between different AI models

### 🎯 Seamless Workflow
- **One-Click Actions** - Package, share, and interact with AI models
- **Split-Screen Support** - Work with multiple AI models simultaneously
- **Command Palette Integration** - Access all features via Ctrl+Shift+P
- **Dashboard View** - Visual overview of all AI integrations

## Installation

### Prerequisites
- VSCode 1.85.0 or higher
- Node.js 18+ (for Repomix)
- OpenAI API key (for ChatGPT features)

### Install Dependencies
```bash
# Install Repomix globally
npm install -g repomix

# Install Claude Code (optional)
# Follow instructions at https://docs.anthropic.com/claude-code
```

### Install Extension
1. Download the `.vsix` file from releases
2. Open VSCode
3. Go to Extensions view (Ctrl+Shift+X)
4. Click the "..." menu and select "Install from VSIX"
5. Select the downloaded `.vsix` file

## Quick Start

### 1. Configure API Keys
1. Open Command Palette (Ctrl+Shift+P)
2. Run "AI Code Buddy: Configure AI Models"
3. Enter your OpenAI API key
4. Select your preferred default model

### 2. Package Your Repository
1. Right-click on a folder in Explorer
2. Select "Package Repository for AI"
3. Choose file patterns to include/exclude
4. Repository will be packaged into AI-friendly format

### 3. Share Context with AI
1. Open any file or make a selection
2. Run "AI Code Buddy: AI Context Manager"
3. Choose "Add current file to context" or "Add current selection to context"
4. Share context with ChatGPT or Claude Code

### 4. Use AI Models
- **ChatGPT**: Run "AI Code Buddy: Open ChatGPT o3/o3-mini"
- **Claude Code**: Run "AI Code Buddy: Open Claude Code Terminal"
- **Dashboard**: Run "AI Code Buddy: Show Dashboard" for overview

## Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `aicodeBuddy.packageRepo` | Package repository for AI | - |
| `aicodeBuddy.openChatGPT` | Open ChatGPT o3/o3-mini | - |
| `aicodeBuddy.openClaudeCode` | Open Claude Code terminal | - |
| `aicodeBuddy.contextManager` | AI Context Manager | Ctrl+Shift+C |
| `aicodeBuddy.showDashboard` | Show dashboard | - |
| `aicodeBuddy.configureModels` | Configure AI models | - |

## Configuration

### Settings
- `aicodeBuddy.openaiApiKey` - OpenAI API key
- `aicodeBuddy.defaultModel` - Default AI model to use
- `aicodeBuddy.repomixIncludePatterns` - File patterns to include
- `aicodeBuddy.repomixIgnorePatterns` - File patterns to ignore
- `aicodeBuddy.autoContextSharing` - Auto-share context between models

### Example Configuration
```json
{
  "aicodeBuddy.defaultModel": "o3-mini",
  "aicodeBuddy.repomixIncludePatterns": [
    "*.py",
    "*.js",
    "*.ts",
    "*.md",
    "*.json"
  ],
  "aicodeBuddy.repomixIgnorePatterns": [
    "node_modules/*",
    "dist/*",
    "*.pyc",
    "__pycache__/*"
  ],
  "aicodeBuddy.autoContextSharing": true
}
```

## Usage Examples

### 1. Code Review Workflow
```bash
# Package your repository
AI Code Buddy: Package Repository for AI

# Share with ChatGPT for review
AI Code Buddy: Open ChatGPT o3/o3-mini
# Paste the generated XML content

# Get detailed analysis and suggestions
```

### 2. Multi-Model Collaboration
```bash
# Start with ChatGPT for planning
AI Code Buddy: Open ChatGPT o3/o3-mini

# Switch to Claude Code for implementation
AI Code Buddy: Open Claude Code Terminal

# Share context between models
AI Code Buddy: AI Context Manager
```

### 3. Private Repository Analysis
```bash
# Your private repository stays private
# Repomix processes everything locally

# Generate AI-friendly package
AI Code Buddy: Package Repository for AI

# Share with any AI model
# No data leaves your machine until you choose to share
```

## Supported AI Models

### OpenAI Models
- ✅ GPT-4o
- ✅ o3-mini
- ✅ o3 (when available)

### Anthropic Models
- ✅ Claude 3.5 Sonnet (via Claude Code)
- ✅ Claude Sonnet 4 (via Claude Code)

### Other Models
- ✅ GitHub Copilot (native integration)
- ✅ Any ChatGPT-compatible API

## Security & Privacy

### Data Protection
- **Local Processing** - Repomix runs on your machine
- **No Auto-Upload** - You control what gets shared
- **API Key Security** - Stored in VSCode secure settings
- **Sensitive Data Detection** - Built-in security scanning

### Best Practices
- Review generated packages before sharing
- Use ignore patterns for sensitive files
- Regularly rotate API keys
- Monitor API usage and costs

## Troubleshooting

### Common Issues

**"Repomix command not found"**
```bash
npm install -g repomix
```

**"OpenAI API key not configured"**
1. Run "AI Code Buddy: Configure AI Models"
2. Enter valid OpenAI API key

**"Claude Code not found"**
1. Install Claude Code CLI
2. Follow setup instructions at https://docs.anthropic.com/claude-code

**"Context size exceeded"**
1. Use more specific file patterns
2. Remove old context items
3. Use selections instead of full files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Open an issue with "enhancement" label
- 📚 **Documentation**: Check the Wiki
- 💬 **Discussions**: Use GitHub Discussions

## Changelog

### v1.0.0
- Initial release
- Multi-model AI integration
- Repomix repository packaging
- Context management system
- Dashboard interface
- OpenAI API integration
- Claude Code terminal integration

---

**Made with ❤️ for the AI coding community**