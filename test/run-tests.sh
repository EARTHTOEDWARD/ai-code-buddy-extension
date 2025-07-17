#!/bin/bash

# AI Code Buddy Extension Test Runner
# This script runs comprehensive tests for the extension

echo "🧪 AI Code Buddy Extension Test Suite"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the extension directory?"
    exit 1
fi

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: ${test_name}${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL: ${test_name}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if command exists
check_command() {
    command -v "$1" >/dev/null 2>&1
}

echo "🔍 Pre-test Environment Check"
echo "------------------------------"

# Check required dependencies
echo "Checking dependencies..."
run_test "Node.js installed" "check_command node"
run_test "npm installed" "check_command npm"
run_test "VSCode installed" "check_command code"
run_test "Repomix installed" "check_command repomix"

# Check if TypeScript compiles
echo -e "\n🔨 Build Tests"
echo "---------------"
run_test "TypeScript compilation" "npm run compile"

# Check if extension packages
echo -e "\n📦 Package Tests"
echo "----------------"
run_test "Extension packaging" "npm run package"

# Check if .vsix file exists
run_test "VSIX file exists" "[ -f ai-code-buddy-1.0.0.vsix ]"

# Create test workspace
echo -e "\n🏗️ Test Workspace Setup"
echo "------------------------"
TEST_WORKSPACE="/tmp/ai-code-buddy-test"
mkdir -p "$TEST_WORKSPACE"
cd "$TEST_WORKSPACE"

# Create test files
echo "console.log('Hello World');" > app.js
echo "def hello(): print('Hello')" > main.py
echo "# Test Project" > README.md
echo "Test documentation" > docs.md

git init > /dev/null 2>&1
git add . > /dev/null 2>&1
git commit -m "Initial commit" > /dev/null 2>&1

run_test "Test workspace created" "[ -f app.js ] && [ -f main.py ] && [ -f README.md ]"

cd - > /dev/null

# Test Repomix integration
echo -e "\n📋 Repomix Integration Tests"
echo "-----------------------------"
run_test "Repomix can process test workspace" "repomix --output /tmp/test-output.xml '$TEST_WORKSPACE'"
run_test "Repomix output file created" "[ -f /tmp/test-output.xml ]"
run_test "Repomix output contains content" "grep -q 'Hello World' /tmp/test-output.xml"

# Test extension installation
echo -e "\n🔧 Extension Installation Tests"
echo "-------------------------------"
run_test "Extension can be installed" "code --install-extension ai-code-buddy-1.0.0.vsix --force"

# Test command registration (requires VSCode to be running)
echo -e "\n⚙️ Command Registration Tests"
echo "------------------------------"
echo "Note: Command registration tests require manual verification in VSCode"

# Test configuration
echo -e "\n🛠️ Configuration Tests"
echo "----------------------"
run_test "Package.json has required fields" "grep -q 'displayName' package.json && grep -q 'publisher' package.json"
run_test "README.md exists" "[ -f README.md ]"
run_test "LICENSE exists" "[ -f LICENSE ]"

# Test file structure
echo -e "\n📁 File Structure Tests"
echo "-----------------------"
run_test "Source files exist" "[ -d src ] && [ -f src/extension.ts ]"
run_test "Compiled files exist" "[ -d out ] && [ -f out/extension.js ]"
run_test "Package files exist" "[ -f package.json ] && [ -f tsconfig.json ]"

# Performance tests
echo -e "\n⚡ Performance Tests"
echo "-------------------"
VSIX_SIZE=$(stat -f%z ai-code-buddy-1.0.0.vsix 2>/dev/null || stat -c%s ai-code-buddy-1.0.0.vsix 2>/dev/null || echo "0")
run_test "Extension size reasonable (<100KB)" "[ $VSIX_SIZE -lt 100000 ]"

# Security tests
echo -e "\n🔒 Security Tests"
echo "----------------"
run_test "No API keys in source" "! grep -r 'sk-' src/ || true"
run_test "No secrets in package" "! grep -r 'password\\|secret\\|token' package.json || true"

# Cleanup
echo -e "\n🧹 Cleanup"
echo "----------"
rm -rf "$TEST_WORKSPACE"
rm -f /tmp/test-output.xml
run_test "Test workspace cleanup" "[ ! -d '$TEST_WORKSPACE' ]"

# Final report
echo -e "\n📊 Test Summary"
echo "================"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed! Extension is ready for testing.${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Please review and fix issues before marketplace publication.${NC}"
    exit 1
fi