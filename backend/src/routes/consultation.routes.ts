import { Router } from 'express';
import { ConsultationController } from '../controllers/ConsultationController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createConsultationSchema,
  updateConsultationSchema,
} from '../validators/consultation.validator';

const router = Router();
const consultationController = new ConsultationController();

router.use(authenticate);

router.get('/stats', consultationController.getStats);
router.get('/', consultationController.getConsultations);
router.get('/:id', consultationController.getConsultationById);
router.post('/', validate(createConsultationSchema), consultationController.createConsultation);
router.put('/:id', validate(updateConsultationSchema), consultationController.updateConsultation);
router.patch('/:id/cancel', consultationController.cancelConsultation);

export default router;
