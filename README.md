<div align="center">
            
# SnapFetch - Universal Media Downloader
An Ultra-Fast Full-Stack Media Extraction & Real-Time Telemetry Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-00F0FF?style=for-the-badge&logo=vercel&logoColor=black)](https://mysnapfetch.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend%20API-Render%20Docker-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://snapfetch-7t1k.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

Every stream has a source. Every download deserves pure fidelity.

[Explore Live App](https://mysnapfetch.vercel.app/) • [Key Features](#-key-features) • [Supported Platforms](#-supported-platforms) • [System Architecture](#-system-architecture) • [Directory Structure](#-directory-structure) • [Installation](#-local-development-guide)

---
</div>

## 🌐 Supported Platforms

SnapFetch provides native extraction and high-speed transcoding across thousands of portals:

| Platform | Resolutions Supported | Audio Extraction | Highlights |
| :--- | :---: | :---: | :--- |
| **TikTok** | 1080p / 720p HD | MP3 (320kbps) | Clean video with zero watermark |
| **Instagram** | 1080p / 720p HD | MP3 (320kbps) | Reels, Posts, and Carousels |
| **Facebook** | 4K / 2K / 1080p / 720p | MP3 (320kbps) | Watch videos & public Reels |
| **X (Twitter)** | 1080p / 720p HD | MP3 (320kbps) | Fast clip & thread downloads |
| **YouTube** | 4K / 2K / 1080p / 720p | MP3 (320kbps) | Adaptive stream multiplexing |
| **Reddit** | 1080p / 720p HD | MP3 (320kbps) | Automatic audio/video dash merging |
| **Pinterest** | 1080p / 720p HD | MP3 (320kbps) | Video pins & story clips |
| **SoundCloud** | Audio Only | MP3 (Original) | Lossless track streaming |
| **Vimeo** | 4K / 1080p HD | MP3 (320kbps) | High-bitrate direct CDN streams |
| **Twitch** | 1080p60 / 720p60 | MP3 (320kbps) | Stream clips & VOD segments |
| **Dailymotion** | 1080p / 720p | MP3 (320kbps) | Standard & HD video streams |
| **LinkedIn** | 1080p / 720p | MP3 (320kbps) | Shared corporate & feed videos |

*...and 1000+ more video and audio platforms supported out-of-the-box.*

---

## ⚡ Key Features

- **Universal Platform Compatibility**: Seamless media extraction across leading social and video portals worldwide.
- **Adaptive Quality Selection**: Extract video at full native fidelity up to 4K, 2K, 1080p, and 720p, or convert directly to high-bitrate MP3 audio.
- **Universal Audio Playback**: Built-in automatic AAC transcoding guarantees clear, reliable audio playback on Windows Media Player, iOS Safari, macOS QuickTime, and Android gallery apps without silent audio bugs.
- **Live Stream Telemetry**: Real-time progress updates, download speed indicators, and dynamic ETAs powered by Server-Sent Events (SSE).
- **Native Mobile Experience**: Responsive design featuring an app-style bottom navigation bar, frosted glassmorphism elements, and light/dark theme modes.
- **Smart Concurrency Queue**: FIFO task management protects system resources by handling active conversions sequentially.
- **Automated Ephemeral Storage**: Background cleanup sweeps remove temporary files after 5 minutes to maintain server efficiency.

---

## 🏗️ System Architecture

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

## 📂 Directory Structure

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

## 🛠️ Technologies Used

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

## 🚀 Local Development Guide

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

## ☁️ Cloud Deployment

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

## 📄 Author & Attribution

Developed with care by **[Gul Hassan](https://github.com/gulhassan0599)**.  
Distributed under the MIT open-source license.
