import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Your account has been temporarily locked. Please try again in 15 minutes.',
      retryAfter: 900, // 15 minutes in seconds
    });
  },
});

// Rate limiter for AI endpoints
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 AI requests per hour
  message: 'AI request limit exceeded, please try again later.',
  handler: (_req, res) => {
    res.status(429).json({
      error: 'AI request limit exceeded',
      message: 'You have reached the maximum number of AI requests per hour.',
      retryAfter: 3600,
    });
  },
});

// Rate limiter for file uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: 'Too many uploads, please try again later.',
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'You have exceeded the upload limit. Please try again in 15 minutes.',
      retryAfter: 900,
    });
  },
});
