#!/usr/bin/env bash
# =============================================================================
# scripts/clean.sh
# Cleans all build artefacts, Turborepo cache, and node_modules across the repo.
# Run: bash scripts/clean.sh [--all]
#   --all   also removes node_modules (slow; triggers full npm install on next run)
# =============================================================================

set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RESET="\033[0m"

ALL=false
for arg in "$@"; do
  [[ "$arg" == "--all" ]] && ALL=true
done

log_info()    { echo -e "${GREEN}[clean]${RESET} $*"; }
log_section() { echo -e "\n${BOLD}=== $* ===${RESET}"; }

# ---------------------------------------------------------------------------
# Build outputs
# ---------------------------------------------------------------------------
log_section "Removing build outputs"

find . -type d \( \
  -name "dist" -o \
  -name "build" -o \
  -name ".next" -o \
  -name ".turbo" -o \
  -name "coverage" \
\) -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true

log_info "✓ Build outputs removed."

# ---------------------------------------------------------------------------
# Turborepo cache
# ---------------------------------------------------------------------------
log_section "Removing Turborepo cache"
rm -rf .turbo
log_info "✓ .turbo cache cleared."

# ---------------------------------------------------------------------------
# node_modules (optional)
# ---------------------------------------------------------------------------
if [[ "$ALL" == "true" ]]; then
  log_section "Removing node_modules (--all flag set)"
  find . -type d -name "node_modules" -not -path "*/node_modules/*/node_modules" \
    -exec rm -rf {} + 2>/dev/null || true
  log_info "✓ node_modules removed. Run 'npm install' to reinstall."
else
  log_info "Skipping node_modules (pass --all to remove them too)."
fi

log_section "Clean complete ✓"
