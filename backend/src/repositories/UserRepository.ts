import { prisma } from '../config/database';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by email verification token
   */
  async findByVerificationToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(), // Token not expired
        },
      },
    });
  }

  /**
   * Update user
   */
  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(id: number, refreshToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }
}
