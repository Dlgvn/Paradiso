# Roadmap: FinVault Bot

**Milestone:** v1.0 — Class Demo Ready
**Target:** Week 12 class demo
**Phases:** 8

---

## Phase 1 — Foundation & Bot Setup

**Goal:** Working Discord bot deployed to Railway.app that responds to a hello command, with database initialized and all config in place.

**Requirements:** INFRA-01 to INFRA-05

**Deliverables:**
- `bot/` directory with `main.py`, `cogs/`, `db/`, `config.py`
- Discord bot registered, slash commands syncing
- SQLite schema created (`portfolio`, `watchlist` tables)
- `.env` with all API tokens, `.env.example` committed
- Railway.app deployment live — `/ping` responds

**Success criteria:** Bot is online in a Discord server and `/ping` returns "pong".

---

## Phase 2 — Stock Valuation Command

**Goal:** `/valuation stock <ticker>` returns a formatted embed with P/E, PEG, EV/EBITDA, Graham Number, and optional DCF.

**Requirements:** VAL-01, VAL-02

**Deliverables:**
- `cogs/valuation.py` with stock subcommand
- `services/stock_service.py` using `yfinance` + FMP fallback
- Formatted Discord embed output
- Error handling for invalid tickers
- Worktree: `feature/valuation-stock`, GitHub issue: "feat: /valuation stock command"

**Success criteria:** `/valuation stock AAPL` returns a full embed with all 5 metrics.

---

## Phase 3 — Multi-Asset Valuation (Bond, Real Estate, Private, Bank)

**Goal:** `/valuation` covers all remaining asset types with modal-based or follow-up input collection.

**Requirements:** VAL-03, VAL-04, VAL-05, VAL-06

**Deliverables:**
- Bond subcommand: YTM, duration, real yield (FRED for CPI)
- Real estate subcommand: cap rate, cash-on-cash, GRM, NOI
- Private subcommand: EV multiples, DCF
- Bank subcommand: real APY after inflation
- Input collected via Discord modals or parameter flags
- Worktree: `feature/valuation-multi`, GitHub issue: "feat: bond/realestate/private/bank valuation"

**Success criteria:** All 4 subcommands return correct calculations for sample inputs.

---

## Phase 4 — Risk Scoring Command

**Goal:** `/risk <ticker>` returns a 1–10 risk score with plain-English breakdown.

**Requirements:** RISK-01, RISK-02, RISK-03

**Deliverables:**
- `cogs/risk.py` with risk scoring logic
- `services/risk_service.py` — calculates score from beta, volatility, debt/equity, market cap
- Risk label: Low (1–3), Moderate (4–6), High (7–10)
- Manual input mode for non-stock assets
- Worktree: `feature/risk-command`, GitHub issue: "feat: /risk command"

**Success criteria:** `/risk TSLA` returns a score with breakdown explaining each contributing factor.

---

## Phase 5 — AI Advisor Command

**Goal:** `/advisor <question>` connects to Claude API, injects relevant financial context, and returns structured advice + open Q&A.

**Requirements:** ADVIS-01 to ADVIS-05

**Deliverables:**
- `cogs/advisor.py` with Claude API integration
- `services/advisor_service.py` — builds system prompt with asset context
- Buy/hold/sell recommendation when ticker detected
- Multi-turn conversation tracked per user (in-memory dict)
- Disclaimer appended to all responses
- Worktree: `feature/advisor-command`, GitHub issue: "feat: /advisor Claude API integration"

**Success criteria:** `/advisor should I buy NVDA?` returns a buy/hold/sell recommendation with reasoning and disclaimer.

---

## Phase 6 — News & Compare Commands

**Goal:** `/news <ticker>` shows sentiment-scored headlines; `/compare <t1> <t2>` shows side-by-side valuation table.

**Requirements:** NEWS-01, NEWS-02, COMP-01, COMP-02

**Deliverables:**
- `cogs/news.py` — Finnhub news API integration, sentiment labels per headline
- `cogs/compare.py` — fetches both tickers, builds comparison embed table
- Comparison highlights better/worse metric per row
- Worktree: `feature/news-compare`, GitHub issue: "feat: /news and /compare commands"

**Success criteria:** `/news AAPL` shows 5 headlines with bullish/bearish/neutral labels; `/compare AAPL MSFT` shows side-by-side metrics table.

---

## Phase 7 — Portfolio & Watchlist Commands

**Goal:** `/portfolio` and `/watchlist` persist user data in SQLite with add/show/remove operations.

**Requirements:** PORT-01 to PORT-03, WATCH-01 to WATCH-03

**Deliverables:**
- `cogs/portfolio.py` — add/show/remove holdings with live P&L
- `cogs/watchlist.py` — add/show/remove tickers with current price + 1-day change
- SQLite read/write via `aiosqlite`
- Each operation scoped to Discord user ID
- Worktree: `feature/portfolio-watchlist`, GitHub issue: "feat: portfolio and watchlist commands"

**Success criteria:** User adds 3 holdings, runs `/portfolio show`, sees total value with gain/loss per position.

---

## Phase 8 — Polish, Docs & Demo Prep

**Goal:** Bot is production-ready with full README, clean command help text, and verified deployment.

**Requirements:** GIT-01 to GIT-04, DOCS-01, DOCS-02

**Deliverables:**
- README with all commands, usage examples, setup guide, deployment guide
- `/help` command with command list embed
- All GitHub issues closed and linked to merged branches
- Worktree history documented in README (screenshots or git log output)
- Sub-agent usage documented (which commands were researched via sub-agents)
- Railway.app deployment verified live

**Success criteria:** A new developer can follow the README and run the bot locally in under 10 minutes. Bot passes a full command walkthrough in class demo.

---

## Phase Summary

| Phase | Name | Week | Requirements | Status |
|-------|------|------|-------------|--------|
| 1 | Foundation & Bot Setup | 11 | INFRA-01–05 | ○ |
| 2 | Stock Valuation | 11 | VAL-01–02 | ○ |
| 3 | Multi-Asset Valuation | 11–12 | VAL-03–06 | ○ |
| 4 | Risk Scoring | 12 | RISK-01–03 | ○ |
| 5 | AI Advisor | 12 | ADVIS-01–05 | ○ |
| 6 | News & Compare | 12 | NEWS-01–02, COMP-01–02 | ○ |
| 7 | Portfolio & Watchlist | 12 | PORT-01–03, WATCH-01–03 | ○ |
| 8 | Polish & Demo Prep | 12 | GIT-01–04, DOCS-01–02 | ○ |

---
*Roadmap created: 2026-04-07*
