import { Router } from 'express';
import { TrainerController } from '../controllers/TrainerController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { registerTrainerSchema, updateTrainerSchema } from '../validators/trainer.validator';

const router = Router();
const trainerController = new TrainerController();

// Публичные маршруты (список тренеров, просмотр по ID)
router.get('/', authenticate, trainerController.getAll);
router.get('/me', authenticate, trainerController.getMyProfile);
router.get('/:id', authenticate, trainerController.getById);

// Защищенные маршруты
router.post('/register', authenticate, validate(registerTrainerSchema), trainerController.register);
router.put('/me', authenticate, validate(updateTrainerSchema), trainerController.updateProfile);

export default router;
