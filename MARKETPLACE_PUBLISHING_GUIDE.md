# Publishing AI Code Buddy Extension to VSCode Marketplace

## 🎯 Goal
Make the AI Code Buddy extension available from the Extensions icon in the VSCode sidebar by publishing it to the official VSCode Marketplace.

## 📋 Prerequisites

### 1. Microsoft Account & Publisher Setup
You need to create a publisher account with Microsoft:

1. **Go to**: https://marketplace.visualstudio.com/manage
2. **Sign in** with your Microsoft account (or create one)
3. **Create a publisher** with these details:
   - **Publisher ID**: `EdwardFarrelly` (or your preferred ID)
   - **Publisher Name**: `Edward Farrelly`
   - **Email**: Your email address

### 2. Personal Access Token (PAT)
You need a Personal Access Token from Azure DevOps:

1. **Go to**: https://dev.azure.com/
2. **Sign in** with the same Microsoft account
3. **Click** on your profile picture → **Personal Access Tokens**
4. **Create** a new token with these settings:
   - **Name**: `VSCode Extension Publishing`
   - **Organization**: `All accessible organizations`
   - **Expiration**: `Custom defined` (1 year recommended)
   - **Scopes**: `Marketplace` → `Manage`
5. **Copy** the token (you'll need it for publishing)

## 🚀 Publishing Steps

### Step 1: Install VSCode Extension Manager
```bash
npm install -g @vscode/vsce
```

### Step 2: Login to VSCode Extension Manager
```bash
vsce login EdwardFarrelly
# Enter your Personal Access Token when prompted
```

### Step 3: Package the Extension
```bash
# Make sure we're in the extension directory
cd /Users/edward/Desktop/OpenSource/ai-code-buddy-extension

# Compile TypeScript
npm run compile

# Package the extension
vsce package
```

### Step 4: Publish to Marketplace
```bash
# Publish the extension
vsce publish

# Or publish with specific version
vsce publish 1.0.0
```

## 📦 What Happens After Publishing

### Marketplace Availability
- **URL**: https://marketplace.visualstudio.com/items?itemName=EdwardFarrelly.ai-code-buddy
- **Search**: Users can search "AI Code Buddy" in VSCode Extensions
- **Install**: One-click install from Extensions sidebar

### Extension Features in Marketplace
- **Activity Bar Icon**: 🤖 AI Code Buddy icon appears in sidebar
- **Command Palette**: All commands available via Ctrl+Shift+P
- **Context Menus**: Right-click options in Explorer and Editor
- **Dashboard**: Visual overview accessible from sidebar

## 🔧 Pre-Publication Checklist

### Required Files ✅
- [x] `package.json` with correct publisher and repository
- [x] `README.md` with comprehensive documentation
- [x] `LICENSE` file (MIT license)
- [x] `.vscodeignore` to exclude unnecessary files
- [x] Compiled JavaScript in `out/` directory

### Extension Features ✅
- [x] Multi-model AI integration (ChatGPT o3/o3-mini, Claude Code)
- [x] Repository packaging with Repomix
- [x] Context management system
- [x] Dashboard interface
- [x] Command palette integration
- [x] Activity bar integration

### Testing ✅
- [x] Extension compiles without errors
- [x] All commands work correctly
- [x] UI components render properly
- [x] Configuration settings function

## 📊 Marketplace Benefits

### For Users
- **Easy Discovery**: Found via Extensions search
- **One-Click Install**: No manual .vsix installation
- **Automatic Updates**: VSCode handles updates
- **Trust**: Marketplace verification and security

### For You
- **Wide Distribution**: Reach thousands of developers
- **Analytics**: Download and usage statistics
- **Feedback**: User reviews and ratings
- **Community**: Issue tracking and contributions

## 🎯 Expected Marketplace URL Structure

After publishing, your extension will be available at:
- **Marketplace**: https://marketplace.visualstudio.com/items?itemName=EdwardFarrelly.ai-code-buddy
- **Install Command**: `ext install EdwardFarrelly.ai-code-buddy`
- **VSCode Search**: Type "AI Code Buddy" in Extensions tab

## 🔄 Update Process

For future updates:
```bash
# Update version in package.json
npm version patch  # or minor, major

# Recompile and republish
npm run compile
vsce publish
```

## 📱 Alternative: Manual Publishing

If you prefer not to publish to marketplace immediately, you can:

1. **Share the .vsix file** directly with users
2. **Host on GitHub releases** for download
3. **Create installation instructions** for manual installation

## 🎉 Final Result

Once published, users can:
1. **Open VSCode**
2. **Click Extensions icon** in sidebar (or Ctrl+Shift+X)
3. **Search "AI Code Buddy"**
4. **Click "Install"**
5. **Use the extension** immediately with full functionality

The extension will appear in the Activity Bar with a 🤖 icon and provide all the AI collaboration features we built!

## 📞 Support

If you need help with publishing:
- **VSCode Extension Docs**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- **Marketplace Management**: https://marketplace.visualstudio.com/manage
- **Azure DevOps**: https://dev.azure.com/

---

**Ready to make AI Code Buddy available to the world! 🚀**