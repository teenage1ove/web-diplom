export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  consultationId: number | null;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  receiver?: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface ChatPartner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

export interface ConversationPreview {
  partner: ChatPartner;
  lastMessage: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
  } | null;
  unreadCount: number;
}

export interface MessagesListResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
