# Requirements: FinVault Bot

**Defined:** 2026-04-07
**Core Value:** Any Discord user can type one command and get a full valuation + risk analysis + AI recommendation for any asset — without leaving Discord.

## v1 Requirements

### Bot Infrastructure

- [ ] **INFRA-01**: Discord bot initializes with slash commands registered globally
- [ ] **INFRA-02**: Bot handles command errors gracefully with user-friendly messages
- [ ] **INFRA-03**: Bot deployed to Railway.app and accessible 24/7
- [ ] **INFRA-04**: Environment variables used for all tokens (Discord, Claude, Finnhub, FMP)
- [ ] **INFRA-05**: SQLite database initialized for portfolio and watchlist persistence

### Valuation

- [ ] **VAL-01**: `/valuation stock <ticker>` fetches live data and returns P/E, PEG, EV/EBITDA, Graham Number
- [ ] **VAL-02**: `/valuation stock <ticker>` includes simplified DCF with optional user-supplied assumptions
- [ ] **VAL-03**: `/valuation bond` prompts for par value, coupon rate, price, maturity and returns YTM, current yield, modified duration, real yield
- [ ] **VAL-04**: `/valuation realestate` prompts for price, rent, expenses and returns cap rate, cash-on-cash, GRM, NOI, 1% rule check
- [ ] **VAL-05**: `/valuation private` prompts for revenue, EBITDA, growth rate and returns EV multiples and DCF estimate
- [ ] **VAL-06**: `/valuation bank` prompts for APY and term and returns real yield after inflation, effective return

### Risk

- [ ] **RISK-01**: `/risk <ticker>` returns a 1–10 risk score with plain-English breakdown
- [ ] **RISK-02**: Risk score for stocks uses beta, volatility, debt/equity ratio, and market cap as inputs
- [ ] **RISK-03**: `/risk` for non-stock assets accepts manual inputs and scores based on asset-class-specific factors

### AI Advisor

- [ ] **ADVIS-01**: `/advisor <question>` sends question to Claude API with relevant asset context injected
- [ ] **ADVIS-02**: Advisor provides structured buy/hold/sell recommendation when given a ticker
- [ ] **ADVIS-03**: Advisor supports open-ended Q&A for any finance question
- [ ] **ADVIS-04**: All advisor responses include disclaimer: "Not financial advice. For educational purposes only."
- [ ] **ADVIS-05**: Conversation context preserved per user within a session (multi-turn)

### News

- [ ] **NEWS-01**: `/news <ticker>` fetches recent headlines via Finnhub and displays sentiment summary
- [ ] **NEWS-02**: News output shows bullish/bearish/neutral label per headline with overall sentiment score

### Compare

- [ ] **COMP-01**: `/compare <ticker1> <ticker2>` shows side-by-side table of key valuation metrics for both stocks
- [ ] **COMP-02**: Compare output highlights which ticker scores better on each metric

### Portfolio

- [ ] **PORT-01**: `/portfolio add <ticker> <shares> <avg_price>` saves a holding to user's portfolio in SQLite
- [ ] **PORT-02**: `/portfolio show` displays all holdings with current value, gain/loss, and total portfolio value
- [ ] **PORT-03**: `/portfolio remove <ticker>` removes a holding from the portfolio

### Watchlist

- [ ] **WATCH-01**: `/watchlist add <ticker>` saves a ticker to the user's watchlist
- [ ] **WATCH-02**: `/watchlist show` displays all watched tickers with current price and 1-day change
- [ ] **WATCH-03**: `/watchlist remove <ticker>` removes a ticker from the watchlist

### Git Process (Rubric)

- [ ] **GIT-01**: Each command developed in its own git worktree
- [ ] **GIT-02**: Each command tracked as a GitHub issue
- [ ] **GIT-03**: Sub-agents used for at least one API research task (documented in README)
- [ ] **GIT-04**: Meaningful commit history with clear messages per feature

### Documentation

- [ ] **DOCS-01**: README lists all commands with usage examples and setup instructions
- [ ] **DOCS-02**: README includes deployment guide for Railway.app

## v2 Requirements

### Alerts

- **ALERT-01**: Price alert when a watched ticker hits a target price
- **ALERT-02**: Daily portfolio summary pushed to a designated channel

### Inflation Command

- **INFL-01**: `/inflation` shows current CPI, real Fed funds rate, and real yield on savings vs bonds

### Currency

- **FX-01**: `/fx <amount> <from> <to>` converts currency using live exchange rates

### Enhanced Portfolio

- **PORT-04**: Portfolio diversification score and sector breakdown
- **PORT-05**: Historical performance chart (image embed)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Options / futures / crypto | Too specialized; separate risk model needed |
| Real-time price alerts | Requires persistent background scheduler; v2 |
| Web dashboard | Discord-only for v1 |
| User authentication | Discord user ID sufficient |
| Paid API tiers | Free tiers only for v1 |
| Sentiment trading signals | Legal/compliance risk for a class project |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 to INFRA-05 | Phase 1 | Pending |
| VAL-01, VAL-02 | Phase 2 | Pending |
| VAL-03, VAL-04, VAL-05, VAL-06 | Phase 3 | Pending |
| RISK-01, RISK-02, RISK-03 | Phase 4 | Pending |
| ADVIS-01 to ADVIS-05 | Phase 5 | Pending |
| NEWS-01, NEWS-02, COMP-01, COMP-02 | Phase 6 | Pending |
| PORT-01 to PORT-03, WATCH-01 to WATCH-03 | Phase 7 | Pending |
| GIT-01 to GIT-04, DOCS-01, DOCS-02 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-07*
*Last updated: 2026-04-07 after initial definition*
