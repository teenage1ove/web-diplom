import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TrainerService } from '../services/trainer/TrainerService';

export class TrainerController {
  private trainerService: TrainerService;

  constructor() {
    this.trainerService = new TrainerService();
  }

  /**
   * POST /api/v1/trainers/register
   * Зарегистрироваться как тренер
   */
  register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const trainer = await this.trainerService.registerAsTrainer(req.user.userId, req.body);

      res.status(201).json({
        message: 'Trainer profile created successfully',
        trainer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/trainers/me
   * Получить свой профиль тренера
   */
  getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const trainer = await this.trainerService.getTrainerByUserId(req.user.userId);

      res.status(200).json({ trainer });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/trainers/me
   * Обновить свой профиль тренера
   */
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const trainer = await this.trainerService.updateTrainerProfile(req.user.userId, req.body);

      res.status(200).json({
        message: 'Trainer profile updated successfully',
        trainer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/trainers/:id
   * Получить профиль тренера по ID
   */
  getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trainerId = parseInt(req.params.id, 10);
      const trainer = await this.trainerService.getTrainerById(trainerId);

      res.status(200).json({ trainer });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/trainers
   * Получить список тренеров
   */
  getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const specialization = req.query.specialization as string | undefined;
      const isVerified = req.query.isVerified === 'true' ? true : undefined;

      const result = await this.trainerService.getAllTrainers({
        page,
        limit,
        specialization,
        isVerified,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
