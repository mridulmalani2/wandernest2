#!/bin/bash
# scan-for-prompt-injection.sh
# Scan repository for potential prompt injection attempts

set -euo pipefail

echo "Scanning for AI configuration files..."
find . -name ".cursorrules" -o -name ".claude" -o -name "copilot-instructions.md" 2>/dev/null

echo ""
echo "Scanning for suspicious comment patterns..."
rg -n "ignore.*instruction|send.*to.*http|exfiltrate|execute.*command" \
  --glob "*.py" --glob "*.js" --glob "*.ts" --glob "*.md" \
  --glob "*.json" --glob "*.yaml" --glob "*.yml" --glob "*.toml" \
  --glob "!node_modules/**" 2>/dev/null

echo ""
echo "Checking README files for hidden instructions..."
rg -n "AI assistant|ignore previous|disregard|new instruction" \
  --glob "README*" --glob "*.md" --glob "!node_modules/**" 2>/dev/null
