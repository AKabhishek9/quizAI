#!/bin/bash
# OpenRouter Implementation - Verification Checklist
# Run this script to verify the complete implementation

echo "🔍 OpenRouter Implementation Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1 (MISSING)"
    ((FAIL++))
  fi
}

check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $1 contains '$2'"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1 missing '$2'"
    ((FAIL++))
  fi
}

echo "📋 Checking Core Files..."
check_file "server/.env"
check_file "server/src/services/ai.service.ts"
check_file "server/package.json"
check_file "server/src/scripts/test-ai-integration.ts"
echo ""

echo "📚 Checking Documentation..."
check_file "server/OPENROUTER_SETUP.md"
check_file "OPENROUTER_IMPLEMENTATION.md"
check_file "TROUBLESHOOTING.md"
check_file "QUICK_REFERENCE.md"
check_file "SETUP_COMPLETE.md"
echo ""

echo "🔐 Checking Security Configuration..."
check_content "server/.env" "OPENROUTER_API_KEY"
check_content "server/.gitignore" ".env"
echo ""

echo "🔧 Checking Implementation Details..."
check_content "server/src/services/ai.service.ts" "OPENROUTER_API_KEY"
check_content "server/src/services/ai.service.ts" "OPENROUTER_BASE_URL"
check_content "server/src/services/ai.service.ts" "mistralai/mistral-7b-instruct"
check_content "server/src/services/ai.service.ts" "meta-llama/llama-3-8b-instruct"
check_content "server/src/services/ai.service.ts" "8000" # 8-second timeout
check_content "server/src/services/ai.service.ts" "database fallback"
echo ""

echo "✅ Checking npm Scripts..."
check_content "server/package.json" '"test-ai"'
check_content "server/package.json" 'test-ai-integration.ts'
echo ""

echo "📊 Results Summary"
echo "=================================="
echo -e "Passed:  ${GREEN}$PASS${NC}"
echo -e "Failed:  ${RED}$FAIL${NC}"
echo -e "Warnings: ${YELLOW}$WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "🚀 Next Steps:"
  echo "1. Get API key from: https://openrouter.ai/keys"
  echo "2. Add to server/.env: OPENROUTER_API_KEY=sk-or-v1-xxx"
  echo "3. Test: cd server && npm run test-ai"
  echo "4. Run: npm run dev"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Review the errors above.${NC}"
  exit 1
fi
