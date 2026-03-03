import { UserRepository } from '../../repositories/UserRepository';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../../utils/errorHandler';
import { comparePassword, hashPassword } from '../../utils/passwordHash';
import { Prisma, User, Gender } from '@prisma/client';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  height?: number | string | null;
  weight?: number | string | null;
  phone?: string | null;
}

interface UserProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string | null;
  height: string | null;
  weight: string | null;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Получить профиль пользователя по ID
   */
  async getProfile(userId: number): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Обновить профиль пользователя
   */
  async updateProfile(userId: number, data: UpdateProfileData): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }
    if (data.gender !== undefined) updateData.gender = data.gender as Gender;
    if (data.height !== undefined) {
      updateData.height = data.height !== null ? String(data.height) : null;
    }
    if (data.weight !== undefined) {
      updateData.weight = data.weight !== null ? String(data.weight) : null;
    }
    if (data.phone !== undefined) updateData.phone = data.phone;

    const updatedUser = await this.userRepository.update(userId, updateData);

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Смена пароля
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('New password must be different from the current one');
    }

    const newPasswordHash = await hashPassword(newPassword);
    await this.userRepository.update(userId, { passwordHash: newPasswordHash });

    return { message: 'Password changed successfully' };
  }

  /**
   * Обновить аватар
   */
  async updateAvatar(userId: number, avatarUrl: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, { avatarUrl });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Удалить аватар
   */
  async deleteAvatar(userId: number): Promise<UserProfileResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepository.update(userId, { avatarUrl: null });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Деактивировать аккаунт
   */
  async deactivateAccount(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.update(userId, { isActive: false });

    return { message: 'Account deactivated successfully' };
  }

  /**
   * Убрать чувствительные поля из ответа
   */
  private sanitizeUser(user: User): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      height: user.height?.toString() ?? null,
      weight: user.weight?.toString() ?? null,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
