import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai/AIService';
import { RecommendationType } from '@prisma/client';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  generateRecommendation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const { type, context } = req.body;
      if (!type || !['workout', 'nutrition', 'general'].includes(type)) {
        res.status(400).json({ error: 'Invalid recommendation type' });
        return;
      }

      const recommendation = await this.aiService.generateRecommendation(req.user.userId, {
        type,
        context,
      });

      res.status(201).json({ recommendation });
    } catch (error) { next(error); }
  };

  getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const { type, page, limit } = req.query;
      const result = await this.aiService.getRecommendations(
        req.user.userId,
        type as RecommendationType | undefined,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined,
      );

      res.status(200).json(result);
    } catch (error) { next(error); }
  };

  applyRecommendation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

      const recommendation = await this.aiService.applyRecommendation(id, req.user.userId);
      res.status(200).json({ recommendation });
    } catch (error) { next(error); }
  };

  feedbackRecommendation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

      const { feedback } = req.body;
      if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
        res.status(400).json({ error: 'Invalid feedback value' });
        return;
      }

      const recommendation = await this.aiService.feedbackRecommendation(id, req.user.userId, feedback);
      res.status(200).json({ recommendation });
    } catch (error) { next(error); }
  };
}
