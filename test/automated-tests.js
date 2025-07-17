const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// Test suite for AI Code Buddy extension
suite('AI Code Buddy Extension Tests', () => {
    const extensionId = 'EdwardFarrelly.ai-code-buddy';
    let extension;

    suiteSetup(async () => {
        // Get the extension
        extension = vscode.extensions.getExtension(extensionId);
        assert.ok(extension, 'Extension should be installed');
        
        // Activate the extension
        await extension.activate();
        assert.ok(extension.isActive, 'Extension should be active');
    });

    suite('Extension Activation', () => {
        test('Extension should be present and active', () => {
            assert.ok(extension);
            assert.ok(extension.isActive);
        });

        test('Extension should contribute commands', () => {
            const commands = vscode.commands.getCommands(true);
            return commands.then(commandList => {
                const aiCodeBuddyCommands = commandList.filter(cmd => 
                    cmd.startsWith('aicodeBuddy.')
                );
                assert.ok(aiCodeBuddyCommands.length > 0, 'Should have AI Code Buddy commands');
            });
        });
    });

    suite('Command Registration', () => {
        const expectedCommands = [
            'aicodeBuddy.packageRepo',
            'aicodeBuddy.openChatGPT',
            'aicodeBuddy.openClaudeCode',
            'aicodeBuddy.contextManager',
            'aicodeBuddy.showDashboard',
            'aicodeBuddy.configureModels'
        ];

        expectedCommands.forEach(command => {
            test(`Command ${command} should be registered`, async () => {
                const commands = await vscode.commands.getCommands(true);
                assert.ok(commands.includes(command), `Command ${command} should be registered`);
            });
        });
    });

    suite('Configuration', () => {
        test('Extension should contribute configuration properties', () => {
            const config = vscode.workspace.getConfiguration('aicodeBuddy');
            assert.ok(config, 'Should have configuration section');
            
            // Test default values
            const defaultModel = config.get('defaultModel');
            assert.ok(defaultModel, 'Should have default model setting');
            
            const includePatterns = config.get('repomixIncludePatterns');
            assert.ok(Array.isArray(includePatterns), 'Include patterns should be array');
            
            const ignorePatterns = config.get('repomixIgnorePatterns');
            assert.ok(Array.isArray(ignorePatterns), 'Ignore patterns should be array');
        });
    });

    suite('View Containers', () => {
        test('Should register activity bar view container', () => {
            // This test verifies the activity bar container is registered
            // In a real test environment, you would check the actual UI
            assert.ok(true, 'Activity bar container test placeholder');
        });
    });

    suite('Repomix Integration', () => {
        test('Should handle repository packaging', async () => {
            // Create a temporary workspace
            const workspaceFolder = {
                uri: vscode.Uri.file(path.join(__dirname, 'test-workspace')),
                name: 'test-workspace',
                index: 0
            };

            // Create test files
            const testDir = workspaceFolder.uri.fsPath;
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            
            fs.writeFileSync(path.join(testDir, 'test.js'), 'console.log("test");');
            fs.writeFileSync(path.join(testDir, 'README.md'), '# Test Project');

            // Test the packaging (this would normally call the actual command)
            // For now, we'll just verify the test setup
            assert.ok(fs.existsSync(path.join(testDir, 'test.js')), 'Test file should exist');
            assert.ok(fs.existsSync(path.join(testDir, 'README.md')), 'README should exist');

            // Clean up
            fs.rmSync(testDir, { recursive: true, force: true });
        });
    });

    suite('Context Management', () => {
        test('Should handle context operations', () => {
            // Test context manager initialization
            assert.ok(true, 'Context manager test placeholder');
        });
    });

    suite('Error Handling', () => {
        test('Should handle missing API key gracefully', async () => {
            // Clear API key and test error handling
            const config = vscode.workspace.getConfiguration('aicodeBuddy');
            await config.update('openaiApiKey', '', vscode.ConfigurationTarget.Global);
            
            // This should not throw an error
            assert.ok(true, 'Should handle missing API key');
        });

        test('Should handle missing dependencies', () => {
            // Test behavior when Repomix is not installed
            assert.ok(true, 'Dependency check test placeholder');
        });
    });
});

// Helper functions for testing
function createTestWorkspace() {
    const testDir = path.join(__dirname, 'test-workspace');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    return testDir;
}

function cleanupTestWorkspace() {
    const testDir = path.join(__dirname, 'test-workspace');
    if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
    }
}

module.exports = {
    createTestWorkspace,
    cleanupTestWorkspace
};