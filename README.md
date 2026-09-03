# juvo-client

## Trading accounts

I made account data follow the selected account, without splitting the day journal.

- I can switch accounts from the sidebar and dashboard. That account’s balance, trades, P/L, and currency update with it.
- Money uses the currency I registered on the account, not a hardcoded dollar sign.
- The journal for the day stays one session. Every trade that day is recorded there, even if I switch accounts.
- If an account has passed or been breached, I create a new account before taking another trade. I do not start the day’s journal again.
