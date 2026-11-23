import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import config from './config/index.js';
import { ExpressError } from './utils/ExpressError.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Dynamic CORS configuration
const allowedOrigins = (config.clientUrl || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Allow configured origins or common localhost ports in dev
    const isAllowed = allowedOrigins.includes(normalizedOrigin) ||
      (config.nodeEnv === 'development' && /^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

// Request parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gzip compression
app.use(compression());

// HTTP Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/downloads', downloadRoutes);

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SnapFetch API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      platforms: '/api/v1/media/platforms',
      mediaInfo: 'POST /api/v1/media/info',
      downloads: 'POST /api/v1/downloads'
    }
  });
});

// 404 Route handler for unmatched API paths
app.use('*', (req, res, next) => {
  next(new ExpressError(404, 'The requested route was not found on this server'));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
