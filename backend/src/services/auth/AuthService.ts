import { User, Gender } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../../repositories/UserRepository';
import { EmailService } from '../email/EmailService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../config/jwt';
import { hashPassword, comparePassword } from '../../utils/passwordHash';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: Gender;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: Omit<User, 'passwordHash' | 'refreshToken'>;
  tokens: AuthTokens;
}

export class AuthService {
  private userRepository: UserRepository;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName, dateOfBirth, gender } = input;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(email, emailVerificationToken);
    } catch (error) {
      logger.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    logger.info(`User registered: ${email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    logger.info(`User logged in: ${email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string; user: Omit<User, 'passwordHash' | 'refreshToken'> }> {
    // Find user by verification token
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // Verify email
    const verifiedUser = await this.userRepository.verifyEmail(user.id);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(verifiedUser.email, verifiedUser.firstName);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }

    logger.info(`Email verified: ${user.email}`);

    return {
      message: 'Email successfully verified',
      user: this.sanitizeUser(verifiedUser),
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestError('Email already verified');
    }

    // Generate new verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userRepository.update(user.id, {
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(email, emailVerificationToken);

    logger.info(`Verification email resent: ${email}`);

    return { message: 'Verification email sent' };
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Check if refresh token matches
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Save new refresh token
      await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

      logger.info(`Tokens refreshed: ${user.email}`);

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(userId: number): Promise<{ message: string }> {
    await this.userRepository.updateRefreshToken(userId, null);
    logger.info(`User logged out: ${userId}`);
    return { message: 'Successfully logged out' };
  }

  /**
   * Get user by ID (for /auth/me endpoint)
   */
  async getUserById(userId: number): Promise<Omit<User, 'passwordHash' | 'refreshToken'>> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(user: User): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: User): Omit<User, 'passwordHash' | 'refreshToken'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
