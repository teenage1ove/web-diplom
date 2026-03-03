import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@shared/config';

// Создаем instance axios с базовой конфигурацией
export const axiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Включаем отправку cookies
});

// Response interceptor - обработка ошибок и refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Если 401 и это не retry и не auth endpoints
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/me')
    ) {
      if (isRefreshing) {
        // Если уже идет refresh, ждем его завершения
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Пытаемся обновить токены (refreshToken автоматически отправится в cookies)
        await axiosInstance.post('/auth/refresh');

        processQueue(null);
        isRefreshing = false;

        // Повторяем оригинальный запрос
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        isRefreshing = false;

        // Refresh failed - редирект на login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
