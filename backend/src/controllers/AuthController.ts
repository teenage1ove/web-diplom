import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);

      // Set tokens as httpOnly cookies
      const cookieOptions = process.env.NODE_ENV === 'production'
        ? { httpOnly: true, secure: true, sameSite: 'strict' as const, path: '/' }
        : { httpOnly: true, path: '/' };

      res.cookie('accessToken', result.tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);

      // Set tokens as httpOnly cookies
      const cookieOptions = process.env.NODE_ENV === 'production'
        ? { httpOnly: true, secure: true, sameSite: 'strict' as const, path: '/' }
        : { httpOnly: true, path: '/' };

      res.cookie('accessToken', result.tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   * GET /api/v1/auth/verify-email/:token
   */
  verifyEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;
      const result = await this.authService.verifyEmail(token);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend verification email
   * POST /api/v1/auth/resend-verification
   */
  resendVerification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.resendVerificationEmail(req.body.email);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh tokens
   * POST /api/v1/auth/refresh
   */
  refreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token not found' });
        return;
      }

      const tokens = await this.authService.refreshTokens(refreshToken);

      // Set new tokens as httpOnly cookies
      const cookieOptions = process.env.NODE_ENV === 'production'
        ? { httpOnly: true, secure: true, sameSite: 'strict' as const }
        : { httpOnly: true };

      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: 'Tokens refreshed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.authService.logout(req.user.userId);

      // Clear cookies (must match the path used when setting them)
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Fetch full user data from database
      const fullUser = await this.authService.getUserById(req.user.userId);

      res.status(200).json({
        user: fullUser,
      });
    } catch (error) {
      next(error);
    }
  };
}
