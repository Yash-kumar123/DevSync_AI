#!/usr/bin/env bash
# =============================================================================
# scripts/check-versions.sh
# Verifies that all toolchain prerequisites meet the minimum required versions.
# =============================================================================

set -euo pipefail

RED="\033[31m"
GREEN="\033[32m"
RESET="\033[0m"

PASS=0
FAIL=0

version_gte() {
  # Returns 0 (true) if $1 >= $2
  printf '%s\n%s\n' "$2" "$1" | sort -C -V
}

check() {
  local name="$1" required="$2" actual="$3"
  if version_gte "$actual" "$required"; then
    echo -e "${GREEN}  ✓ $name $actual (required ≥ $required)${RESET}"
    PASS=$((PASS+1))
  else
    echo -e "${RED}  ✗ $name $actual (required ≥ $required)${RESET}"
    FAIL=$((FAIL+1))
  fi
}

echo "=== Toolchain version check ==="

check "node"   "20.0.0" "$(node  --version | tr -d 'v')"
check "npm"    "10.0.0" "$(npm   --version)"
check "docker" "24.0.0" "$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"
check "git"    "2.40.0" "$(git   --version  | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"

echo ""
echo "  Passed: $PASS  |  Failed: $FAIL"
[[ "$FAIL" -eq 0 ]] && exit 0 || exit 1
