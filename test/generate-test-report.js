const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Test Report Generator for AI Code Buddy Extension
class TestReportGenerator {
    constructor() {
        this.testResults = [];
        this.startTime = new Date();
        this.extensionPath = path.join(__dirname, '..');
        this.reportPath = path.join(__dirname, 'test-report.html');
    }

    // Add test result
    addResult(testName, status, details = '', duration = 0) {
        this.testResults.push({
            name: testName,
            status: status, // 'PASS', 'FAIL', 'SKIP'
            details: details,
            duration: duration,
            timestamp: new Date()
        });
    }

    // Run system checks
    async runSystemChecks() {
        console.log('🔍 Running system checks...');
        
        // Check Node.js version
        const nodeVersion = await this.execCommand('node --version');
        this.addResult('Node.js Version', 'PASS', nodeVersion.trim());

        // Check npm version
        const npmVersion = await this.execCommand('npm --version');
        this.addResult('npm Version', 'PASS', npmVersion.trim());

        // Check VSCode availability
        try {
            await this.execCommand('code --version');
            this.addResult('VSCode Available', 'PASS', 'VSCode CLI is available');
        } catch (error) {
            this.addResult('VSCode Available', 'FAIL', 'VSCode CLI not found');
        }

        // Check Repomix installation
        try {
            const repomixVersion = await this.execCommand('repomix --version');
            this.addResult('Repomix Installation', 'PASS', `Version: ${repomixVersion.trim()}`);
        } catch (error) {
            this.addResult('Repomix Installation', 'FAIL', 'Repomix not installed');
        }
    }

    // Test extension packaging
    async testExtensionPackaging() {
        console.log('📦 Testing extension packaging...');
        
        try {
            // Test TypeScript compilation
            await this.execCommand('npm run compile', { cwd: this.extensionPath });
            this.addResult('TypeScript Compilation', 'PASS', 'Compiled successfully');
        } catch (error) {
            this.addResult('TypeScript Compilation', 'FAIL', error.message);
        }

        // Check if VSIX file exists
        const vsixPath = path.join(this.extensionPath, 'ai-code-buddy-1.0.0.vsix');
        if (fs.existsSync(vsixPath)) {
            const stats = fs.statSync(vsixPath);
            this.addResult('VSIX File Exists', 'PASS', `Size: ${(stats.size / 1024).toFixed(2)} KB`);
        } else {
            this.addResult('VSIX File Exists', 'FAIL', 'VSIX file not found');
        }
    }

    // Test file structure
    testFileStructure() {
        console.log('📁 Testing file structure...');
        
        const requiredFiles = [
            'package.json',
            'README.md',
            'LICENSE',
            'tsconfig.json',
            'src/extension.ts',
            'src/repomix-manager.ts',
            'src/ai-model-manager.ts',
            'src/context-manager.ts',
            'src/dashboard-provider.ts'
        ];

        requiredFiles.forEach(file => {
            const filePath = path.join(this.extensionPath, file);
            if (fs.existsSync(filePath)) {
                this.addResult(`File: ${file}`, 'PASS', 'File exists');
            } else {
                this.addResult(`File: ${file}`, 'FAIL', 'File missing');
            }
        });
    }

    // Test package.json configuration
    testPackageJson() {
        console.log('📋 Testing package.json configuration...');
        
        const packagePath = path.join(this.extensionPath, 'package.json');
        if (!fs.existsSync(packagePath)) {
            this.addResult('package.json', 'FAIL', 'package.json not found');
            return;
        }

        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Test required fields
        const requiredFields = ['name', 'displayName', 'description', 'version', 'publisher', 'engines'];
        requiredFields.forEach(field => {
            if (packageJson[field]) {
                this.addResult(`package.json.${field}`, 'PASS', `Value: ${packageJson[field]}`);
            } else {
                this.addResult(`package.json.${field}`, 'FAIL', 'Field missing');
            }
        });

        // Test commands
        if (packageJson.contributes && packageJson.contributes.commands) {
            const commandCount = packageJson.contributes.commands.length;
            this.addResult('Commands Defined', 'PASS', `${commandCount} commands defined`);
        } else {
            this.addResult('Commands Defined', 'FAIL', 'No commands defined');
        }

        // Test configuration
        if (packageJson.contributes && packageJson.contributes.configuration) {
            const configProps = Object.keys(packageJson.contributes.configuration.properties || {});
            this.addResult('Configuration Properties', 'PASS', `${configProps.length} properties defined`);
        } else {
            this.addResult('Configuration Properties', 'FAIL', 'No configuration properties');
        }
    }

    // Test repository integration
    async testRepositoryIntegration() {
        console.log('🔄 Testing repository integration...');
        
        // Create test repository
        const testRepoPath = path.join(__dirname, 'test-repo');
        
        try {
            // Create test files
            fs.mkdirSync(testRepoPath, { recursive: true });
            fs.writeFileSync(path.join(testRepoPath, 'test.js'), 'console.log("Hello World");');
            fs.writeFileSync(path.join(testRepoPath, 'README.md'), '# Test Repository');
            fs.writeFileSync(path.join(testRepoPath, 'package.json'), '{"name": "test-repo"}');
            
            // Test Repomix integration
            const outputPath = path.join(testRepoPath, 'output.xml');
            await this.execCommand(`repomix --output "${outputPath}" "${testRepoPath}"`);
            
            if (fs.existsSync(outputPath)) {
                const content = fs.readFileSync(outputPath, 'utf8');
                if (content.includes('Hello World')) {
                    this.addResult('Repomix Integration', 'PASS', 'Repository packaged successfully');
                } else {
                    this.addResult('Repomix Integration', 'FAIL', 'Content not found in output');
                }
            } else {
                this.addResult('Repomix Integration', 'FAIL', 'Output file not created');
            }
            
        } catch (error) {
            this.addResult('Repomix Integration', 'FAIL', error.message);
        } finally {
            // Clean up
            if (fs.existsSync(testRepoPath)) {
                fs.rmSync(testRepoPath, { recursive: true, force: true });
            }
        }
    }

    // Test security aspects
    testSecurity() {
        console.log('🔒 Testing security aspects...');
        
        // Check for API keys in source
        const sourceFiles = this.findFiles(path.join(this.extensionPath, 'src'), '.ts');
        let hasApiKeys = false;
        
        sourceFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('sk-') || content.includes('API_KEY')) {
                hasApiKeys = true;
            }
        });
        
        if (!hasApiKeys) {
            this.addResult('No API Keys in Source', 'PASS', 'No API keys found in source code');
        } else {
            this.addResult('No API Keys in Source', 'FAIL', 'Potential API keys found');
        }

        // Check package.json for secrets
        const packageJson = JSON.parse(fs.readFileSync(path.join(this.extensionPath, 'package.json'), 'utf8'));
        const packageStr = JSON.stringify(packageJson);
        
        if (!packageStr.includes('password') && !packageStr.includes('secret') && !packageStr.includes('token')) {
            this.addResult('No Secrets in Package', 'PASS', 'No secrets found in package.json');
        } else {
            this.addResult('No Secrets in Package', 'FAIL', 'Potential secrets found');
        }
    }

    // Generate HTML report
    generateHTMLReport() {
        const endTime = new Date();
        const duration = (endTime - this.startTime) / 1000;
        
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        const skippedTests = this.testResults.filter(r => r.status === 'SKIP').length;
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Code Buddy Extension - Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
            border-left: 4px solid #007acc;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #007acc;
        }
        .test-results {
            margin-top: 30px;
        }
        .test-item {
            display: flex;
            align-items: center;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            background: #f8f9fa;
        }
        .test-item.pass {
            border-left: 4px solid #28a745;
        }
        .test-item.fail {
            border-left: 4px solid #dc3545;
        }
        .test-item.skip {
            border-left: 4px solid #ffc107;
        }
        .test-status {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 3px;
            margin-right: 15px;
            min-width: 50px;
            text-align: center;
        }
        .test-status.pass {
            background: #28a745;
            color: white;
        }
        .test-status.fail {
            background: #dc3545;
            color: white;
        }
        .test-status.skip {
            background: #ffc107;
            color: black;
        }
        .test-name {
            font-weight: 600;
            flex-grow: 1;
        }
        .test-details {
            color: #666;
            font-size: 0.9em;
        }
        .summary {
            margin-top: 30px;
            padding: 20px;
            background: #e9ecef;
            border-radius: 6px;
        }
        .recommendation {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
        }
        .recommendation.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .recommendation.warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }
        .recommendation.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Code Buddy Extension</h1>
            <h2>Test Report</h2>
            <p>Generated on ${endTime.toLocaleString()}</p>
            <p>Test Duration: ${duration.toFixed(2)} seconds</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${this.testResults.length}</div>
                <div>Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${passedTests}</div>
                <div>Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${failedTests}</div>
                <div>Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${skippedTests}</div>
                <div>Skipped</div>
            </div>
        </div>

        <div class="test-results">
            <h3>Test Results</h3>
            ${this.testResults.map(result => `
                <div class="test-item ${result.status.toLowerCase()}">
                    <span class="test-status ${result.status.toLowerCase()}">${result.status}</span>
                    <span class="test-name">${result.name}</span>
                    <span class="test-details">${result.details}</span>
                </div>
            `).join('')}
        </div>

        <div class="summary">
            <h3>Summary</h3>
            <p><strong>Success Rate:</strong> ${((passedTests / this.testResults.length) * 100).toFixed(1)}%</p>
            <p><strong>Total Tests:</strong> ${this.testResults.length}</p>
            <p><strong>Passed:</strong> ${passedTests}</p>
            <p><strong>Failed:</strong> ${failedTests}</p>
            <p><strong>Skipped:</strong> ${skippedTests}</p>
        </div>

        <div class="recommendation ${failedTests === 0 ? 'success' : failedTests > 3 ? 'error' : 'warning'}">
            <h3>Recommendation</h3>
            ${failedTests === 0 
                ? '✅ All tests passed! The extension is ready for marketplace publication.'
                : failedTests > 3 
                ? '❌ Multiple critical issues found. Extension needs significant work before publication.'
                : '⚠️ Some issues found. Please review and fix before marketplace publication.'
            }
        </div>
    </div>
</body>
</html>
        `;

        fs.writeFileSync(this.reportPath, html);
        console.log(`📊 Test report generated: ${this.reportPath}`);
    }

    // Helper methods
    async execCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    findFiles(dir, extension) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                files.push(...this.findFiles(fullPath, extension));
            } else if (item.endsWith(extension)) {
                files.push(fullPath);
            }
        });
        
        return files;
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Starting comprehensive test suite...');
        
        await this.runSystemChecks();
        await this.testExtensionPackaging();
        this.testFileStructure();
        this.testPackageJson();
        await this.testRepositoryIntegration();
        this.testSecurity();
        
        this.generateHTMLReport();
        
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        console.log(`\n📊 Test Results: ${this.testResults.length} total, ${failedTests} failed`);
        
        if (failedTests === 0) {
            console.log('🎉 All tests passed! Extension is ready for marketplace publication.');
            return true;
        } else {
            console.log(`⚠️ ${failedTests} tests failed. Please review the report.`);
            return false;
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const testRunner = new TestReportGenerator();
    testRunner.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test runner error:', error);
        process.exit(1);
    });
}

module.exports = TestReportGenerator;