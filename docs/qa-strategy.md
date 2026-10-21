# QA strategy and test coverage

## Goal
Verify that the **synthetic browser-local demo** reliably parses, validates, transfers and reports records. Distinguish automated coverage from manual checks and future RPA requirements.

## Tooling
- **Vitest:** unit tests in `src/**/*.test.ts` and `src/**/*.test.tsx`.
- **Playwright:** end-to-end Chromium tests under `e2e/`.
- **ESLint + TypeScript:** code quality and static typing.
- **GitHub Actions:** separate application CI and Browser QA.
- **npm audit:** blocks CI on high/critical advisories in production dependencies.

## Coverage matrix

| Area | Automated checks | Manual follow-up |
|---|---|---|
| Mapping and validation | Suggested mappings, required fields, duplicates, date edge cases | Unusual customer templates |
| CSV import | Mapping, valid/invalid records, duplicate headers, extra columns | Encoding and large CSV variations |
| XLSX import | Synthetic real workbook, malformed workbook | Safari and Firefox compatibility, formulas, date cells |
| Demo CRM | Form entry, duplicate rejection, persistence | Browser storage permissions and reset UX |
| Transfer/report | Saved/skipped counts, success rate, CSV download | Inspect report in spreadsheet programs |
| History | Persistence, download, clear without deleting CRM | Cross-tab behavior, quota errors |
| Responsive | Mobile, tablet, desktop viewport and overflow smoke tests | Touch ergonomics and zoom |
| Accessibility | Field labels, button names, keyboard route, image alt | Contrast, focus order, screen readers, WCAG audit |
| Browser worker prototype | UI-driven form entry, batch failure continuation | Actual application integration not implemented |

## Test commands

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

## Suggested release checklist
- [ ] Application CI passes on final commit
- [ ] Browser QA passes on final commit
- [ ] Manual Safari Excel upload and re-import pass
- [ ] Verify first import saves and second import skips duplicates
- [ ] Verify report CSV values and browser-local history
- [ ] Mobile and tablet visual review
- [ ] Manual keyboard, focus, contrast, and screen-reader review
- [ ] Confirm public demo contains no real data or secrets
- [ ] Confirm access-protection setting and shareability before making public
- [ ] Explicit approval before merge or production deployment

## Known limitations
CI browser tests currently use Chromium; Safari testing by a user is valuable but not a substitute for automated WebKit coverage. A green workflow does not establish a complete accessibility or penetration-test certification. The Playwright browser-worker tests are **test prototypes**, not a running SaaS worker.

## Defect-report template
**Title**, environment/browser, build/commit, test data classification, steps, expected result, actual result, evidence, severity, regression test, and retest outcome.
