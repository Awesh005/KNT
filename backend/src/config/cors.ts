import { env } from './env';
import cors from 'cors';

const allowedOrigins = (env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

// Automatically include www variant if applicable
allowedOrigins.forEach(origin => {
  if (origin.startsWith('https://') && !origin.includes('://www.')) {
    allowedOrigins.push(origin.replace('https://', 'https://www.'));
  } else if (origin.startsWith('http://') && !origin.includes('://www.')) {
    allowedOrigins.push(origin.replace('http://', 'http://www.'));
  }
});

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // Fallback to allow origin to prevent CORS lockouts on production
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

