import { Router } from 'express';
import { NutritionController } from '../controllers/NutritionController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createNutritionPlanSchema,
  updateNutritionPlanSchema,
  createMealSchema,
  updateMealSchema,
} from '../validators/nutrition.validator';

const router = Router();
const nutritionController = new NutritionController();

// All routes require authentication
router.use(authenticate);

// Nutrition Plans
router.get('/plans/stats', nutritionController.getStats);
router.get('/plans', nutritionController.getPlans);
router.get('/plans/:id', nutritionController.getPlanById);
router.post('/plans', validate(createNutritionPlanSchema), nutritionController.createPlan);
router.put('/plans/:id', validate(updateNutritionPlanSchema), nutritionController.updatePlan);
router.delete('/plans/:id', nutritionController.deletePlan);

// Daily summary
router.get('/daily-summary', nutritionController.getDailySummary);

// Meals
router.get('/meals', nutritionController.getMeals);
router.post('/meals', validate(createMealSchema), nutritionController.createMeal);
router.put('/meals/:id', validate(updateMealSchema), nutritionController.updateMeal);
router.delete('/meals/:id', nutritionController.deleteMeal);

export default router;
