import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@shared/config/env';
import type { ChatMessage } from './types';

interface UseSocketOptions {
  onNewMessage?: (message: ChatMessage) => void;
  onTypingStart?: (data: { userId: number }) => void;
  onTypingStop?: (data: { userId: number }) => void;
  onUserOnline?: (data: { userId: number }) => void;
  onUserOffline?: (data: { userId: number }) => void;
  onMessageRead?: (data: { readBy: number }) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(env.WS_URL, {
      withCredentials: true,
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('message:new', (message: ChatMessage) => {
      options.onNewMessage?.(message);
    });

    socket.on('typing:start', (data: { userId: number }) => {
      options.onTypingStart?.(data);
    });

    socket.on('typing:stop', (data: { userId: number }) => {
      options.onTypingStop?.(data);
    });

    socket.on('user:online', (data: { userId: number }) => {
      options.onUserOnline?.(data);
    });

    socket.on('user:offline', (data: { userId: number }) => {
      options.onUserOffline?.(data);
    });

    socket.on('message:read', (data: { readBy: number }) => {
      options.onMessageRead?.(data);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback((receiverId: number, content: string, consultationId?: number) => {
    socketRef.current?.emit('message:send', { receiverId, content, consultationId });
  }, []);

  const startTyping = useCallback((receiverId: number) => {
    socketRef.current?.emit('typing:start', { receiverId });
  }, []);

  const stopTyping = useCallback((receiverId: number) => {
    socketRef.current?.emit('typing:stop', { receiverId });
  }, []);

  const markAsRead = useCallback((senderId: number) => {
    socketRef.current?.emit('message:read', { senderId });
  }, []);

  return { sendMessage, startTyping, stopTyping, markAsRead };
}
