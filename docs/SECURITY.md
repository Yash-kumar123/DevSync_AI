# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch | ✅ |
| `develop` branch | ✅ |
| Older tags | ❌ |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Report security issues by emailing: **security@devsync.ai** (placeholder — update before going public).

Include in your report:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You will receive an acknowledgement within **48 hours** and a full response within **7 days**.

## Security Practices

- All AI provider API keys are loaded exclusively from environment variables.
- No secrets are ever committed to source control (enforced by `.gitignore` and CI secret scanning).
- Dependencies are monitored for vulnerabilities via `npm audit` in CI.
- HTTP security headers are applied at the Next.js layer (see `apps/web/next.config.js`).
