import { Router } from 'express';
import { ExerciseController } from '../controllers/ExerciseController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createExerciseSchema,
  updateExerciseSchema,
} from '../validators/exercise.validator';

const router = Router();
const exerciseController = new ExerciseController();

// Meta endpoints (public - no auth needed for browsing)
router.get('/meta/categories', exerciseController.getCategories);
router.get('/meta/muscle-groups', exerciseController.getMuscleGroups);
router.get('/meta/equipment', exerciseController.getEquipment);

// Public browse (can see default exercises)
router.get('/', exerciseController.getExercises);
router.get('/:id', exerciseController.getExerciseById);

// Protected routes
router.post(
  '/',
  authenticate,
  validate(createExerciseSchema),
  exerciseController.createExercise
);

router.put(
  '/:id',
  authenticate,
  validate(updateExerciseSchema),
  exerciseController.updateExercise
);

router.delete('/:id', authenticate, exerciseController.deleteExercise);

export default router;
