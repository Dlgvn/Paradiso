---
phase: 02
slug: authentication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None yet — no test runner installed in Phase 1 |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx playwright test --grep @auth` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Manual browser smoke test (no automated runner yet)
- **After every plan wave:** Run `npx playwright test --grep @auth` (once Wave 0 installs Playwright)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | AUTH-01 | manual | n/a — Vercel env check | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | AUTH-01 | e2e | `playwright test @signup` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | AUTH-02 | e2e | `playwright test @login` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | AUTH-02 | e2e | `playwright test @session` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | AUTH-03 | e2e | `playwright test @logout` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | AUTH-04 | e2e | `playwright test @password-reset` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | AUTH-01 | e2e | `playwright test @auth-ui` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth.spec.ts` — E2E stubs for all AUTH-0x scenarios
- [ ] `playwright.config.ts` — base URL, screenshot on failure
- [ ] `npm install -D @playwright/test` — if not already installed

*Auth flows are inherently integration-level; unit tests have low signal. E2E against local dev server is the appropriate strategy.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Password reset email received | AUTH-04 | Requires real email inbox | Trigger reset, check inbox, click link |
| Supabase env vars set in Vercel | AUTH-01 | Production config, not testable locally | Verify in Vercel dashboard before deploy |
| Session persists after browser close | AUTH-02 | Playwright can simulate but real browser is more reliable | Close tab, reopen, confirm still authenticated |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
