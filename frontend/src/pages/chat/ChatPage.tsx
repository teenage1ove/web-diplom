import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { chatApi, useSocket } from '@features/chat';
import { useAuthStore } from '@features/auth';
import type { ChatMessage, ConversationPreview } from '@features/chat';

const ChatPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [newChatPartner, setNewChatPartner] = useState<{ id: number; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Read ?userId from URL to start a new conversation
  useEffect(() => {
    const targetUserId = searchParams.get('userId');
    const targetName = searchParams.get('name');
    if (targetUserId) {
      const id = parseInt(targetUserId);
      setSelectedUserId(id);
      if (targetName) {
        setNewChatPartner({ id, name: decodeURIComponent(targetName) });
      }
      // Clean URL params
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    // Clear newChatPartner once we get messages
    setNewChatPartner(null);
  }, [queryClient]);

  const handleTypingStart = useCallback((data: { userId: number }) => {
    setTypingUsers((prev) => new Set(prev).add(data.userId));
  }, []);

  const handleTypingStop = useCallback((data: { userId: number }) => {
    setTypingUsers((prev) => {
      const next = new Set(prev);
      next.delete(data.userId);
      return next;
    });
  }, []);

  const { sendMessage: socketSend, startTyping, stopTyping, markAsRead } = useSocket({
    onNewMessage: handleNewMessage,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
  });

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
  });

  // Load conversation messages
  useEffect(() => {
    if (!selectedUserId) return;
    chatApi.getConversation(selectedUserId).then((data) => {
      setMessages(data.messages);
      markAsRead(selectedUserId);
    }).catch(() => {
      // New conversation - no messages yet
      setMessages([]);
    });
  }, [selectedUserId, markAsRead]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !selectedUserId) return;
    socketSend(selectedUserId, messageText.trim());
    setMessageText('');
    stopTyping(selectedUserId);
  };

  const handleInputChange = (value: string) => {
    setMessageText(value);
    if (!selectedUserId) return;

    if (value.trim()) {
      startTyping(selectedUserId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedUserId);
      }, 2000);
    } else {
      stopTyping(selectedUserId);
    }
  };

  // Find selected conversation from list or use newChatPartner
  const selectedConversation = conversations?.find(
    (c) => c.partner.id === selectedUserId
  );

  const partnerName = selectedConversation
    ? `${selectedConversation.partner.firstName} ${selectedConversation.partner.lastName}`
    : newChatPartner?.name || '';

  const partnerInitials = selectedConversation
    ? `${selectedConversation.partner.firstName[0]}${selectedConversation.partner.lastName[0]}`
    : newChatPartner?.name?.split(' ').map(w => w[0]).join('') || '?';

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Чат</h1>

      <div className="flex h-[calc(100vh-200px)] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Conversations list */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700">Диалоги</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Show newChatPartner at top if not in conversations list */}
            {newChatPartner && !conversations?.find(c => c.partner.id === newChatPartner.id) && (
              <button
                onClick={() => setSelectedUserId(newChatPartner.id)}
                className={`w-full p-4 text-left border-b border-gray-100 transition-colors ${
                  selectedUserId === newChatPartner.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-600">
                    {newChatPartner.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{newChatPartner.name}</p>
                    <p className="text-xs text-green-600">Новый диалог</p>
                  </div>
                </div>
              </button>
            )}

            {!conversations || conversations.length === 0 ? (
              !newChatPartner && (
                <div className="p-4 text-center text-sm text-gray-400">
                  Нет диалогов. Начните общение через консультации.
                </div>
              )
            ) : (
              conversations.map((conv: ConversationPreview) => (
                <button
                  key={conv.partner.id}
                  onClick={() => {
                    setSelectedUserId(conv.partner.id);
                    setNewChatPartner(null);
                  }}
                  className={`w-full p-4 text-left border-b border-gray-100 transition-colors ${
                    selectedUserId === conv.partner.id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                      {conv.partner.firstName[0]}{conv.partner.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.partner.firstName} {conv.partner.lastName}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatDate(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage.senderId === user?.id ? 'Вы: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!selectedUserId ? (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Выберите диалог или начните чат</p>
                <p className="text-sm mt-1">через страницу консультации</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                    {partnerInitials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{partnerName}</p>
                    {typingUsers.has(selectedUserId) && (
                      <p className="text-xs text-green-600">печатает...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-gray-400">
                      <p className="text-sm">Нет сообщений</p>
                      <p className="text-xs mt-1">Напишите первое сообщение!</p>
                    </div>
                  </div>
                )}
                {messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`mt-1 text-xs ${
                            isOwn ? 'text-blue-200' : 'text-gray-400'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                          {isOwn && msg.isRead && ' ✓✓'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Введите сообщение..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
