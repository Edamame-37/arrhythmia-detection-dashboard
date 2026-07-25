# Arrhythmia Detection Dashboard (ECG Simulation)

A real-time medical dashboard designed for streaming and monitoring Electrocardiogram (ECG) data, featuring advanced clinical algorithms and AI-powered arrhythmia detection. 

This project simulates a medical device monitor, streaming high-frequency ECG data through a robust Rust-based WebSocket backend to a highly responsive React frontend rendered via HTML Canvas.

## 🚀 Features

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

## 📜 License
This project is for educational and simulation purposes.
