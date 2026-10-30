# Atomic commit commands

Prepared only; no git add, commit or push has been executed. Run from this repository root after reviewing the complete diff. The audit changes and the UI restoration are both still uncommitted. The first commit keeps the interdependent frontend Auth/API/ECG changes, restored layouts and regression tests together; the next commits contain release tooling and documentation. The pre-restoration audit working tree is retained in the local backup described in ui-restoration-plan.md.

## 1. fix(ui): restore pre-audit layouts with secured ECG workflows

```powershell
git add -- '.env.example' '.gitattributes' '.gitignore' '.oxlintrc.json' 'e2e/access.spec.ts' 'e2e/fixtures/api.ts' 'e2e/ui-restoration.spec.ts' 'e2e/roles.spec.ts' 'index.html' 'package-lock.json' 'package.json' 'playwright.config.ts' 'puppeteer_monitor_test.cjs' 'puppeteer_test.cjs' 'src/App.css' 'src/App.tsx' 'src/application/context/AuthContext.tsx' 'src/application/context/ConnectionContext.tsx' 'src/application/context/PreferencesContext.tsx' 'src/application/context/SecurityContext.tsx' 'src/application/hooks/useCachedFetch.ts' 'src/application/hooks/useTestAccount.ts' 'src/application/hooks/useDeviceCommands.ts' 'src/application/hooks/useECGScale.ts' 'src/application/hooks/useECGStream.ts' 'src/application/hooks/useEcgProcessing.ts' 'src/application/hooks/useLazyEcgPaths.ts' 'src/application/hooks/useRecordingStatus.ts' 'src/application/hooks/useSessionReview.ts' 'src/application/hooks/useStickyState.ts' 'src/config/api.ts' 'src/config/env.ts' 'src/config/supabaseClient.ts' 'src/core/algorithms/ecgCoordinates.ts' 'src/core/algorithms/ecgFilters.ts' 'src/core/algorithms/ecgFrameProcessor.ts' 'src/core/algorithms/ecgPipeline.ts' 'src/core/algorithms/peakToPeak.ts' 'src/core/algorithms/processEcgFrame.ts' 'src/core/clinical/ruleBasedEngine.ts' 'src/core/types/apiTypes.ts' 'src/core/types/ecgTypes.ts' 'src/core/utils/storage.ts' 'src/data/network/websocketClient.ts' 'src/data/security/checksum.ts' 'src/index.css' 'src/presentation/components/DevToolsBlocker.tsx' 'src/presentation/components/DeviceManager.tsx' 'src/presentation/components/ECGTooltip.tsx' 'src/presentation/components/canvas/ECGCanvas.tsx' 'src/presentation/components/dashboard/AiCard.tsx' 'src/presentation/components/dashboard/DeviceCard.tsx' 'src/presentation/components/dashboard/EcgViewer.tsx' 'src/presentation/components/dashboard/MonitorPanel.tsx' 'src/presentation/components/dashboard/SessionList.tsx' 'src/presentation/components/dashboard/SessionReview.tsx' 'src/presentation/components/dashboard/VitalCard.tsx' 'src/presentation/components/layout/AdminSidebar.tsx' 'src/presentation/components/layout/DoctorSidebar.tsx' 'src/presentation/components/layout/Header.tsx' 'src/presentation/components/layout/PatientHeader.tsx' 'src/presentation/components/layout/PublicFooter.tsx' 'src/presentation/components/layout/PublicHeader.tsx' 'src/presentation/components/shared/Avatar.tsx' 'src/presentation/components/shared/FolderUploadModal.tsx' 'src/presentation/components/shared/LogoutModal.tsx' 'src/presentation/components/shared/Pagination.tsx' 'src/presentation/components/shared/QrReader.tsx' 'src/presentation/components/shared/ScreenCalibrationModal.tsx' 'src/presentation/components/shared/TimelineBar.tsx' 'src/presentation/pages/DashboardPage.tsx' 'src/presentation/pages/admin/AdminAnalyticsPage.tsx' 'src/presentation/pages/admin/AdminDashboardPage.tsx' 'src/presentation/pages/admin/AdminDevicesPage.tsx' 'src/presentation/pages/admin/AdminMonitorPage.tsx' 'src/presentation/pages/admin/AdminSessionsPage.tsx' 'src/presentation/pages/admin/AdminUsersPage.tsx' 'src/presentation/pages/auth/LoginPage.tsx' 'src/presentation/pages/auth/RegisterPage.tsx' 'src/presentation/pages/auth/ResetPasswordPage.tsx' 'src/presentation/pages/doctor/AnalyticsPage.tsx' 'src/presentation/pages/doctor/DashboardPage.tsx' 'src/presentation/pages/doctor/MonitorPage.tsx' 'src/presentation/pages/doctor/ProfilePage.tsx' 'src/presentation/pages/doctor/QrScannerPage.tsx' 'src/presentation/pages/landing/FaqPage.tsx' 'src/presentation/pages/patient/PatientDashboardPage.tsx' 'src/presentation/pages/patient/PatientDeviceScannerPage.tsx' 'src/presentation/pages/patient/PatientHistoryDetailPage.tsx' 'src/presentation/pages/patient/PatientHistoryPage.tsx' 'src/presentation/pages/patient/PatientMonitorPage.tsx' 'src/presentation/pages/patient/PatientProfilePage.tsx' 'src/presentation/pages/patient/PatientQrSyncPage.tsx' 'src/presentation/pages/patient/PatientSettingsPage.tsx' 'src/testing/ECGCanvas.test.tsx' 'src/testing/EcgViewer.test.tsx' 'src/testing/PatientHistoryDetailPage.test.tsx' 'src/testing/PatientMonitorPage.test.tsx' 'src/testing/auditRegression.test.ts' 'src/testing/useTestAccount.test.ts' 'src/testing/checksum.test.ts' 'src/testing/ecgFilters.test.ts' 'src/testing/ecgWorker.test.ts' 'src/testing/useECGStream.test.ts' 'src/testing/useLazyEcgPaths.test.ts' 'src/workers/bpm.worker.ts' 'src/workers/ecg.worker.ts' 'vite.config.ts' 'vitest.config.ts'
git commit -m "fix(ui): restore pre-audit layouts with secured ECG workflows"
```

## 2. ci: gate immutable releases with readiness and rollback checks

```powershell
git add -- '.github/workflows/ci.yml' 'deploy/release.sh' 'test_and_build.cjs' 'test_and_build.ps1'
git commit -m "ci: gate immutable releases with readiness and rollback checks"
```

## 3. docs: record audit remediation and rollout evidence

```powershell
git add -- 'README.md' 'docs/commit-commands.md' 'docs/evidence/browser-tests.log' 'docs/evidence/build.log' 'docs/evidence/lint.log' 'docs/evidence/npm-audit.log' 'docs/evidence/typecheck.log' 'docs/evidence/unit-tests.log' 'docs/npm-audit.json' 'docs/verification.json' 'docs/verification.md' 'docs/ui-restoration-plan.md'
git commit -m "docs: record audit remediation and rollout evidence"
```

## Test-account lookup follow-up

The current working tree still includes the uncommitted audit/UI restoration. Its first application commit above includes the new lookup hook and regression tests so that the committed application remains complete. After that baseline application has been committed, a standalone application of this fix can use these atomic commands:

```powershell
git add -- 'src/application/hooks/useTestAccount.ts' 'src/presentation/pages/admin/AdminUsersPage.tsx' 'src/testing/useTestAccount.test.ts' 'e2e/fixtures/api.ts' 'e2e/ui-restoration.spec.ts'
git commit -m "fix(admin): restore paginated test account lookup"
```

```powershell
git add -- 'docs/verification.md' 'docs/verification.json' 'docs/commit-commands.md'
git commit -m "docs: record test account lookup verification"
```

Commands are prepared only; no staging, commit or push was performed.
