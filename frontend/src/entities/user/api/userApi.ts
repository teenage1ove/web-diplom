import { axiosInstance } from '@shared/lib/axios';
import type { User } from '@shared/types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  phone?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TrainerProfile {
  id: number;
  userId: number;
  specialization: string[];
  bio: string;
  experienceYears: number;
  certifications: string[];
  hourlyRate: string | null;
  rating: string;
  totalReviews: number;
  availability: Record<string, string[]> | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface RegisterTrainerRequest {
  specialization: string[];
  bio: string;
  experienceYears: number;
  certifications?: string[];
  hourlyRate?: number | null;
  availability?: Record<string, string[]> | null;
}

class UserApi {
  async getProfile(): Promise<{ user: User }> {
    const response = await axiosInstance.get<{ user: User }>('/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string; user: User }> {
    const response = await axiosInstance.put<{ message: string; user: User }>(
      '/users/profile',
      data
    );
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await axiosInstance.put<{ message: string }>(
      '/users/change-password',
      data
    );
    return response.data;
  }

  async updateAvatar(avatarUrl: string): Promise<{ message: string; user: User }> {
    const response = await axiosInstance.put<{ message: string; user: User }>(
      '/users/avatar',
      { avatarUrl }
    );
    return response.data;
  }

  async deleteAvatar(): Promise<{ message: string; user: User }> {
    const response = await axiosInstance.delete<{ message: string; user: User }>(
      '/users/avatar'
    );
    return response.data;
  }

  // Trainer endpoints
  async registerAsTrainer(data: RegisterTrainerRequest): Promise<{ trainer: TrainerProfile }> {
    const response = await axiosInstance.post<{ trainer: TrainerProfile }>(
      '/trainers/register',
      data
    );
    return response.data;
  }

  async getMyTrainerProfile(): Promise<{ trainer: TrainerProfile }> {
    const response = await axiosInstance.get<{ trainer: TrainerProfile }>('/trainers/me');
    return response.data;
  }

  async getTrainers(params?: {
    page?: number;
    limit?: number;
    specialization?: string;
  }): Promise<{ trainers: TrainerProfile[]; total: number; page: number; limit: number }> {
    const response = await axiosInstance.get('/trainers', { params });
    return response.data;
  }
}

export const userApi = new UserApi();
