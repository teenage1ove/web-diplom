import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GoalService } from '../services/fitness/GoalService';
import { GoalStatus, GoalType } from '@prisma/client';

export class GoalController {
  private goalService: GoalService;

  constructor() {
    this.goalService = new GoalService();
  }

  /**
   * POST /api/v1/goals
   */
  createGoal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const goal = await this.goalService.createGoal(req.user.userId, req.body);

      res.status(201).json({
        message: 'Goal created successfully',
        goal,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/goals
   */
  getGoals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.goalService.getUserGoals(req.user.userId, {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as GoalStatus | undefined,
        goalType: req.query.goalType as GoalType | undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/goals/stats
   */
  getGoalStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await this.goalService.getGoalStats(req.user.userId);

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/goals/:id
   */
  getGoalById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const goalId = parseInt(req.params.id, 10);
      const goal = await this.goalService.getGoalById(req.user.userId, goalId);

      res.status(200).json({ goal });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/goals/:id
   */
  updateGoal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const goalId = parseInt(req.params.id, 10);
      const goal = await this.goalService.updateGoal(req.user.userId, goalId, req.body);

      res.status(200).json({
        message: 'Goal updated successfully',
        goal,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/goals/:id/progress
   */
  updateProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const goalId = parseInt(req.params.id, 10);
      const goal = await this.goalService.updateProgress(
        req.user.userId,
        goalId,
        req.body.currentValue
      );

      res.status(200).json({
        message: 'Progress updated successfully',
        goal,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/goals/:id
   */
  deleteGoal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const goalId = parseInt(req.params.id, 10);
      const result = await this.goalService.deleteGoal(req.user.userId, goalId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
