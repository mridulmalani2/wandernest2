#!/bin/bash
# scan-for-prompt-injection.sh
# Scan repository for potential prompt injection attempts

set -euo pipefail

failures=0

echo "Scanning for AI configuration files..."
config_matches=$(git ls-files -z -- '.cursorrules' '.claude' '.github/copilot-instructions.md' 'copilot-instructions.md' | tr '\0' '\n')
if [[ -n "${config_matches}" ]]; then
  echo "❌ AI config files detected (review/remove before enabling AI tools):"
  echo "${config_matches}"
  failures=$((failures + 1))
else
  echo "✅ No AI config files found."
fi

echo ""
echo "Scanning for suspicious instruction/exfiltration patterns..."
pattern="(ignore previous|disregard|new instruction|system prompt)|(send|upload|exfiltrate).*(https?://)|(curl.*\\|.*bash|execute command|run this command)"
matches=$(rg -n -i "${pattern}" \
  --files-with-matches \
  --glob "!node_modules/**" --glob "!.next/**" --glob "!dist/**" --glob "!build/**" \
  --files-from <(git ls-files) || true)

if [[ -n "${matches}" ]]; then
  echo "❌ Suspicious patterns found (file:line):"
  rg -n -i "${pattern}" \
    --glob "!node_modules/**" --glob "!.next/**" --glob "!dist/**" --glob "!build/**" \
    --files-from <(git ls-files) || true
  echo "Remediation: remove instruction-like text or move it to documentation with clear safety context."
  failures=$((failures + 1))
else
  echo "✅ No suspicious instruction/exfiltration patterns found."
fi

if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi
