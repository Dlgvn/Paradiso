# FinVault Bot

## What This Is

FinVault is a Discord bot that gives any community member instant access to professional-grade financial analysis across 5 asset classes — public stocks, bonds, real estate, private companies, and bank instruments. Users run slash commands to get valuations, risk scores, news sentiment, and AI-powered investment advice powered by the Claude API.

## Core Value

Any Discord user can type one command and get a full valuation + risk analysis + AI recommendation for any asset — without leaving Discord.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] `/valuation stock <ticker>` — P/E, PEG, EV/EBITDA, Graham Number, simplified DCF via yfinance
- [ ] `/valuation bond` — YTM, current yield, modified duration, convexity, real yield from user inputs
- [ ] `/valuation realestate` — Cap rate, cash-on-cash, GRM, NOI, 1% rule from user inputs
- [ ] `/valuation private` — EV/Revenue, EV/EBITDA multiples, DCF from user inputs
- [ ] `/valuation bank` — Real APY after inflation, effective return comparison
- [ ] `/risk <ticker or asset>` — 1–10 risk score with plain-English breakdown
- [ ] `/advisor <question>` — Claude API: structured buy/hold/sell + open Q&A with disclaimer
- [ ] `/news <ticker>` — News sentiment analysis via Finnhub, shows recent headlines + impact
- [ ] `/compare <ticker1> <ticker2>` — Side-by-side valuation comparison for two stocks
- [ ] `/portfolio add/show/remove` — Personal portfolio tracker with total value (SQLite per user)
- [ ] `/watchlist add/show/remove` — Save tickers and monitor them
- [ ] Bot deployed on Railway.app and accessible 24/7
- [ ] All commands handle bad input gracefully with helpful error messages
- [ ] Git worktrees used for parallel feature development (rubric requirement)
- [ ] GitHub issues track each command as a separate issue

### Out of Scope

- Real-time price alerts / push notifications — requires persistent background tasks, deferred to v2
- OAuth / user authentication — Discord user ID is sufficient for portfolio/watchlist
- Paid API tiers — all data sources must have a usable free tier for v1
- Mobile app or web dashboard — Discord-only for v1
- Options / futures / crypto valuation — too specialized for v1 scope

## Context

**Course project context:** This is a 2-week class project (Weeks 11–12) worth 20% of final grade. Rubric weights: Functionality 35%, Git Process 25%, Code Quality 20%, Documentation 10%, Creativity 10%.

**Required workflow:** Git worktrees for parallel feature development, GitHub issues per command, sub-agents for API research, deployed and accessible for demo.

**Target platform:** Discord (discord.py library). Public community bot — anyone in a server can use all commands.

**APIs selected:**
- `yfinance` (Python library) — stock data, no key required
- Financial Modeling Prep free tier — financial statements (250 calls/day)
- Finnhub free tier — news + sentiment (60 calls/min)
- FRED API (St. Louis Fed) — CPI/inflation data for real yield calculations
- Claude API (`claude-sonnet-4-6`) — AI advisor command
- Pure Python math — bond, real estate, private company calculations

**Data storage:** SQLite via `aiosqlite` for portfolio and watchlist per Discord user ID.

**Deployment target:** Railway.app (free tier, no sleep, ideal for Discord bots).

## Constraints

- **Tech stack**: Python + discord.py — required by rubric (python-telegram-bot / discord.py / Slack Bolt)
- **Timeline**: 2 weeks — Week 11 setup + first command, Week 12 complete all + demo
- **APIs**: Free tier only — no paid subscriptions for v1
- **Deployment**: Must be live and accessible for class demo in Week 12
- **Git process**: Must use worktrees + GitHub issues + meaningful commits (25% of grade)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Discord over Telegram/Slack | Claude Code community is on Discord; live demo to classmates is more impressive | — Pending |
| yfinance over Alpha Vantage | No API key required, more data available, community-maintained | — Pending |
| SQLite over in-memory | Portfolio/watchlist must persist between bot restarts | — Pending |
| Sequential git worktrees per command | Each command = one issue = one branch = one worktree (maps to rubric requirement) | — Pending |
| Claude sonnet-4-6 for advisor | Best quality/cost for conversational finance Q&A | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after initialization*
