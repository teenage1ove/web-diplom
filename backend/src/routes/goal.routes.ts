import { Router } from 'express';
import { GoalController } from '../controllers/GoalController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createGoalSchema,
  updateGoalSchema,
  updateProgressSchema,
  getGoalByIdSchema,
  getGoalsQuerySchema,
} from '../validators/goal.validator';

const router = Router();
const goalController = new GoalController();

// All routes require authentication
router.use(authenticate);

// CRUD
router.post('/', validate(createGoalSchema), goalController.createGoal);
router.get('/', validate(getGoalsQuerySchema), goalController.getGoals);
router.get('/stats', goalController.getGoalStats);
router.get('/:id', validate(getGoalByIdSchema), goalController.getGoalById);
router.put('/:id', validate(updateGoalSchema), goalController.updateGoal);
router.patch('/:id/progress', validate(updateProgressSchema), goalController.updateProgress);
router.delete('/:id', validate(getGoalByIdSchema), goalController.deleteGoal);

export default router;
