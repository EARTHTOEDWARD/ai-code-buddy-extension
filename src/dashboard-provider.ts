import * as vscode from 'vscode';
import * as path from 'path';
import { RepomixManager } from './repomix-manager';
import { AIModelManager } from './ai-model-manager';
import { ContextManager } from './context-manager';

export interface DashboardItem {
    id: string;
    label: string;
    description?: string;
    command?: string;
    icon?: vscode.ThemeIcon;
    children?: DashboardItem[];
}

export class DashboardProvider implements vscode.TreeDataProvider<DashboardItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DashboardItem | undefined | null | void> = new vscode.EventEmitter<DashboardItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DashboardItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private repomixManager: RepomixManager;
    private aiModelManager: AIModelManager;
    private contextManager: ContextManager;

    constructor(private context: vscode.ExtensionContext) {
        this.repomixManager = new RepomixManager();
        this.aiModelManager = new AIModelManager();
        this.contextManager = new ContextManager();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DashboardItem): vscode.TreeItem {
        const item = new vscode.TreeItem(
            element.label,
            element.children ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None
        );
        
        item.description = element.description;
        item.iconPath = element.icon;
        item.contextValue = element.id;
        
        if (element.command) {
            item.command = {
                command: element.command,
                title: element.label
            };
        }

        return item;
    }

    async getChildren(element?: DashboardItem): Promise<DashboardItem[]> {
        if (!element) {
            return this.getRootItems();
        }
        
        if (element.children) {
            return element.children;
        }

        return [];
    }

    private async getRootItems(): Promise<DashboardItem[]> {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        const isConfigured = config.get<string>('openaiApiKey') !== '';
        
        return [
            {
                id: 'quickActions',
                label: 'Quick Actions',
                icon: new vscode.ThemeIcon('rocket'),
                children: [
                    {
                        id: 'packageRepo',
                        label: 'Package Current Repository',
                        description: 'Create AI-friendly repository package',
                        command: 'aicodeBuddy.packageRepo',
                        icon: new vscode.ThemeIcon('package')
                    },
                    {
                        id: 'openChatGPT',
                        label: 'Open ChatGPT o3/o3-mini',
                        description: isConfigured ? 'Ready to use' : 'Configure API key first',
                        command: 'aicodeBuddy.openChatGPT',
                        icon: new vscode.ThemeIcon('comment-discussion')
                    },
                    {
                        id: 'openClaudeCode',
                        label: 'Open Claude Code',
                        description: 'Start terminal session',
                        command: 'aicodeBuddy.openClaudeCode',
                        icon: new vscode.ThemeIcon('terminal')
                    },
                    {
                        id: 'contextManager',
                        label: 'Manage Context',
                        description: 'Add/remove files and selections',
                        command: 'aicodeBuddy.contextManager',
                        icon: new vscode.ThemeIcon('list-selection')
                    }
                ]
            },
            {
                id: 'recentPackages',
                label: 'Recent Packages',
                icon: new vscode.ThemeIcon('history'),
                children: await this.getRecentPackages()
            },
            {
                id: 'aiModels',
                label: 'AI Models',
                icon: new vscode.ThemeIcon('brain'),
                children: await this.getAIModelsStatus()
            },
            {
                id: 'statistics',
                label: 'Statistics',
                icon: new vscode.ThemeIcon('graph'),
                children: await this.getStatistics()
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: new vscode.ThemeIcon('settings'),
                children: [
                    {
                        id: 'configureModels',
                        label: 'Configure AI Models',
                        description: 'Set up API keys and preferences',
                        command: 'aicodeBuddy.configureModels',
                        icon: new vscode.ThemeIcon('key')
                    },
                    {
                        id: 'repomixSettings',
                        label: 'Repomix Settings',
                        description: 'Configure file patterns and options',
                        command: 'workbench.action.openSettings',
                        icon: new vscode.ThemeIcon('settings-gear')
                    }
                ]
            }
        ];
    }

    private async getRecentPackages(): Promise<DashboardItem[]> {
        try {
            const packages = await this.repomixManager.listPreviousPackages();
            return packages.slice(0, 5).map(pkg => ({
                id: `package-${pkg.name}`,
                label: pkg.name,
                description: `${(pkg.size / 1024).toFixed(1)} KB - ${pkg.created.toLocaleDateString()}`,
                icon: new vscode.ThemeIcon('file-zip')
            }));
        } catch (error) {
            return [{
                id: 'noPackages',
                label: 'No packages yet',
                description: 'Create your first repository package',
                icon: new vscode.ThemeIcon('info')
            }];
        }
    }

    private async getAIModelsStatus(): Promise<DashboardItem[]> {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        const openaiConfigured = config.get<string>('openaiApiKey') !== '';
        const claudeInstalled = await this.isClaudeCodeInstalled();
        
        return [
            {
                id: 'openaiStatus',
                label: 'OpenAI Models',
                description: openaiConfigured ? 'Configured' : 'Not configured',
                icon: new vscode.ThemeIcon(openaiConfigured ? 'check' : 'warning')
            },
            {
                id: 'claudeStatus',
                label: 'Claude Code',
                description: claudeInstalled ? 'Installed' : 'Not installed',
                icon: new vscode.ThemeIcon(claudeInstalled ? 'check' : 'warning')
            },
            {
                id: 'copilotStatus',
                label: 'GitHub Copilot',
                description: await this.isCopilotInstalled() ? 'Available' : 'Not available',
                icon: new vscode.ThemeIcon(await this.isCopilotInstalled() ? 'check' : 'info')
            }
        ];
    }

    private async getStatistics(): Promise<DashboardItem[]> {
        const packages = await this.repomixManager.listPreviousPackages();
        const totalPackages = packages.length;
        const totalSize = packages.reduce((sum, pkg) => sum + pkg.size, 0);
        
        return [
            {
                id: 'totalPackages',
                label: `${totalPackages} Packages Created`,
                description: 'Total repository packages',
                icon: new vscode.ThemeIcon('package')
            },
            {
                id: 'totalSize',
                label: `${(totalSize / 1024 / 1024).toFixed(1)} MB Total`,
                description: 'Combined package size',
                icon: new vscode.ThemeIcon('database')
            },
            {
                id: 'contextItems',
                label: `Context Items`,
                description: 'Active context items',
                icon: new vscode.ThemeIcon('list-selection')
            }
        ];
    }

    private async isClaudeCodeInstalled(): Promise<boolean> {
        try {
            const { exec } = require('child_process');
            return new Promise((resolve) => {
                exec('claude-code --version', (error: any) => {
                    resolve(!error);
                });
            });
        } catch {
            return false;
        }
    }

    private async isCopilotInstalled(): Promise<boolean> {
        const copilotExtension = vscode.extensions.getExtension('github.copilot');
        return copilotExtension !== undefined;
    }

    async showDashboard(): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'aicodeBuddy.dashboard',
            'AI Code Buddy Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = await this.getDashboardHtml();
        
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'packageRepo':
                    await vscode.commands.executeCommand('aicodeBuddy.packageRepo');
                    break;
                case 'openChatGPT':
                    await vscode.commands.executeCommand('aicodeBuddy.openChatGPT');
                    break;
                case 'openClaudeCode':
                    await vscode.commands.executeCommand('aicodeBuddy.openClaudeCode');
                    break;
                case 'configureModels':
                    await vscode.commands.executeCommand('aicodeBuddy.configureModels');
                    break;
                case 'refresh':
                    panel.webview.html = await this.getDashboardHtml();
                    break;
            }
        });
    }

    private async getDashboardHtml(): Promise<string> {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        const isConfigured = config.get<string>('openaiApiKey') !== '';
        const defaultModel = config.get<string>('defaultModel') || 'gpt-4o';
        const packages = await this.repomixManager.listPreviousPackages();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Code Buddy Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 20px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .status-card {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .status-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 30px;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .recent-packages {
            margin-top: 20px;
        }
        .package-item {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        }
        .success { color: var(--vscode-testing-iconPassed); }
        .warning { color: var(--vscode-testing-iconQueued); }
        .error { color: var(--vscode-testing-iconFailed); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI Code Buddy Dashboard</h1>
        <p>Your AI-powered coding collaboration center</p>
    </div>

    <div class="status-grid">
        <div class="status-card">
            <div class="status-icon ${isConfigured ? 'success' : 'warning'}">
                ${isConfigured ? '✅' : '⚠️'}
            </div>
            <h3>OpenAI Integration</h3>
            <p>${isConfigured ? 'Ready to use' : 'Configure API key'}</p>
            <p><strong>Model:</strong> ${defaultModel}</p>
        </div>
        
        <div class="status-card">
            <div class="status-icon success">📦</div>
            <h3>Repomix</h3>
            <p>Repository packaging ready</p>
            <p><strong>Packages:</strong> ${packages.length}</p>
        </div>
        
        <div class="status-card">
            <div class="status-icon success">💬</div>
            <h3>Context Manager</h3>
            <p>Smart context sharing</p>
            <p><strong>Items:</strong> Active</p>
        </div>
    </div>

    <div class="actions">
        <button onclick="sendMessage('packageRepo')">📦 Package Repository</button>
        <button onclick="sendMessage('openChatGPT')">💬 Open ChatGPT</button>
        <button onclick="sendMessage('openClaudeCode')">🧠 Open Claude Code</button>
        <button onclick="sendMessage('configureModels')">⚙️ Configure Models</button>
        <button onclick="sendMessage('refresh')">🔄 Refresh</button>
    </div>

    <div class="recent-packages">
        <h3>Recent Packages</h3>
        ${packages.length === 0 ? '<p>No packages created yet. Create your first repository package!</p>' : 
          packages.slice(0, 5).map(pkg => `
            <div class="package-item">
                <strong>${pkg.name}</strong>
                <span style="float: right">${(pkg.size / 1024).toFixed(1)} KB</span>
                <br>
                <small>${pkg.created.toLocaleString()}</small>
            </div>
          `).join('')
        }
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function sendMessage(command) {
            vscode.postMessage({ command });
        }
    </script>
</body>
</html>`;
    }
}