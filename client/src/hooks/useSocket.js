import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        // token: localStorage.getItem('token') 
      }
    });

    socketInstance.on('connect', () => {
      console.log('Connected:', socketInstance.id);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socketInstance.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  const emit = useCallback((event, data, callback) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected');
      if (callback) callback({ success: false, error: 'Not connected' });
      return;
    }
    socket.emit(event, data, callback);
  }, [socket, isConnected]);

  const on = useCallback((event, handler) => {
    if (!socket) return;
    socket.on(event, handler);
  }, [socket]);

  const off = useCallback((event, handler) => {
    if (!socket) return;
    socket.off(event, handler);
  }, [socket]);

  return { socket, isConnected, error, emit, on, off };
};