import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import axios from 'axios';

const execAsync = promisify(exec);

export interface AIModel {
    id: string;
    name: string;
    provider: string;
    status: 'available' | 'configured' | 'error';
    requiresApiKey: boolean;
}

export class AIModelManager implements vscode.TreeDataProvider<AIModel> {
    private _onDidChangeTreeData: vscode.EventEmitter<AIModel | undefined | null | void> = new vscode.EventEmitter<AIModel | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<AIModel | undefined | null | void> = this._onDidChangeTreeData.event;

    private models: AIModel[] = [
        {
            id: 'gpt-4o',
            name: 'GPT-4o',
            provider: 'OpenAI',
            status: 'available',
            requiresApiKey: true
        },
        {
            id: 'o3-mini',
            name: 'o3-mini',
            provider: 'OpenAI',
            status: 'available',
            requiresApiKey: true
        },
        {
            id: 'o3',
            name: 'o3',
            provider: 'OpenAI',
            status: 'available',
            requiresApiKey: true
        },
        {
            id: 'claude-3.5-sonnet',
            name: 'Claude 3.5 Sonnet',
            provider: 'Anthropic',
            status: 'available',
            requiresApiKey: true
        },
        {
            id: 'claude-sonnet-4',
            name: 'Claude Sonnet 4',
            provider: 'Anthropic',
            status: 'available',
            requiresApiKey: true
        }
    ];

    constructor() {
        this.refreshModelStatus();
    }

    refresh(): void {
        this.refreshModelStatus();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: AIModel): vscode.TreeItem {
        const item = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
        item.description = `${element.provider} - ${element.status}`;
        item.contextValue = 'aiModel';
        
        switch (element.status) {
            case 'available':
                item.iconPath = new vscode.ThemeIcon('circle-outline');
                break;
            case 'configured':
                item.iconPath = new vscode.ThemeIcon('check');
                break;
            case 'error':
                item.iconPath = new vscode.ThemeIcon('error');
                break;
        }

        return item;
    }

    getChildren(element?: AIModel): Thenable<AIModel[]> {
        if (!element) {
            return Promise.resolve(this.models);
        }
        return Promise.resolve([]);
    }

    private async refreshModelStatus(): Promise<void> {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        const openaiApiKey = config.get<string>('openaiApiKey');

        // Check OpenAI models
        const openaiModels = this.models.filter(m => m.provider === 'OpenAI');
        for (const model of openaiModels) {
            if (openaiApiKey) {
                model.status = await this.testOpenAIModel(model.id, openaiApiKey) ? 'configured' : 'error';
            } else {
                model.status = 'available';
            }
        }

        // Check Claude models (via installed extensions)
        const claudeModels = this.models.filter(m => m.provider === 'Anthropic');
        for (const model of claudeModels) {
            model.status = await this.isClaudeCodeInstalled() ? 'configured' : 'available';
        }
    }

    private async testOpenAIModel(modelId: string, apiKey: string): Promise<boolean> {
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: modelId.includes('o3') ? 'o3-mini' : 'gpt-4o', // API might not support o3 yet
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 5
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    private async isClaudeCodeInstalled(): Promise<boolean> {
        try {
            await execAsync('claude-code --version');
            return true;
        } catch {
            return false;
        }
    }

    async openChatGPT(): Promise<void> {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        const defaultModel = config.get<string>('defaultModel') || 'gpt-4o';
        
        // Try to open ChatGPT extension first
        try {
            await vscode.commands.executeCommand('openai.chatgpt.newChat');
        } catch {
            // Fallback to ChatGPT Copilot extension
            try {
                await vscode.commands.executeCommand('chatgpt-copilot.newChat');
            } catch {
                // Fallback to opening ChatGPT desktop app
                const platform = process.platform;
                let command = '';
                
                if (platform === 'darwin') {
                    command = 'open -a "ChatGPT"';
                } else if (platform === 'win32') {
                    command = 'start chatgpt:';
                } else {
                    command = 'xdg-open chatgpt:';
                }
                
                await execAsync(command);
            }
        }
    }

    async openClaudeCode(): Promise<void> {
        const terminal = vscode.window.createTerminal({
            name: 'Claude Code',
            shellPath: '/bin/bash'
        });
        
        terminal.sendText('claude-code');
        terminal.show();
    }

    async sendToModel(modelId: string, filePath: string): Promise<void> {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (modelId === 'chatgpt') {
            try {
                // Try to use ChatGPT extension API
                await vscode.commands.executeCommand('openai.chatgpt.sendMessage', content);
            } catch {
                // Fallback to copying to clipboard
                await vscode.env.clipboard.writeText(content);
                vscode.window.showInformationMessage('Content copied to clipboard. Please paste it into ChatGPT.');
            }
        } else if (modelId === 'claude') {
            // For Claude, we'll copy to clipboard as there's no direct API
            await vscode.env.clipboard.writeText(content);
            vscode.window.showInformationMessage('Content copied to clipboard. Please paste it into Claude Code.');
        }
    }

    getTreeDataProvider(): vscode.TreeDataProvider<AIModel> {
        return this;
    }

    async switchModel(modelId: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('aicodeBuddy');
        await config.update('defaultModel', modelId, vscode.ConfigurationTarget.Global);
        
        vscode.window.showInformationMessage(`Switched to ${modelId}`);
        this.refresh();
    }

    async configureModel(modelId: string): Promise<void> {
        const model = this.models.find(m => m.id === modelId);
        if (!model) {
            return;
        }

        if (model.provider === 'OpenAI') {
            const apiKey = await vscode.window.showInputBox({
                prompt: `Enter your OpenAI API Key for ${model.name}`,
                password: true
            });

            if (apiKey) {
                const config = vscode.workspace.getConfiguration('aicodeBuddy');
                await config.update('openaiApiKey', apiKey, vscode.ConfigurationTarget.Global);
                this.refresh();
            }
        } else if (model.provider === 'Anthropic') {
            const action = await vscode.window.showInformationMessage(
                'Claude models are accessed through Claude Code. Would you like to install it?',
                'Install Claude Code',
                'Open Documentation'
            );

            if (action === 'Install Claude Code') {
                vscode.env.openExternal(vscode.Uri.parse('https://docs.anthropic.com/claude-code'));
            } else if (action === 'Open Documentation') {
                vscode.env.openExternal(vscode.Uri.parse('https://docs.anthropic.com/claude-code'));
            }
        }
    }
}