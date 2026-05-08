---
phase: 3
slug: library-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (standard for Next.js 14) |
| **Config file** | jest.config.ts (Wave 0 installs if absent) |
| **Quick run command** | `npx jest --testPathPattern=lib` |
| **Full suite command** | `npx jest --passWithNoTests` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=lib`
- **After every plan wave:** Run `npx jest --passWithNoTests`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | LIB-01 | migration | `supabase db diff` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | LIB-01 | unit | `npx jest --testPathPattern=types` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | LIB-02 | unit | `npx jest --testPathPattern=omdb` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | LIB-02 | integration | `npx jest --testPathPattern=omdb` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 1 | LIB-03 | unit | `npx jest --testPathPattern=openlibrary` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 1 | LIB-03 | integration | `npx jest --testPathPattern=openlibrary` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 2 | LIB-06 | component | `npx jest --testPathPattern=library` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 2 | LIB-07 | component | `npx jest --testPathPattern=library` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 2 | LIB-04 | unit | `npx jest --testPathPattern=mutations` | ❌ W0 | ⬜ pending |
| 03-05-02 | 05 | 2 | LIB-10 | unit | `npx jest --testPathPattern=duplicate` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/lib/omdb.test.ts` — stubs for LIB-02 (movie/series search)
- [ ] `__tests__/lib/openlibrary.test.ts` — stubs for LIB-03 (book search)
- [ ] `__tests__/lib/mutations.test.ts` — stubs for LIB-04, LIB-05, LIB-08, LIB-09
- [ ] `__tests__/lib/duplicate.test.ts` — stubs for LIB-10 (duplicate detection)
- [ ] `__tests__/components/library.test.tsx` — stubs for LIB-06, LIB-07 (grid/list views, filters)
- [ ] `jest.config.ts` — if absent, Wave 0 installs with Next.js test environment
- [ ] `jest.setup.ts` — shared mocks for Supabase client

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RLS blocks cross-user reads | LIB-01 | Requires two authenticated Supabase users | Sign in as User A, add item; sign in as User B, verify item not visible |
| OMDB API key not in client bundle | LIB-02 | Bundle inspection | Run `npx next build && grep -r "OMDB_API_KEY" .next/static/` — should return nothing |
| Duplicate warning modal displays | LIB-10 | UI interaction | Add an item already in library; confirm warning dialog appears before add |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
