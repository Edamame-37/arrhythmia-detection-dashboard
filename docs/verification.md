# Local verification

The restored UI and administrator test-account repair were verified on 28 October 2026 against the uncommitted frontend working tree. All checks passed: `npm run typecheck`, `npm run lint` with warnings denied, 57 unit/component/hook tests across 16 files, 71 Chromium scenarios, and `npm run build`.

The browser suite covers 27 route layouts at desktop width 1440 and mobile width 390, with 54 screenshots. Additional interactions check administrator sidebar collapse/account dialogs, mobile doctor navigation, consent-based device pairing, and expanding a patient's sessions to open clinical review. Existing anonymous-access, server-role identity and 125 Hz historical-offset checks remain enabled. The final single-worker run completed cleanly.

## Administrator test accounts

The restored quick-access panel incorrectly searched only the current ten-user page for profile ID `1`. The original UI identifies `Patient Test` and `Doctor Test`; neither account is required to have that ID. The panel now uses a dedicated Auth/actor/role-scoped SWR lookup that reads every admin API page with the supported limit of 100, independently of the main table's current page. Normal table pagination is retained. Exact full-name matching normalizes case/whitespace and checks the account role. Multiple matching profiles produce a review error rather than choosing a clinical identity arbitrarily.

The panel distinguishes loading, missing accounts and request errors, and supports an explicit retry. Account mutations refresh the lookup; a failed lookup refresh is displayed in its own panel. Seven hook regressions cover a non-1 ID, a later API page, doctor selection, missing accounts, error/retry, ambiguous names, the non-admin guard and role changes. Three browser cases verify the populated panel remains pinned while the table changes page, switches correctly to Doctor Test, finishes empty when missing, and recovers after a failed lookup.

A read-only check confirmed one enabled account and one profile for each expected test name, with matching Auth users in the configured database. No account, profile, Auth user, database or environment setting was changed. Populated panel screenshots use synthetic API/Auth data and are retained at `%TEMP%/ecgrhythmia-test-account-verification/trial-patient.png` and `trial-doctor.png`; they are also in the ignored browser test output.

The layout reference is commit `bcec619591c6566f0e542c17efeea1cc295400a8`. Eighteen reference screenshots were captured from its source using the currently installed toolchain and synthetic service fixtures. Representative dashboard, monitor and administrator layouts were compared visually. The original audit working tree, reference images and final screenshots are retained under `%TEMP%/ecgrhythmia-ui-restoration-20261028_131133/`; browser outputs are also available in Git-ignored `test-results/`. This is a source/layout comparison, not a claim of pixel identity with a previously deployed binary.

Original presentation structures, navigation, forms, dialogs, cards, clinical sidebars and responsive spacing were restored around the audited data flows. Auth guards, private API access, server impersonation/consent, device ACK states, worker processing, sample-rate timing, calibrated ECG transforms and UNKNOWN handling remain active. Backend, database, broker configuration and environment files were not changed by this UI restoration. The new reset and role-specific monitor routes follow the original visual design.

Evidence logs are in `evidence/`. `verification.json` records a reproducible source/test fingerprint and the baseline reference. No git add, commit, push or remote deployment was performed. Dependency manifests were unchanged; the earlier npm audit evidence from 27 October reported zero vulnerabilities and was not repeated for presentation changes.

Browser tests use synthetic SDK sessions and mocked API/Auth responses. Live email/reset delivery, real camera hardware, firmware/broker behavior, physical screen calibration and deployed HTTPS/CSP/PWA behavior remain separate acceptance work in the backend rollout guide.
