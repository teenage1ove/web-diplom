import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * GET /api/v1/users/profile
   * Получить профиль текущего пользователя
   */
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profile = await this.userService.getProfile(req.user.userId);

      res.status(200).json({ user: profile });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/users/profile
   * Обновить профиль текущего пользователя
   */
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profile = await this.userService.updateProfile(req.user.userId, req.body);

      res.status(200).json({
        message: 'Profile updated successfully',
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/users/change-password
   * Смена пароля
   */
  changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.userService.changePassword(
        req.user.userId,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/users/avatar
   * Обновить аватар (URL)
   */
  updateAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { avatarUrl } = req.body;
      const profile = await this.userService.updateAvatar(req.user.userId, avatarUrl);

      res.status(200).json({
        message: 'Avatar updated successfully',
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/users/avatar
   * Удалить аватар
   */
  deleteAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profile = await this.userService.deleteAvatar(req.user.userId);

      res.status(200).json({
        message: 'Avatar removed successfully',
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/users/deactivate
   * Деактивировать аккаунт
   */
  deactivateAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.userService.deactivateAccount(req.user.userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
