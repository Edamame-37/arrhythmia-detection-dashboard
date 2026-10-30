# ECGRhythmia frontend

React/TypeScript dashboard with Supabase Auth and a private Rust API. Patient, doctor and admin routes use the normalized identity returned by GET /api/auth/me. Private data is never queried directly through Supabase tables.

## Development and verification

Copy .env.example to .env.local and set the real public Auth URL/anon key. For local use set VITE_WS_URL=ws://127.0.0.1:8080/ws and the backend CORS origin to http://localhost:5173 or the exact chosen origin. A blank VITE_API_URL uses the same-origin /api proxy. DEV_API_TARGET configures that proxy. Existing development configurations using VITE_SUPABASE_URL=/supabase remain supported when VITE_ACTUAL_SUPABASE_URL is an explicit HTTPS Auth project URL; no project address is hardcoded.

~~~sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm audit
~~~

Typechecking runs tsc -b against referenced application/config projects. Lint warnings fail. Vitest includes src tests only; browser tests live in e2e. Playwright uses synthetic Auth sessions and API responses; it never signs into a real patient account. Set VITE_SUPABASE_URL=https://test-project.supabase.co and VITE_SUPABASE_ANON_KEY=synthetic-public-key for browser fixtures. Backend role/DB/real WebSocket tests run separately in the backend repository.

ECG processing shares millivolt/time coordinates and actual sample rate across live/history. Six limb leads are displayed. Canvas gain/speed and marker transforms are applied once. Filters and insufficient/UNKNOWN states are explicit; QTc and absent device telemetry are not fabricated. Physical screen calibration is required for physical paper measurements. Synthetic signal tests do not validate diagnostic accuracy.

Private images are authenticated blob URLs. Session metadata is paginated and history selects database frame IDs; hidden/deleted frames keep original timing. Failed pairing/commands never create local success state. SDK sessions are the only bearer source; server-issued impersonation context preserves actor/effective permissions and partitions SWR caches.

Routes are lazy loaded. The PWA precaches static resources only, excludes private API/uploads from navigation fallback, prompts before updating, and does not cache API/clinical responses. Nginx security headers and production systemd/deployment templates are maintained in the backend deploy directory; adapt exact domains before use. See ../ecgrhythmia-backend/docs/rollout.md and contracts.md.

CI builds/tests the same SHA used for immutable release artifacts. Deployment requires a manually dispatched main-branch workflow, verified SSH host keys and server-side readiness/rollback checks. No deployment or git commit is automatic during local remediation.
