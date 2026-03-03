export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5001',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
