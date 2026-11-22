import express from 'express';
import { getMediaInfo, getSupportedPlatforms } from '../controllers/mediaController.js';
import { validateMediaUrl } from '../validators/requestValidators.js';

const router = express.Router();

router.get('/platforms', getSupportedPlatforms);
router.post('/info', validateMediaUrl, getMediaInfo);

export default router;
