import { Router } from 'express';
import { WorkoutController } from '../controllers/WorkoutController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  completeWorkoutSchema,
} from '../validators/workout.validator';

const router = Router();
const workoutController = new WorkoutController();

// All routes require authentication
router.use(authenticate);

// Stats endpoint
router.get('/stats', workoutController.getWorkoutStats);

// CRUD endpoints
router.get('/', workoutController.getWorkouts);
router.get('/:id', workoutController.getWorkoutById);

router.post(
  '/',
  validate(createWorkoutSchema),
  workoutController.createWorkout
);

router.put(
  '/:id',
  validate(updateWorkoutSchema),
  workoutController.updateWorkout
);

router.patch(
  '/:id/complete',
  validate(completeWorkoutSchema),
  workoutController.completeWorkout
);

router.delete('/:id', workoutController.deleteWorkout);

export default router;
