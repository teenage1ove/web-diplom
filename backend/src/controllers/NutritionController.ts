import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NutritionService } from '../services/fitness/NutritionService';

export class NutritionController {
  private nutritionService: NutritionService;

  constructor() {
    this.nutritionService = new NutritionService();
  }

  // ============ NUTRITION PLANS ============

  getPlans = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { page, limit, isActive, goalId } = req.query;

      const result = await this.nutritionService.getUserPlans(req.user.userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        goalId: goalId ? parseInt(goalId as string) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPlanById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        res.status(400).json({ error: 'Invalid plan ID' });
        return;
      }

      const plan = await this.nutritionService.getPlanById(planId, req.user.userId);
      res.status(200).json({ plan });
    } catch (error) {
      next(error);
    }
  };

  createPlan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const plan = await this.nutritionService.createPlan(req.user.userId, req.body);
      res.status(201).json({ plan, message: 'Nutrition plan created successfully' });
    } catch (error) {
      next(error);
    }
  };

  updatePlan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        res.status(400).json({ error: 'Invalid plan ID' });
        return;
      }

      const plan = await this.nutritionService.updatePlan(planId, req.user.userId, req.body);
      res.status(200).json({ plan, message: 'Nutrition plan updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  deletePlan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        res.status(400).json({ error: 'Invalid plan ID' });
        return;
      }

      await this.nutritionService.deletePlan(planId, req.user.userId);
      res.status(200).json({ message: 'Nutrition plan deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await this.nutritionService.getStats(req.user.userId);
      res.status(200).json({ stats });
    } catch (error) {
      next(error);
    }
  };

  getDailySummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const summary = await this.nutritionService.getDailySummary(req.user.userId, date);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  // ============ MEALS ============

  getMeals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { page, limit, nutritionPlanId, mealType, dateFrom, dateTo } = req.query;

      const result = await this.nutritionService.getUserMeals(req.user.userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        nutritionPlanId: nutritionPlanId ? parseInt(nutritionPlanId as string) : undefined,
        mealType: mealType as string | undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
      } as Parameters<NutritionService['getUserMeals']>[1]);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createMeal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const meal = await this.nutritionService.createMeal(req.user.userId, req.body);
      res.status(201).json({ meal, message: 'Meal added successfully' });
    } catch (error) {
      next(error);
    }
  };

  updateMeal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const mealId = parseInt(req.params.id);
      if (isNaN(mealId)) {
        res.status(400).json({ error: 'Invalid meal ID' });
        return;
      }

      const meal = await this.nutritionService.updateMeal(mealId, req.user.userId, req.body);
      res.status(200).json({ meal, message: 'Meal updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  deleteMeal = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const mealId = parseInt(req.params.id);
      if (isNaN(mealId)) {
        res.status(400).json({ error: 'Invalid meal ID' });
        return;
      }

      await this.nutritionService.deleteMeal(mealId, req.user.userId);
      res.status(200).json({ message: 'Meal deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
