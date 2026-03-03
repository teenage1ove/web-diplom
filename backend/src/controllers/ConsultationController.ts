import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ConsultationService } from '../services/fitness/ConsultationService';

export class ConsultationController {
  private consultationService: ConsultationService;

  constructor() {
    this.consultationService = new ConsultationService();
  }

  getConsultations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const { page, limit, status, trainerId, dateFrom, dateTo } = req.query;
      const result = await this.consultationService.getUserConsultations(req.user.userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string | undefined,
        trainerId: trainerId ? parseInt(trainerId as string) : undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined,
      } as Parameters<ConsultationService['getUserConsultations']>[1]);

      res.status(200).json(result);
    } catch (error) { next(error); }
  };

  getConsultationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

      const consultation = await this.consultationService.getConsultationById(id, req.user.userId);
      res.status(200).json({ consultation });
    } catch (error) { next(error); }
  };

  createConsultation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const consultation = await this.consultationService.createConsultation(req.user.userId, req.body);
      res.status(201).json({ consultation, message: 'Consultation booked successfully' });
    } catch (error) { next(error); }
  };

  updateConsultation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

      const consultation = await this.consultationService.updateConsultation(id, req.user.userId, req.body);
      res.status(200).json({ consultation, message: 'Consultation updated successfully' });
    } catch (error) { next(error); }
  };

  cancelConsultation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

      const consultation = await this.consultationService.cancelConsultation(id, req.user.userId);
      res.status(200).json({ consultation, message: 'Consultation cancelled' });
    } catch (error) { next(error); }
  };

  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const stats = await this.consultationService.getStats(req.user.userId);
      res.status(200).json({ stats });
    } catch (error) { next(error); }
  };
}
