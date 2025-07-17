import * as vscode from 'vscode';
import { RepomixManager } from './repomix-manager';
import { AIModelManager } from './ai-model-manager';
import { ContextManager } from './context-manager';
import { DashboardProvider } from './dashboard-provider';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Code Buddy is now active!');

    // Initialize managers
    const repomixManager = new RepomixManager();
    const aiModelManager = new AIModelManager();
    const contextManager = new ContextManager();
    const dashboardProvider = new DashboardProvider(context);

    // Register commands
    const packageRepoCommand = vscode.commands.registerCommand('aicodeBuddy.packageRepo', async (uri?: vscode.Uri) => {
        const workspaceFolder = uri ? vscode.workspace.getWorkspaceFolder(uri) : vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Packaging repository for AI...',
                cancellable: true
            }, async (progress, token) => {
                progress.report({ increment: 0 });
                
                const config = vscode.workspace.getConfiguration('aicodeBuddy');
                const includePatterns = config.get<string[]>('repomixIncludePatterns') || [];
                const ignorePatterns = config.get<string[]>('repomixIgnorePatterns') || [];
                
                progress.report({ increment: 50, message: 'Running Repomix...' });
                const outputPath = await repomixManager.packageRepository(
                    workspaceFolder.uri.fsPath,
                    includePatterns,
                    ignorePatterns
                );
                
                progress.report({ increment: 100, message: 'Complete!' });
                
                const action = await vscode.window.showInformationMessage(
                    `Repository packaged successfully! Output: ${outputPath}`,
                    'Open File',
                    'Copy to Clipboard',
                    'Send to ChatGPT'
                );
                
                if (action === 'Open File') {
                    const document = await vscode.workspace.openTextDocument(outputPath);
                    await vscode.window.showTextDocument(document);
                } else if (action === 'Copy to Clipboard') {
                    const content = await vscode.workspace.fs.readFile(vscode.Uri.file(outputPath));
                    await vscode.env.clipboard.writeText(content.toString());
                    vscode.window.showInformationMessage('Content copied to clipboard!');
                } else if (action === 'Send to ChatGPT') {
                    await aiModelManager.sendToModel('chatgpt', outputPath);
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error packaging repository: ${error}`);
        }
    });

    const openChatGPTCommand = vscode.commands.registerCommand('aicodeBuddy.openChatGPT', async () => {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        const apiKey = config.get<string>('openaiApiKey');
        
        if (!apiKey) {
            const action = await vscode.window.showWarningMessage(
                'OpenAI API key not configured. Would you like to set it now?',
                'Configure'
            );
            if (action === 'Configure') {
                vscode.commands.executeCommand('aicodeBuddy.configureModels');
            }
            return;
        }

        try {
            await aiModelManager.openChatGPT();
            vscode.window.showInformationMessage('ChatGPT o3/o3-mini is ready!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error opening ChatGPT: ${error}`);
        }
    });

    const openClaudeCodeCommand = vscode.commands.registerCommand('aicodeBuddy.openClaudeCode', async () => {
        try {
            await aiModelManager.openClaudeCode();
            vscode.window.showInformationMessage('Claude Code terminal opened!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error opening Claude Code: ${error}`);
        }
    });

    const contextManagerCommand = vscode.commands.registerCommand('aicodeBuddy.contextManager', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const options = [
            'Add current file to context',
            'Add current selection to context',
            'View context summary',
            'Clear context',
            'Share context with ChatGPT',
            'Share context with Claude Code'
        ];

        const choice = await vscode.window.showQuickPick(options, {
            placeHolder: 'Choose context action'
        });

        if (choice) {
            await contextManager.handleContextAction(choice, activeEditor);
        }
    });

    const showDashboardCommand = vscode.commands.registerCommand('aicodeBuddy.showDashboard', async () => {
        dashboardProvider.showDashboard();
    });

    const configureModelsCommand = vscode.commands.registerCommand('aicodeBuddy.configureModels', async () => {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your OpenAI API Key',
            password: true,
            value: config.get<string>('openaiApiKey') || ''
        });

        if (apiKey) {
            await config.update('openaiApiKey', apiKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('OpenAI API Key configured successfully!');
        }

        const models = ['gpt-4o', 'o3-mini', 'o3', 'claude-3.5-sonnet', 'claude-sonnet-4'];
        const defaultModel = await vscode.window.showQuickPick(models, {
            placeHolder: 'Select default AI model'
        });

        if (defaultModel) {
            await config.update('defaultModel', defaultModel, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Default model set to ${defaultModel}`);
        }
    });

    // Register tree data providers
    vscode.window.registerTreeDataProvider('aicodeBuddy.dashboard', dashboardProvider);
    vscode.window.registerTreeDataProvider('aicodeBuddy.models', aiModelManager.getTreeDataProvider());
    vscode.window.registerTreeDataProvider('aicodeBuddy.context', contextManager.getTreeDataProvider());

    // Add to context subscriptions
    context.subscriptions.push(
        packageRepoCommand,
        openChatGPTCommand,
        openClaudeCodeCommand,
        contextManagerCommand,
        showDashboardCommand,
        configureModelsCommand
    );

    // Show welcome message
    vscode.window.showInformationMessage('AI Code Buddy is ready! Use Ctrl+Shift+P to access commands.');
}

export function deactivate() {
    console.log('AI Code Buddy is now deactivated');
}