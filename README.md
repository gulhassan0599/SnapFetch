# SnapFetch

A web application for media processing, format conversion, and stream analysis with real-time progress updates.

## Live Deployments

- **Frontend**: `https://your-frontend-domain.vercel.app`
- **Backend API**: `https://your-backend-api.onrender.com`

---

## Architecture Overview

- **Frontend**: React SPA built with Vite and Tailwind CSS. Connects to backend endpoints and listens to Server-Sent Events (SSE) for job status.
- **Backend**: Node.js and Express REST API. Manages a FIFO task queue and interfaces with command-line media utilities for processing.
- **Queue Manager**: Restricts active jobs to manage memory and CPU overhead.
- **Storage Daemon**: Automatically removes temporary files on a scheduled interval.

---

## Deployment Guide

### 1. Backend (Render)

Render runs the Node.js application inside a container with the required CLI tools installed.

1. Create a **Web Service** on Render connected to this repository.
2. Set **Root Directory** to `backend`.
3. Select **Docker** as the runtime (uses `backend/Dockerfile`).
4. Add the following Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `DOWNLOAD_DIRECTORY`: `./downloads`
   - `LOG_LEVEL`: `info`
5. Deploy the service and record the generated service URL.

### 2. Frontend (Vercel)

1. Create a **New Project** on Vercel importing this repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Configure Environment Variables:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api/v1`
   - `VITE_EMAILJS_SERVICE_ID`: your service ID
   - `VITE_EMAILJS_TEMPLATE_ID`: your template ID
   - `VITE_EMAILJS_PUBLIC_KEY`: your public key
5. Deploy the project and update the backend's `CLIENT_URL` to match your Vercel URL.

---

## Local Development

### Prerequisites
- Node.js (v18+)
- Local media processing utilities in system PATH

### Running Backend
```bash
cd backend
npm install
node server.js
```

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## License & Usage

- **Code License**: MIT License.
- **Usage Scope**: Designed for personal media backup, stream diagnostics, and format transcoding. Users must ensure compliance with third-party service terms and local copyright laws.
