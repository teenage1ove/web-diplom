import { axiosInstance } from '@shared/lib/axios';
import type { User, AuthResponse, AuthTokens } from '@shared/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

class AuthApi {
  /**
   * Регистрация нового пользователя
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Вход пользователя
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  /**
   * Получение текущего пользователя (проверка авторизации)
   */
  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<{ user: User }>('/auth/me');
    return response.data.user;
  }

  /**
   * Обновление токенов
   */
  async refreshTokens(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      '/auth/refresh',
      data
    );
    return response.data;
  }

  /**
   * Выход пользователя - очищает cookies на backend
   */
  async logout(): Promise<void> {
    try {
      // Вызываем logout на backend для очистки httpOnly cookies
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Игнорируем ошибки logout
      console.error('Logout error:', error);
    }
  }

  /**
   * Запрос на подтверждение email (resend verification)
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      '/auth/resend-verification',
      { email }
    );
    return response.data;
  }

  /**
   * Подтверждение email по токену
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      '/auth/verify-email',
      { token }
    );
    return response.data;
  }
}

export const authApi = new AuthApi();
