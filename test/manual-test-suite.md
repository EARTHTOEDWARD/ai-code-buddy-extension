# AI Code Buddy Extension - Manual Test Suite

## 🎯 Test Objectives
Ensure all extension capabilities work correctly before marketplace publication.

## 📋 Test Environment Setup

### Prerequisites
- VSCode 1.85.0 or higher
- Node.js 18+
- OpenAI API key (for ChatGPT testing)
- Internet connection
- Git repository for testing

### Test Data Setup
```bash
# Create test project structure
mkdir -p test-project/src test-project/docs
cd test-project

# Create sample files
echo "# Test Project" > README.md
echo "console.log('Hello World');" > src/app.js
echo "def hello(): print('Hello')" > src/main.py
echo "# Documentation" > docs/guide.md

# Initialize git
git init
git add .
git commit -m "Initial test project"
```

## 🧪 Test Cases

### Test 1: Extension Installation and Activation
**Objective**: Verify extension installs and activates properly

#### Steps:
1. **Install Extension**
   ```bash
   cd /Users/edward/Desktop/OpenSource/ai-code-buddy-extension
   code --install-extension ai-code-buddy-1.0.0.vsix
   ```

2. **Verify Installation**
   - Open VSCode
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "AI Code Buddy"
   - Verify extension appears as installed

3. **Check Activity Bar**
   - Look for 🤖 AI Code Buddy icon in Activity Bar
   - Click icon to open extension panels

#### Expected Results:
- ✅ Extension installs without errors
- ✅ Activity Bar shows AI Code Buddy icon
- ✅ Three panels visible: Dashboard, AI Models, Context Manager
- ✅ No error messages in Developer Console

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 2: Repository Packaging with Repomix
**Objective**: Verify repository packaging functionality

#### Steps:
1. **Open Test Project**
   ```bash
   code test-project
   ```

2. **Package Repository via Right-Click**
   - Right-click on project folder in Explorer
   - Select "Package Repository for AI"
   - Choose default settings

3. **Package Repository via Command Palette**
   - Press Ctrl+Shift+P
   - Type "AI Code Buddy: Package Repository for AI"
   - Execute command

4. **Verify Output**
   - Check that packaging completes without errors
   - Verify output file is created
   - Check file size and content

#### Expected Results:
- ✅ Right-click menu shows "Package Repository for AI"
- ✅ Command executes without errors
- ✅ Progress notification appears
- ✅ Output file created (.xml format)
- ✅ File contains project structure and content
- ✅ Security scan completes successfully

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 3: AI Model Configuration
**Objective**: Verify AI model setup and configuration

#### Steps:
1. **Open Configuration**
   - Command Palette → "AI Code Buddy: Configure AI Models"
   - Enter OpenAI API key when prompted
   - Select default model (o3-mini)

2. **Check AI Models Panel**
   - Open AI Code Buddy sidebar
   - Click on "AI Models" section
   - Verify model status

3. **Test Model Status**
   - Check OpenAI models show as "configured"
   - Check Claude Code shows appropriate status
   - Check GitHub Copilot integration

#### Expected Results:
- ✅ Configuration dialog opens
- ✅ API key can be entered and saved
- ✅ Model selection works
- ✅ AI Models panel shows correct status
- ✅ Settings are persisted

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 4: ChatGPT Integration
**Objective**: Verify ChatGPT o3/o3-mini integration works

#### Steps:
1. **Open ChatGPT**
   - Command Palette → "AI Code Buddy: Open ChatGPT o3/o3-mini"
   - Verify it attempts to open ChatGPT

2. **Test with Extension**
   - Try opening via ChatGPT extension
   - Try opening via desktop app
   - Test fallback mechanisms

3. **Send Repository Package**
   - Package a repository
   - Choose "Send to ChatGPT" option
   - Verify content sharing

#### Expected Results:
- ✅ ChatGPT opens via extension or desktop app
- ✅ API key validation works
- ✅ Repository content can be shared
- ✅ Fallback to clipboard works if needed

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 5: Claude Code Integration
**Objective**: Verify Claude Code terminal integration

#### Steps:
1. **Open Claude Code**
   - Command Palette → "AI Code Buddy: Open Claude Code Terminal"
   - Verify terminal opens

2. **Test Terminal Integration**
   - Check if Claude Code command is available
   - Test terminal functionality
   - Verify it works with current project

#### Expected Results:
- ✅ Terminal opens with Claude Code
- ✅ Command is available or shows helpful message
- ✅ Integration works with current project context

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 6: Context Management System
**Objective**: Verify context management functionality

#### Steps:
1. **Add File to Context**
   - Open a file in editor
   - Command Palette → "AI Code Buddy: AI Context Manager"
   - Select "Add current file to context"

2. **Add Selection to Context**
   - Select some code
   - Use context manager to add selection
   - Verify context item is added

3. **View Context Summary**
   - Use "View context summary" option
   - Verify context summary opens

4. **Clear Context**
   - Use "Clear context" option
   - Verify context is cleared

5. **Share Context**
   - Add some context items
   - Try "Share context with ChatGPT"
   - Try "Share context with Claude Code"

#### Expected Results:
- ✅ Files can be added to context
- ✅ Selections can be added to context
- ✅ Context summary displays correctly
- ✅ Context can be cleared
- ✅ Context can be shared with AI models
- ✅ Context Manager panel shows items

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 7: Dashboard Interface
**Objective**: Verify dashboard functionality

#### Steps:
1. **Open Dashboard**
   - Command Palette → "AI Code Buddy: Show AI Code Buddy Dashboard"
   - Verify dashboard opens in editor

2. **Test Dashboard Actions**
   - Click "Package Repository" button
   - Click "Open ChatGPT" button
   - Click "Open Claude Code" button
   - Click "Configure Models" button

3. **Check Dashboard Information**
   - Verify status cards show correct information
   - Check recent packages section
   - Verify statistics are accurate

#### Expected Results:
- ✅ Dashboard opens in webview
- ✅ All buttons work correctly
- ✅ Status information is accurate
- ✅ Recent packages are displayed
- ✅ Statistics reflect actual usage

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 8: Command Palette Integration
**Objective**: Verify all commands work via Command Palette

#### Steps:
1. **Test All Commands**
   - Open Command Palette (Ctrl+Shift+P)
   - Type "AI Code Buddy" to see all commands
   - Test each command:
     - Package Repository for AI
     - Open ChatGPT o3/o3-mini
     - Open Claude Code Terminal
     - AI Context Manager
     - Show AI Code Buddy Dashboard
     - Configure AI Models

2. **Verify Command Categories**
   - Check all commands show "AI Code Buddy" category
   - Verify descriptions are clear

#### Expected Results:
- ✅ All commands appear in Command Palette
- ✅ Commands are properly categorized
- ✅ All commands execute without errors
- ✅ Command descriptions are helpful

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 9: Right-Click Context Menus
**Objective**: Verify context menu integration

#### Steps:
1. **Test Explorer Context Menu**
   - Right-click on folder in Explorer
   - Verify "Package Repository for AI" appears
   - Test the command

2. **Test Editor Context Menu**
   - Right-click in editor
   - Verify "AI Context Manager" appears
   - Test the command

3. **Test Menu Positioning**
   - Check menus appear in correct groups
   - Verify they only appear when appropriate

#### Expected Results:
- ✅ Folder context menu shows packaging option
- ✅ Editor context menu shows context manager
- ✅ Menu items work correctly
- ✅ Menus appear only when appropriate

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 10: Settings and Configuration
**Objective**: Verify settings persistence and functionality

#### Steps:
1. **Open VSCode Settings**
   - Go to File → Preferences → Settings
   - Search for "AI Code Buddy"
   - Verify all settings appear

2. **Test Setting Changes**
   - Change default model
   - Modify include/ignore patterns
   - Toggle auto-context sharing
   - Save settings

3. **Verify Persistence**
   - Restart VSCode
   - Check settings are preserved
   - Test functionality with new settings

#### Expected Results:
- ✅ All settings appear in VSCode Settings
- ✅ Settings can be modified
- ✅ Changes are saved properly
- ✅ Settings persist across restarts
- ✅ Settings affect extension behavior

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 11: Error Handling and Edge Cases
**Objective**: Verify extension handles errors gracefully

#### Steps:
1. **Test Without API Key**
   - Clear OpenAI API key
   - Try to use ChatGPT features
   - Verify error messages are helpful

2. **Test with Invalid API Key**
   - Set invalid API key
   - Try ChatGPT integration
   - Check error handling

3. **Test with Large Repository**
   - Create large test repository
   - Try to package it
   - Verify memory/performance handling

4. **Test Without Dependencies**
   - Test without Repomix installed
   - Verify error messages and suggestions

#### Expected Results:
- ✅ Helpful error messages for missing API key
- ✅ Clear feedback for invalid API key
- ✅ Graceful handling of large repositories
- ✅ Clear instructions for missing dependencies

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

### Test 12: Performance and Resource Usage
**Objective**: Verify extension performance

#### Steps:
1. **Monitor Resource Usage**
   - Open Task Manager/Activity Monitor
   - Monitor CPU and memory usage
   - Test all major features

2. **Test Startup Performance**
   - Measure extension activation time
   - Check for any startup delays
   - Verify no blocking operations

3. **Test Large File Handling**
   - Test with large code files
   - Test with many context items
   - Check memory usage patterns

#### Expected Results:
- ✅ Reasonable CPU usage
- ✅ Acceptable memory consumption
- ✅ Fast activation time
- ✅ No UI blocking operations
- ✅ Efficient large file handling

#### Test Status: [ ] PASS [ ] FAIL
**Notes**: ________________________________

---

## 📊 Test Summary

### Overall Test Results
- **Total Tests**: 12
- **Passed**: ___/12
- **Failed**: ___/12
- **Success Rate**: ___%

### Critical Issues Found
- [ ] Issue 1: ________________________________
- [ ] Issue 2: ________________________________
- [ ] Issue 3: ________________________________

### Minor Issues Found
- [ ] Issue 1: ________________________________
- [ ] Issue 2: ________________________________
- [ ] Issue 3: ________________________________

### Recommendations
- [ ] Fix all critical issues before marketplace publication
- [ ] Address minor issues in next version
- [ ] Consider additional testing scenarios
- [ ] Update documentation based on test findings

## ✅ Sign-off
- **Tester**: ________________________________
- **Date**: ________________________________
- **Ready for Marketplace**: [ ] YES [ ] NO
- **Notes**: ________________________________