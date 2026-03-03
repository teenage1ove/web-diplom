import { MessageType } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

interface SendMessageData {
  receiverId: number;
  consultationId?: number;
  content: string;
  messageType?: MessageType;
}

interface GetMessagesFilters {
  page?: number;
  limit?: number;
}

export class ChatService {
  /**
   * Send a message
   */
  async sendMessage(senderId: number, data: SendMessageData) {
    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: data.receiverId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!receiver) {
      throw new NotFoundError('Receiver not found');
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: data.receiverId,
        consultationId: data.consultationId || null,
        content: data.content,
        messageType: data.messageType || 'text',
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    logger.info(`Message sent from ${senderId} to ${data.receiverId}`);
    return message;
  }

  /**
   * Get conversation between two users
   */
  async getConversation(userId: number, otherUserId: number, filters: GetMessagesFilters) {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    return {
      messages: messages.reverse(),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get list of conversations (unique chat partners)
   */
  async getConversationsList(userId: number) {
    // Get all unique conversation partners
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const partnerIds = new Set([
      ...sentMessages.map((m) => m.receiverId),
      ...receivedMessages.map((m) => m.senderId),
    ]);

    const conversations = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        const [lastMessage, unreadCount, partner] = await Promise.all([
          prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.message.count({
            where: {
              senderId: partnerId,
              receiverId: userId,
              isRead: false,
            },
          }),
          prisma.user.findUnique({
            where: { id: partnerId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          }),
        ]);

        return {
          partner,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message date
    conversations.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt?.getTime() || 0;
      const dateB = b.lastMessage?.createdAt?.getTime() || 0;
      return dateB - dateA;
    });

    return conversations;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(userId: number, senderId: number) {
    const result = await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    return { markedAsRead: result.count };
  }

  /**
   * Get unread messages count
   */
  async getUnreadCount(userId: number) {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }
}
