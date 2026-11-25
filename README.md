# SnapFetch — Universal Media Downloader & Stream Processor

SnapFetch is a modern full-stack web application designed for fast, high-quality media extraction, format transcoding, and real-time telemetry streaming.

---

### Live Application
- **Frontend App**: [https://mysnapfetch.vercel.app](https://mysnapfetch.vercel.app)
- **Alternate Domain**: [https://snapfetch-app.vercel.app](https://snapfetch-app.vercel.app)
- **Backend Service**: [https://snapfetch-7t1k.onrender.com](https://snapfetch-7t1k.onrender.com)

---

## Key Features

- **Universal Platform Compatibility**: Seamless media extraction across leading social and video portals, including TikTok, Instagram, Facebook, X (Twitter), YouTube, Reddit, Pinterest, SoundCloud, Twitch, Vimeo, and more.
- **Adaptive Quality Selection**: Extract video at full native fidelity up to 4K, 2K, 1080p, and 720p, or convert directly to high-bitrate MP3 audio.
- **Universal Audio Playback**: Built-in automatic AAC transcoding guarantees clear, reliable audio playback on Windows Media Player, iOS Safari, macOS QuickTime, and Android gallery apps.
- **Live Stream Telemetry**: Real-time progress updates, download speed indicators, and dynamic ETAs powered by Server-Sent Events (SSE).
- **Native Mobile Experience**: Responsive design featuring an app-style bottom navigation bar, frosted glassmorphism elements, and light/dark theme modes.
- **Smart Concurrency Queue**: FIFO task management protects system resources by handling active conversions sequentially.
- **Automated Ephemeral Storage**: Background cleanup sweeps remove temporary files after 5 minutes to maintain server efficiency.

---

## System Architecture

```
[ Client Browser / Mobile Web ]
            │
            ▼ (REST & SSE)
[ Frontend — React 19 + Tailwind CSS ]
            │
            ▼ (JSON API)
[ Backend Engine — Node.js 20 on Docker ]
     ├── Request Ingestion & Validation
     ├── FIFO Queue Governor
     ├── Stream Probing & yt-dlp Extraction
     ├── FFmpeg Transcoding & AAC Multiplexing
     └── Ephemeral File Auto-Cleaner
```

---

## Directory Structure

```text
SnapFetch/
├── backend/                  # REST API & stream conversion engine
│   ├── config/               # App configuration & environment loader
│   ├── constants/            # Platform status codes & constants
│   ├── controllers/          # Media, download, and health controllers
│   ├── downloads/            # Ephemeral media cache directory
│   ├── middleware/           # Validation, rate limiting & error handlers
│   ├── models/               # Job state store & queue data models
│   ├── routes/               # API route definitions
│   ├── services/             # Core extraction, download & SSE logic
│   ├── utils/                # Sanitization, progress parsers & format helpers
│   ├── Dockerfile            # Production Docker configuration
│   └── server.js             # Main backend entry point
│
├── frontend/                 # Client user interface
│   ├── public/               # Public assets & manifest
│   ├── src/
│   │   ├── components/       # UI buttons, inputs, modals, navigation
│   │   ├── context/          # State management (theme, download, toast)
│   │   ├── pages/            # Home, Downloader, Request Platform, 404
│   │   ├── services/         # API clients & network hooks
│   │   ├── App.jsx           # Main routing component
│   │   └── index.css         # Styling & theme variables
│   ├── vercel.json           # Client routing configuration
│   └── vite.config.js        # Vite bundler settings
│
└── README.md
```

---

## Technologies Used

### Client
- **React 19**: Modern UI rendering engine.
- **Vite**: Rapid asset compilation and bundling.
- **Tailwind CSS v4**: Utility-first styling framework.
- **React Router DOM v7**: Client-side routing.
- **React Icons**: Visual iconography.
- **Axios**: HTTP communication layer.

### Server
- **Node.js 20**: Scalable server environment.
- **Express.js**: Lightweight REST API framework.
- **yt-dlp**: Media stream analysis and extraction engine.
- **FFmpeg**: Video and audio multiplexing and AAC transcoding.
- **Server-Sent Events (SSE)**: Low-latency telemetry streaming.
- **Docker**: Containerized runtime on Alpine Linux.

---

## Local Development Guide

### Prerequisites
- Node.js (version 18 or above)
- FFmpeg installed in system PATH
- yt-dlp installed in system PATH

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend starts on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.

---

## Cloud Deployment

### Backend (Render Docker)
1. Create a new Web Service pointing to your repository.
2. Select the `backend` directory and choose the **Docker** runtime.
3. Configure environment variables (`PORT=5000`, `CLIENT_URL=https://mysnapfetch.vercel.app`, `DOWNLOAD_DIRECTORY=./downloads`).
4. Optionally pass `COOKIES_BASE64` to support authenticated sessions.

### Frontend (Vercel)
1. Import the repository in Vercel.
2. Set root directory to `frontend` with the **Vite** preset.
3. Set `VITE_API_URL` to your production backend URL.
4. Deploy.

---

## Author & Attribution

Developed with care by **Gul Hassan**.
Distributed under the MIT open-source license.
