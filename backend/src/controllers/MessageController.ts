import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ChatService } from '../services/chat/ChatService';

export class MessageController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  getConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const conversations = await this.chatService.getConversationsList(req.user.userId);
      res.status(200).json({ conversations });
    } catch (error) { next(error); }
  };

  getConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const otherUserId = parseInt(req.params.userId);
      if (isNaN(otherUserId)) { res.status(400).json({ error: 'Invalid user ID' }); return; }

      const { page, limit } = req.query;
      const result = await this.chatService.getConversation(req.user.userId, otherUserId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json(result);
    } catch (error) { next(error); }
  };

  sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const message = await this.chatService.sendMessage(req.user.userId, req.body);
      res.status(201).json({ message });
    } catch (error) { next(error); }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const senderId = parseInt(req.params.userId);
      if (isNaN(senderId)) { res.status(400).json({ error: 'Invalid user ID' }); return; }

      const result = await this.chatService.markAsRead(req.user.userId, senderId);
      res.status(200).json(result);
    } catch (error) { next(error); }
  };

  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

      const result = await this.chatService.getUnreadCount(req.user.userId);
      res.status(200).json(result);
    } catch (error) { next(error); }
  };
}
