# juvo-client

## Verification

Run `npm test`, `npm run lint`, and `npm run build`. The test runner uses Node 24's TypeScript support and covers export filtering, CSV serialization, and realtime reconnect cleanup.

## Exports and realtime

- `/home/accounts/export` provides account and journal-date filters, JSON downloads, session CSV, and trade CSV. Date boundaries use the profile timezone; historical accounts are available when their journals contain records.
- The trade report includes native and reporting currencies. Missing FX rates leave reporting P/L blank in CSV; native values remain available. JSON includes screenshot references, not the image files themselves.
- Live connections retry with capped backoff, refresh data after connecting, and stay open while navigating dashboard pages. Duplicate close events are coalesced and duplicate trade notices suppressed.
- Manual checks: sign in, test each download, select an account in a mixed-account journal, check empty date ranges, and verify reconnect after a temporary network interruption.

## Trading accounts

I made account data follow the selected account, without splitting the day journal.

- I can switch accounts from the sidebar and dashboard. That account’s balance, trades, P/L, and currency update with it.
- Money uses the currency I registered on the account, not a hardcoded dollar sign.
- The journal for the day stays one session. Every trade that day is recorded there, even if I switch accounts.
- If an account has passed or been breached, I create a new account before taking another trade. I do not start the day’s journal again.
