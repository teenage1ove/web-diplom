import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const messageController = new MessageController();

router.use(authenticate);

router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/conversations/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);
router.patch('/read/:userId', messageController.markAsRead);

export default router;
