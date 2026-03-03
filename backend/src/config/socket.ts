import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './jwt';
import { logger } from '../utils/logger';
import { ChatService } from '../services/chat/ChatService';

const chatService = new ChatService();

// Online users: userId -> Set of socketIds
const onlineUsers = new Map<number, Set<string>>();

export function setupSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie
        ?.split(';')
        .find((c: string) => c.trim().startsWith('accessToken='))
        ?.split('=')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      (socket as Socket & { userId?: number }).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket & { userId?: number }) => {
    const userId = socket.userId;
    if (!userId) return;

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    logger.info(`User ${userId} connected (socket: ${socket.id})`);

    // Notify others that user is online
    socket.broadcast.emit('user:online', { userId });

    // Join personal room for direct messages
    socket.join(`user:${userId}`);

    // Handle sending messages
    socket.on('message:send', async (data: { receiverId: number; content: string; consultationId?: number }) => {
      try {
        const message = await chatService.sendMessage(userId, {
          receiverId: data.receiverId,
          content: data.content,
          consultationId: data.consultationId,
        });

        // Send to both sender and receiver
        io.to(`user:${userId}`).emit('message:new', message);
        io.to(`user:${data.receiverId}`).emit('message:new', message);
      } catch (error) {
        socket.emit('message:error', {
          error: error instanceof Error ? error.message : 'Failed to send message',
        });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data: { receiverId: number }) => {
      io.to(`user:${data.receiverId}`).emit('typing:start', { userId });
    });

    socket.on('typing:stop', (data: { receiverId: number }) => {
      io.to(`user:${data.receiverId}`).emit('typing:stop', { userId });
    });

    // Handle read receipts
    socket.on('message:read', async (data: { senderId: number }) => {
      try {
        await chatService.markAsRead(userId, data.senderId);
        io.to(`user:${data.senderId}`).emit('message:read', { readBy: userId });
      } catch {
        // Silent fail for read receipts
      }
    });

    // Get online users
    socket.on('users:online', () => {
      socket.emit('users:online', Array.from(onlineUsers.keys()));
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user:offline', { userId });
        }
      }
      logger.info(`User ${userId} disconnected (socket: ${socket.id})`);
    });
  });

  logger.info('🔌 Socket.io initialized');
  return io;
}
