import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useReactiveVar } from '@apollo/client/react';
import { socketVar, userVar } from '@/apollo/store';
import { getJwtToken } from '@/libs/auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3007';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const user = useReactiveVar(userVar);
  const socket = useReactiveVar(socketVar);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (socketRef.current?.connected) return;

    const token = getJwtToken();

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socketRef.current = newSocket;
    socketVar(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socketVar(null);
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && user) {
      const token = getJwtToken();
      if (token) {
        socketRef.current.auth = { token };
        if (!socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
    }
  }, [user]);

  return socket;
};

export default useSocket;
