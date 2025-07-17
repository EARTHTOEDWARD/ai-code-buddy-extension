import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export class RepomixManager {
    private outputDir: string;

    constructor() {
        this.outputDir = path.join(require('os').homedir(), '.ai-code-buddy', 'repomix-outputs');
        this.ensureOutputDirectory();
    }

    private ensureOutputDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async packageRepository(
        workspacePath: string,
        includePatterns: string[] = [],
        ignorePatterns: string[] = []
    ): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFileName = `repo-${path.basename(workspacePath)}-${timestamp}.xml`;
        const outputPath = path.join(this.outputDir, outputFileName);

        let command = `repomix --output "${outputPath}"`;

        if (includePatterns.length > 0) {
            command += ` --include "${includePatterns.join(',')}"`;
        }

        if (ignorePatterns.length > 0) {
            command += ` --ignore "${ignorePatterns.join(',')}"`;
        }

        command += ` "${workspacePath}"`;

        try {
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('No suspicious files detected')) {
                console.warn('Repomix stderr:', stderr);
            }

            if (!fs.existsSync(outputPath)) {
                throw new Error('Repomix output file was not created');
            }

            return outputPath;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Repomix failed: ${error.message}`);
            }
            throw error;
        }
    }

    async isRepomixInstalled(): Promise<boolean> {
        try {
            await execAsync('repomix --version');
            return true;
        } catch {
            return false;
        }
    }

    async installRepomix(): Promise<void> {
        try {
            await execAsync('npm install -g repomix');
        } catch (error) {
            throw new Error(`Failed to install Repomix: ${error}`);
        }
    }

    async getPackageStats(outputPath: string): Promise<{
        totalFiles: number;
        totalTokens: number;
        totalChars: number;
        topFiles: Array<{ name: string; tokens: number; chars: number; percentage: number }>;
    }> {
        try {
            const content = fs.readFileSync(outputPath, 'utf8');
            
            // Parse the XML content to extract statistics
            const statsMatch = content.match(/Total Files: (\d+) files/);
            const tokensMatch = content.match(/Total Tokens: ([\d,]+) tokens/);
            const charsMatch = content.match(/Total Chars: ([\d,]+) chars/);
            
            const totalFiles = statsMatch ? parseInt(statsMatch[1]) : 0;
            const totalTokens = tokensMatch ? parseInt(tokensMatch[1].replace(/,/g, '')) : 0;
            const totalChars = charsMatch ? parseInt(charsMatch[1].replace(/,/g, '')) : 0;

            // Extract top files information
            const topFilesSection = content.match(/📈 Top \d+ Files by Token Count:(.*?)(?=\n\n|$)/s);
            const topFiles: Array<{ name: string; tokens: number; chars: number; percentage: number }> = [];
            
            if (topFilesSection) {
                const fileLines = topFilesSection[1].split('\n').filter(line => line.includes('tokens'));
                fileLines.forEach(line => {
                    const match = line.match(/(\d+)\.\s+(.+?)\s+\((\d+)\s+tokens,\s+(\d+)\s+chars,\s+([\d.]+)%\)/);
                    if (match) {
                        topFiles.push({
                            name: match[2],
                            tokens: parseInt(match[3]),
                            chars: parseInt(match[4]),
                            percentage: parseFloat(match[5])
                        });
                    }
                });
            }

            return {
                totalFiles,
                totalTokens,
                totalChars,
                topFiles
            };
        } catch (error) {
            throw new Error(`Failed to parse package stats: ${error}`);
        }
    }

    getOutputDirectory(): string {
        return this.outputDir;
    }

    async listPreviousPackages(): Promise<Array<{ name: string; path: string; created: Date; size: number }>> {
        try {
            const files = fs.readdirSync(this.outputDir);
            const packages = [];

            for (const file of files) {
                if (file.endsWith('.xml')) {
                    const filePath = path.join(this.outputDir, file);
                    const stats = fs.statSync(filePath);
                    packages.push({
                        name: file,
                        path: filePath,
                        created: stats.birthtime,
                        size: stats.size
                    });
                }
            }

            return packages.sort((a, b) => b.created.getTime() - a.created.getTime());
        } catch (error) {
            return [];
        }
    }

    async deletePackage(packagePath: string): Promise<void> {
        try {
            fs.unlinkSync(packagePath);
        } catch (error) {
            throw new Error(`Failed to delete package: ${error}`);
        }
    }
}