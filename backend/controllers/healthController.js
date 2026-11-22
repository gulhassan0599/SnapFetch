import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (req, res) => {
  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'healthy',
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      },
      'Health check completed successfully'
    )
  );
});

export default getHealth;
