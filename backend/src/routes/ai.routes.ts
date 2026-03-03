import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const aiController = new AIController();

router.use(authenticate);

router.post('/recommend', aiController.generateRecommendation);
router.get('/recommendations', aiController.getRecommendations);
router.patch('/recommendations/:id/apply', aiController.applyRecommendation);
router.patch('/recommendations/:id/feedback', aiController.feedbackRecommendation);

export default router;
