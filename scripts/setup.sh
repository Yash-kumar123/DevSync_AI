#!/usr/bin/env bash
# =============================================================================
# scripts/setup.sh
# One-command developer environment setup.
# Run: bash scripts/setup.sh
# =============================================================================

set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

log_info()    { echo -e "${GREEN}[setup]${RESET} $*"; }
log_warn()    { echo -e "${YELLOW}[setup]${RESET} $*"; }
log_error()   { echo -e "${RED}[setup]${RESET} $*"; }
log_section() { echo -e "\n${BOLD}=== $* ===${RESET}"; }

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
log_section "Pre-flight checks"

check_command() {
  if ! command -v "$1" &>/dev/null; then
    log_error "Required tool not found: $1"
    log_error "Please install $1 and re-run this script."
    exit 1
  fi
  log_info "✓ $1 found ($(command -v "$1"))"
}

check_command node
check_command npm
check_command docker
check_command git

NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  log_error "Node.js >= 20 is required. Found: $(node --version)"
  exit 1
fi
log_info "✓ Node.js $(node --version) — OK"

# ---------------------------------------------------------------------------
# Environment file
# ---------------------------------------------------------------------------
log_section "Environment setup"

if [[ ! -f .env ]]; then
  cp .env.example .env
  log_warn ".env created from .env.example — fill in real values before starting services."
else
  log_info ".env already exists — skipping."
fi

# ---------------------------------------------------------------------------
# Install dependencies
# ---------------------------------------------------------------------------
log_section "Installing npm dependencies"
npm install
log_info "✓ Dependencies installed."

# ---------------------------------------------------------------------------
# Git hooks (Husky)
# ---------------------------------------------------------------------------
log_section "Git hooks"
if [[ -d .git ]]; then
  npm run prepare
  log_info "✓ Husky hooks installed."
else
  log_warn "Not a git repository — skipping Husky setup."
fi

# ---------------------------------------------------------------------------
# Docker infrastructure
# ---------------------------------------------------------------------------
log_section "Starting Docker services"
docker compose up -d
log_info "✓ Docker services started."

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
log_section "Done 🎉"
echo -e "${BOLD}Next steps:${RESET}"
echo "  1. Edit .env with your real secrets"
echo "  2. Run:  npm run dev   (starts all apps)"
echo "  3. Open: http://localhost:3000"
