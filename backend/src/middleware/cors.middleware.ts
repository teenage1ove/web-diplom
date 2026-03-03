import cors from 'cors';
import { config } from '../config/env';

export const corsOptions = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow configured frontend URL
    const allowedOrigins = [config.FRONTEND_URL];

    // In development, also allow localhost with different ports
    if (config.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutes
});
