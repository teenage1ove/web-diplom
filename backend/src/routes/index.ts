import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import trainerRoutes from './trainer.routes';
import goalRoutes from './goal.routes';
import exerciseRoutes from './exercise.routes';
import workoutRoutes from './workout.routes';
import nutritionRoutes from './nutrition.routes';
import consultationRoutes from './consultation.routes';
import messageRoutes from './message.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trainers', trainerRoutes);
router.use('/goals', goalRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workouts', workoutRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/consultations', consultationRoutes);
router.use('/messages', messageRoutes);

router.use('/ai', aiRoutes);

export default router;
