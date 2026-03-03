import { axiosInstance } from '@shared/lib/axios/axiosInstance';
import type { ConversationPreview, MessagesListResponse } from '../model/types';

const BASE = '/messages';

export const chatApi = {
  async getConversations(): Promise<ConversationPreview[]> {
    const { data } = await axiosInstance.get(`${BASE}/conversations`);
    return data.conversations;
  },

  async getConversation(userId: number, page?: number): Promise<MessagesListResponse> {
    const { data } = await axiosInstance.get(`${BASE}/conversations/${userId}`, {
      params: { page, limit: 50 },
    });
    return data;
  },

  async sendMessage(receiverId: number, content: string): Promise<void> {
    await axiosInstance.post(BASE, { receiverId, content });
  },

  async markAsRead(userId: number): Promise<void> {
    await axiosInstance.patch(`${BASE}/read/${userId}`);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await axiosInstance.get(`${BASE}/unread-count`);
    return data.unreadCount;
  },
};
