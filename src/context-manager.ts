import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ContextItem {
    id: string;
    type: 'file' | 'selection' | 'directory';
    name: string;
    path: string;
    content: string;
    added: Date;
    tokens: number;
}

export class ContextManager implements vscode.TreeDataProvider<ContextItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ContextItem | undefined | null | void> = new vscode.EventEmitter<ContextItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ContextItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private contextItems: ContextItem[] = [];
    private maxContextSize = 100000; // ~100k tokens limit

    constructor() {
        this.loadContextFromStorage();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ContextItem): vscode.TreeItem {
        const item = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
        item.description = `${element.type} - ${element.tokens} tokens`;
        item.tooltip = `Added: ${element.added.toLocaleString()}\nPath: ${element.path}`;
        item.contextValue = 'contextItem';
        
        switch (element.type) {
            case 'file':
                item.iconPath = new vscode.ThemeIcon('file');
                break;
            case 'selection':
                item.iconPath = new vscode.ThemeIcon('selection');
                break;
            case 'directory':
                item.iconPath = new vscode.ThemeIcon('folder');
                break;
        }

        return item;
    }

    getChildren(element?: ContextItem): Thenable<ContextItem[]> {
        if (!element) {
            return Promise.resolve(this.contextItems);
        }
        return Promise.resolve([]);
    }

    async handleContextAction(action: string, activeEditor: vscode.TextEditor): Promise<void> {
        switch (action) {
            case 'Add current file to context':
                await this.addFileToContext(activeEditor.document);
                break;
            case 'Add current selection to context':
                await this.addSelectionToContext(activeEditor);
                break;
            case 'View context summary':
                await this.showContextSummary();
                break;
            case 'Clear context':
                await this.clearContext();
                break;
            case 'Share context with ChatGPT':
                await this.shareContextWithModel('chatgpt');
                break;
            case 'Share context with Claude Code':
                await this.shareContextWithModel('claude');
                break;
        }
    }

    private async addFileToContext(document: vscode.TextDocument): Promise<void> {
        const content = document.getText();
        const tokens = this.estimateTokens(content);
        
        if (this.getTotalTokens() + tokens > this.maxContextSize) {
            const action = await vscode.window.showWarningMessage(
                'Adding this file would exceed the context size limit. Remove some items first?',
                'Remove Oldest',
                'Cancel'
            );
            
            if (action === 'Remove Oldest') {
                this.removeOldestItems(tokens);
            } else {
                return;
            }
        }

        const contextItem: ContextItem = {
            id: this.generateId(),
            type: 'file',
            name: path.basename(document.fileName),
            path: document.fileName,
            content,
            added: new Date(),
            tokens
        };

        this.contextItems.push(contextItem);
        this.saveContextToStorage();
        this.refresh();
        
        vscode.window.showInformationMessage(`Added ${contextItem.name} to context (${tokens} tokens)`);
    }

    private async addSelectionToContext(activeEditor: vscode.TextEditor): Promise<void> {
        const selection = activeEditor.selection;
        if (selection.isEmpty) {
            vscode.window.showWarningMessage('No text selected');
            return;
        }

        const selectedText = activeEditor.document.getText(selection);
        const tokens = this.estimateTokens(selectedText);
        
        if (this.getTotalTokens() + tokens > this.maxContextSize) {
            const action = await vscode.window.showWarningMessage(
                'Adding this selection would exceed the context size limit. Remove some items first?',
                'Remove Oldest',
                'Cancel'
            );
            
            if (action === 'Remove Oldest') {
                this.removeOldestItems(tokens);
            } else {
                return;
            }
        }

        const contextItem: ContextItem = {
            id: this.generateId(),
            type: 'selection',
            name: `Selection from ${path.basename(activeEditor.document.fileName)}`,
            path: activeEditor.document.fileName,
            content: selectedText,
            added: new Date(),
            tokens
        };

        this.contextItems.push(contextItem);
        this.saveContextToStorage();
        this.refresh();
        
        vscode.window.showInformationMessage(`Added selection to context (${tokens} tokens)`);
    }

    private async showContextSummary(): Promise<void> {
        const totalTokens = this.getTotalTokens();
        const itemCount = this.contextItems.length;
        
        const summary = `
# Context Summary

**Total Items:** ${itemCount}
**Total Tokens:** ${totalTokens.toLocaleString()} / ${this.maxContextSize.toLocaleString()}
**Usage:** ${Math.round((totalTokens / this.maxContextSize) * 100)}%

## Items:
${this.contextItems.map(item => 
    `- **${item.name}** (${item.type}) - ${item.tokens} tokens - Added: ${item.added.toLocaleString()}`
).join('\n')}

## Recent Content Preview:
${this.contextItems.slice(-3).map(item => 
    `### ${item.name}\n\`\`\`\n${item.content.slice(0, 200)}${item.content.length > 200 ? '...' : ''}\n\`\`\``
).join('\n\n')}
        `;

        const document = await vscode.workspace.openTextDocument({
            content: summary,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(document);
    }

    private async clearContext(): Promise<void> {
        const action = await vscode.window.showWarningMessage(
            'Are you sure you want to clear all context items?',
            'Clear All',
            'Cancel'
        );
        
        if (action === 'Clear All') {
            this.contextItems = [];
            this.saveContextToStorage();
            this.refresh();
            vscode.window.showInformationMessage('Context cleared');
        }
    }

    private async shareContextWithModel(modelType: 'chatgpt' | 'claude'): Promise<void> {
        if (this.contextItems.length === 0) {
            vscode.window.showWarningMessage('No context items to share');
            return;
        }

        const contextContent = this.generateContextContent();
        
        if (modelType === 'chatgpt') {
            try {
                await vscode.commands.executeCommand('openai.chatgpt.sendMessage', contextContent);
                vscode.window.showInformationMessage('Context shared with ChatGPT');
            } catch {
                await vscode.env.clipboard.writeText(contextContent);
                vscode.window.showInformationMessage('Context copied to clipboard. Please paste it into ChatGPT.');
            }
        } else if (modelType === 'claude') {
            await vscode.env.clipboard.writeText(contextContent);
            vscode.window.showInformationMessage('Context copied to clipboard. Please paste it into Claude Code.');
        }
    }

    private generateContextContent(): string {
        const header = `# AI Code Buddy Context\n\nGenerated: ${new Date().toISOString()}\nTotal Items: ${this.contextItems.length}\nTotal Tokens: ${this.getTotalTokens()}\n\n`;
        
        const content = this.contextItems.map(item => {
            return `## ${item.name} (${item.type})\n\nPath: ${item.path}\nAdded: ${item.added.toISOString()}\nTokens: ${item.tokens}\n\n\`\`\`\n${item.content}\n\`\`\`\n\n`;
        }).join('\n');

        return header + content;
    }

    private removeOldestItems(requiredTokens: number): void {
        // Sort by date and remove oldest items until we have enough space
        this.contextItems.sort((a, b) => a.added.getTime() - b.added.getTime());
        
        while (this.getTotalTokens() + requiredTokens > this.maxContextSize && this.contextItems.length > 0) {
            this.contextItems.shift();
        }
        
        this.saveContextToStorage();
        this.refresh();
    }

    private getTotalTokens(): number {
        return this.contextItems.reduce((total, item) => total + item.tokens, 0);
    }

    private estimateTokens(text: string): number {
        // Rough estimation: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private saveContextToStorage(): void {
        const storageKey = 'aicodeBuddy.context';
        const workspaceState = vscode.workspace.getConfiguration().get(storageKey, {});
        
        try {
            const contextData = JSON.stringify(this.contextItems);
            // Note: In a real extension, you'd use proper storage APIs
            // For now, this is a placeholder
        } catch (error) {
            console.error('Failed to save context:', error);
        }
    }

    private loadContextFromStorage(): void {
        const storageKey = 'aicodeBuddy.context';
        
        try {
            // Note: In a real extension, you'd use proper storage APIs
            // For now, start with empty context
            this.contextItems = [];
        } catch (error) {
            console.error('Failed to load context:', error);
            this.contextItems = [];
        }
    }

    async removeContextItem(itemId: string): Promise<void> {
        const index = this.contextItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const removedItem = this.contextItems.splice(index, 1)[0];
            this.saveContextToStorage();
            this.refresh();
            vscode.window.showInformationMessage(`Removed ${removedItem.name} from context`);
        }
    }

    getTreeDataProvider(): vscode.TreeDataProvider<ContextItem> {
        return this;
    }

    async exportContext(): Promise<void> {
        const contextContent = this.generateContextContent();
        
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('ai-code-buddy-context.md'),
            filters: {
                'Markdown files': ['md'],
                'Text files': ['txt']
            }
        });

        if (uri) {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(contextContent));
            vscode.window.showInformationMessage(`Context exported to ${uri.fsPath}`);
        }
    }

    async importContext(filePath: string): Promise<void> {
        try {
            const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
            const contextData = JSON.parse(content.toString());
            
            this.contextItems = contextData.map((item: any) => ({
                ...item,
                added: new Date(item.added)
            }));
            
            this.saveContextToStorage();
            this.refresh();
            vscode.window.showInformationMessage('Context imported successfully');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to import context: ${error}`);
        }
    }
}