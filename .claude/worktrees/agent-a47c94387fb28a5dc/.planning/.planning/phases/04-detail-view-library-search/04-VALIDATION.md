---
phase: 4
slug: detail-view-library-search
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest + React Testing Library (confirm in Wave 0) |
| **Config file** | `jest.config.ts` — Wave 0 gap if not present |
| **Quick run command** | `npm test -- --testPathPattern=detail\|filter\|LibrarySearch --passWithNoTests` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=detail|filter|LibrarySearch --passWithNoTests`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DETAIL-02 | unit | `npm test -- --testPathPattern=CinematicBackdrop` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DETAIL-01 | unit | `npm test -- --testPathPattern=ItemDetail` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | SRCH-01 | unit | `npm test -- --testPathPattern=filter` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | SRCH-02 | unit | `npm test -- --testPathPattern=LibrarySearchInput` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/components/detail/CinematicBackdrop.test.tsx` — stubs for DETAIL-02
- [ ] `src/__tests__/components/detail/ItemDetailPage.test.tsx` — stubs for DETAIL-01
- [ ] `src/__tests__/lib/search/filter.test.ts` — stubs for SRCH-01
- [ ] `src/__tests__/components/search/LibrarySearchInput.test.tsx` — stubs for SRCH-02
- [ ] `jest.config.ts` — if not established in Phases 1–3

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cinematic backdrop visual quality (blur overlay, gradient-to-black) | DETAIL-02 | Visual rendering cannot be verified with jsdom | Open detail page in browser, confirm poster blurs and gradient overlays text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
