import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Извлекает сообщение об ошибке из ответа API или ошибки Axios
 */
export function getErrorMessage(error: unknown, fallback = 'Произошла ошибка'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message || data?.error || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
