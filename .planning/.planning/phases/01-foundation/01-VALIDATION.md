---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + @testing-library/react (standard for Next.js 14) |
| **Config file** | jest.config.ts (Wave 0 installs if absent) |
| **Quick run command** | `npx jest --passWithNoTests` |
| **Full suite command** | `npx jest --passWithNoTests` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --passWithNoTests`
- **After every plan wave:** Run `npx jest --passWithNoTests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | UI-01 | structural | `ls package.json next.config.ts tsconfig.json` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | UI-01 | structural | `grep -r "createClient" src/lib/supabase` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | UI-01 | structural | `grep -r "backdrop-blur" src/` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | UI-01 | structural | `grep -r "THEME\|theme" src/lib/` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | UI-02 | structural | `ls vercel.json .vercel/ 2>/dev/null || cat next.config.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Phase 1 is the scaffold phase — no test infrastructure exists yet. Wave 0 creates the project itself.*

- [ ] `npx create-next-app@14` — scaffold creates package.json, tsconfig.json, next.config.ts
- [ ] `jest.config.ts` — install jest + testing-library after scaffold
- [ ] `jest.setup.ts` — shared mocks and environment config

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cinematic dark theme renders in browser | UI-01 | Visual inspection required | Run `npm run dev`, open http://localhost:3000, verify dark backdrop + frosted glass card visible |
| App is responsive at 375px | UI-01 | Viewport-dependent | Open DevTools → 375px iPhone SE → verify layout not broken |
| Supabase test query returns without error | UI-01 | Requires live Supabase project credentials | Check browser console — no Supabase auth/connection errors on page load |
| Push to main deploys to production URL | UI-02 | Requires Vercel integration | Push a commit to main, verify Vercel dashboard shows successful deploy |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
