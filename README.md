# SnapFetch 🚀

SnapFetch is a modern, full-stack media downloader web application built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **yt-dlp**. It supports real-time multi-download queues, live telemetry streaming via Server-Sent Events (SSE), audio extraction with FFmpeg, and resolutions up to 4K.

---

## ✨ Features

- **Multi-Download FIFO Queue**: Concurrency-controlled download pipeline preventing CPU & network choking.
- **Real-Time Telemetry via SSE**: Live download progress bars, speed metrics, ETA countdowns, and queue position tracking.
- **High-Resolution Support**: Downloads up to 4K (2160p), 2K (1440p), 1080p, 720p, 480p, and MP3 audio extraction.
- **yt-dlp Auto-Updater**: Background self-updater on startup and every 24 hours to stay compatible with platform changes.
- **Request Platform Form**: Integrated with EmailJS for submitting unsupported site requests with local storage backup.
- **Responsive & Accessible UI**: Built with Tailwind CSS v4, supporting both Light and Dark modes.

---

## 🛠️ Project Structure

```
SnapFetch/
├── backend/
│   ├── bin/               # Local binaries (yt-dlp, ffmpeg)
│   ├── config/            # Application & binary configurations
│   ├── controllers/       # Media & download route controllers
│   ├── middleware/        # Error handlers & request validators
│   ├── routes/            # REST API endpoints
│   ├── services/          # Queue manager, SSE service, yt-dlp service
│   ├── utils/             # Media normalizers & logger
│   └── server.js          # Express entrypoint
├── frontend/
│   ├── public/            # Static assets & web app manifest
│   ├── src/
│   │   ├── components/    # Reusable UI components (Button, Card, Input, etc.)
│   │   ├── context/       # Download, Theme, and Toast state providers
│   │   ├── pages/         # Home, Download, RequestPlatform, NotFound
│   │   ├── services/      # Axios API client & SSE event source manager
│   │   └── App.jsx        # Routing & layout shell
│   └── vite.config.js     # Vite & Tailwind configuration
└── downloads/             # Temporary downloaded media storage
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [FFmpeg](https://ffmpeg.org/) (installed in system PATH or placed inside `backend/bin/`)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure your `.env` file:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
YT_DLP_PATH=           # Leave blank to use system PATH, or specify path
FFMPEG_PATH=           # Leave blank to use system PATH, or specify path
DOWNLOAD_DIRECTORY=./downloads
LOG_LEVEL=info
```

Start the backend server:
```bash
node server.js
```
Backend will run at `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Start the frontend development server:
```bash
npm run dev
```
Frontend will run at `http://localhost:5173`.

---

## 🧪 Build & Lint Checks

- **Frontend Build**: `cd frontend && npm run build`
- **Frontend Lint**: `cd frontend && npm run lint`

---

## 📄 License

MIT License. Designed and developed with ❤️ for fast, reliable media downloads.
