# Arrhythmia Detection Dashboard (HeartSync PWA)

A real-time medical dashboard designed for streaming and monitoring Electrocardiogram (ECG) data, featuring advanced clinical algorithms, AI-powered arrhythmia detection, and PWA capabilities optimized for high-performance and low-resource environments.

This dashboard visualizes 7-lead ECG signals (Leads I, II, III, aVR, aVL, aVF, V1) in real-time, backed by a high-frequency WebSocket data server.

## 🚀 Features & Optimizations

- **Progressive Web App (PWA):** Fully aligned manifest and assets configuration for offline usage, clean install prompts, and automatic background updates.
- **Environment & Hosting Segregation:** Extracted hardcoded endpoints into environment variables (`.env.development` and `.env.production`) managed through a centralized configuration manager. Credentials and local keys are safely kept in `.env.local` files which are ignored by Git.
- **Single-Responsibility Architecture:** Refactored the heavy math loops (DC blocker filtering, Einthoven transformations, Pan-Tompkins peak parsing, and BPM calculations) out of React hooks into a pure functional processing pipeline: [ecgPipeline.ts](file:///d:/Project/arrhythmia-detection-dashboard/src/core/algorithms/ecgPipeline.ts).
- **Responsive Media & WebP Compression:** Replaced original `.JPG`/`.PNG` avatars and banners with compressed `.webp` files, yielding a **95.9% reduction in media assets size (from 4.85 MB down to 198 KB)** for fast load times on low-end devices.
- **Skeleton Loader Screens:** Added polished pulsing skeleton templates in the doctor Dashboard and Monitor view to prevent layout shifts during asynchronous REST API fetches.
- **Route Redirections:** Fixed root paths and added catch-all routing to securely redirect unauthorized or invalid URLs back to the landing page.

---

## 📂 Project Architecture

```text
├── public/                 # Static PWA assets & manifests
│   ├── images/             # Compressed WebP illustrations
│   └── manifest.json       # PWA Manifest configuration
├── src/                    # React Frontend
│   ├── core/               # Pure clinical logic
│   │   ├── algorithms/     # Einthoven, Pan-Tompkins, DCBlocker, and ecgPipeline
│   │   ├── clinical/       # Rule-based ECG diagnostics engine
│   │   ├── types/          # Universal type safety contracts
│   │   └── config.ts       # Centralized config manager (API & WS URLs)
│   ├── data/               # Network & Security (WebSockets, Checksums)
│   ├── application/        # React context & hooks (useECGStream)
│   └── presentation/       # UI Layer (Pages, Layouts, Skeletons, Canvas)
├── .env.development        # Development environment variables
├── .env.production         # Production environment variables
└── README.md               # Project documentation
```

---

## 🛠️ Configuration & Environment Variables

Create a `.env.local` or `.env.production.local` file at the root directory to store sensitive credentials and customize API paths.

```env
# Server endpoints
VITE_API_URL=http://127.0.0.1:8081
VITE_WS_URL=ws://127.0.0.1:8080
```

All configurations are resolved through [config.ts](file:///d:/Project/arrhythmia-detection-dashboard/src/core/config.ts):
```typescript
import { APP_CONFIG } from './core/config';
// APP_CONFIG.API_URL -> resolves VITE_API_URL
// APP_CONFIG.WS_URL -> resolves VITE_WS_URL
```

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Set up your local API endpoints in `.env.development` or `.env.local`.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production (Manual)
Compiles TypeScript, packages assets, obfuscates build files, and generates service worker precache lists:
```bash
npm run build
```

### 5. Automated Testing & Release Verification (Recommended)
Before running production builds, it is highly recommended to run the automated script which validates all unit/integration tests and outputs results before compiling:
```powershell
./test_and_build.ps1
```
This script will:
1. Run frontend tests using Vitest.
2. Report final test statistics (Passed vs Failed count) in the terminal.
3. Abort the build process if any test fails to prevent broken releases.
4. Execute `npm run build` once all tests pass.

---

## 🧪 Testing & Quality Assurance

The project features a comprehensive test suite covering core mathematical and clinical logic.

### Test Architecture & Directories
All test suites are grouped inside a dedicated folder: [src/testing](file:///d:/Project/arrhythmia-detection-dashboard/src/testing)
- [setup.ts](file:///d:/Project/arrhythmia-detection-dashboard/src/testing/setup.ts): Configures DOM assertion utilities (`@testing-library/jest-dom`).
- [einthoven.test.ts](file:///d:/Project/arrhythmia-detection-dashboard/src/testing/einthoven.test.ts): Verifies Lead III, aVR, aVL, and aVF augmented leads mathematical calculations.
- [dcBlocker.test.ts](file:///d:/Project/arrhythmia-detection-dashboard/src/testing/dcBlocker.test.ts): Unit tests for DC Offset removal and baseline wander filter.
- [panTompkins.test.ts](file:///d:/Project/arrhythmia-detection-dashboard/src/testing/panTompkins.test.ts): Integration tests for real-time QRS peak detection under simulated noise conditions.
- [ruleBasedEngine.test.ts](file:///d:/Project/arrhythmia-detection-dashboard/src/testing/ruleBasedEngine.test.ts): Validates Holter clinical rules (Tachycardia, Bradycardia, Irregular Rhythm diagnostics).

### Executing Tests Manually
Run all tests once:
```bash
npm run test
```
Run tests in active watch mode:
```bash
npm run test:watch
```

---

## 🚀 Deployment

The production build outputs fully standalone HTML, JS, CSS, and Service Worker assets in the `/dist` directory.

### Deployment Instructions
1. **Asset Check:** Ensure `/dist` contains `index.html`, `sw.js`, and the `assets/` subfolder.
2. **Web Server hosting:** Deploy `/dist` to static hosting platforms such as Nginx, Netlify, Vercel, Firebase Hosting, or GitHub Pages.
3. **HTTPS requirement:** PWAs require a secure context. **HTTPS must be enabled** in production for the Service Worker and the Camera QR Scanner to work correctly.

---

## 📊 Media Compression Stats
By converting high-resolution team avatars and hero graphics to optimized WebP format, we achieved massive bandwidth savings:

* **Team Avatar JPGs:** ~1.85 MB ➡️ **39 KB** (~97.9% saved)
* **Hero Mobile Banners:** 1.44 MB ➡️ **11 KB** (99.2% saved)
* **Overall Images Load:** 4.85 MB ➡️ **198 KB** (**95.9% bandwidth resource savings**)
