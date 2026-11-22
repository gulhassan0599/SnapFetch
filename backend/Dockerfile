# Use lightweight official Node.js Alpine base image
FROM node:20-alpine

# Install Python3, yt-dlp, and ffmpeg
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy dependency definitions and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Create downloads directory
RUN mkdir -p downloads

# Environment defaults
ENV PORT=5000
ENV NODE_ENV=production
ENV YT_DLP_PATH=yt-dlp
ENV FFMPEG_PATH=ffmpeg
ENV DOWNLOAD_DIRECTORY=./downloads

EXPOSE 5000

CMD ["node", "server.js"]
