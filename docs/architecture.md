# Architecture — foundation

Next.js serves the public UI. Smart Import parses spreadsheet data in the browser for preview and validation only. No database or automation worker is connected yet.

Future: browser UI -> authenticated API -> isolated PostgreSQL job store -> separately hosted Playwright worker -> synthetic Demo CRM -> verification/reporting.

Never commit credentials or real customer data. The worker must not bypass authentication or call target record-creation APIs directly.
