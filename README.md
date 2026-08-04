# Arrhythmia Detection Dashboard (ECG Simulation)

A real-time medical dashboard designed for streaming and monitoring Electrocardiogram (ECG) data, featuring advanced clinical algorithms and AI-powered arrhythmia detection. 

This project simulates a medical device monitor, streaming high-frequency ECG data through a robust Rust-based WebSocket backend to a highly responsive React frontend rendered via HTML Canvas.

## 🚀 Features

- **Progressive Web App (PWA):** Fully installable on Desktop and Mobile devices, featuring an offline-ready caching mechanism and background auto-updates.
- **Backend Synchronization:** Seamless state synchronization for patient profiles with a graceful mock/local storage fallback when the API server is unreachable.
- **Real-Time ECG Streaming:** High-performance data streaming from backend to frontend.
- **AI Arrhythmia Detection:** Integrates AI model predictions for clinical insights.
- **Clinical Algorithms:** Implements Einthoven, Pan-Tompkins, and Peak-to-Peak algorithms for signal processing.
- **HTML Canvas Rendering:** Smooth, performant rendering of ECG waveforms using custom React Canvas components.
- **Clean Architecture:** Strict separation of concerns (Core, Data, Application, Presentation layers) in the frontend.

## 🛠️ Technology Stack

### Frontend (React + Vite)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Custom Hooks (`useECGStream`)
- **Rendering:** HTML5 `<canvas>` for high-performance waveform visualization

### Backend (Rust)
- **Language:** Rust (Edition 2021)
- **WebSockets:** `tungstenite` for TCP Server and WebSocket streaming (Port 8080)
- **Data Parsing:** `csv` crate for reading simulated medical data
- **Serialization:** `serde` & `serde_json`

## 📂 Project Architecture

```text
├── backend/               # Rust WebSocket Server
│   ├── src/models/        # Data structures & JSON payloads
│   ├── src/data/          # CSV reading & Data simulation
│   ├── src/network/       # WebSocket handling (Port 8080)
│   └── src/main.rs        # Backend entry point
├── src/                   # React Frontend
│   ├── core/              # Pure clinical logic (Algorithms, Rule Engines)
│   ├── data/              # Network & Security (WebSockets, Checksum)
│   ├── application/       # State management hooks
│   └── presentation/      # UI Components (Dashboard, Canvas, Layout)
└── best_model.keras       # AI Model for Arrhythmia Detection
```

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://rustup.rs/)

### 1. Run the Backend (Rust)
Navigate to the backend directory and start the WebSocket server:
```bash
cd backend
cargo run
```
*The server will start on `ws://127.0.0.1:8080` and begin streaming data.*

### 2. Run the Frontend (React)
Open a new terminal window, install dependencies, and start the development server:
```bash
npm install
npm run dev
```
*The dashboard will be available at `http://localhost:5173`.*

### 3. PWA Installation (Optional)
To install the dashboard as a standalone application on your device:
1. Build and preview the production version:
   ```bash
   npm run build
   npm run preview
   ```
2. Open the URL in your browser (e.g., Google Chrome or Edge).
3. Click the **"Install App"** icon located on the right side of the address bar.
4. The dashboard will now launch from your home screen or desktop, capable of functioning gracefully without an active internet connection.

## 📜 License
This project is for educational and simulation purposes.
