import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinOrderRoom: (orderId: string) => void;
  joinTankerRoom: (tankerId: string) => void;
  latestAlert: any | null;
  dismissAlert: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestAlert, setLatestAlert] = useState<any | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Determine socket server URL (same origin or port 5000 in dev)
    const socketUrl = window.location.port === '5173' 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      console.log('⚡ Connected to FuelTrack WebSocket Server');
      setIsConnected(true);
      if (user?.role) {
        s.emit('join:role', user.role);
      }
    });

    s.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket Server');
      setIsConnected(false);
    });

    s.on('safety:alert', (alert) => {
      console.warn('🚨 Safety SOS Alert received:', alert);
      setLatestAlert(alert);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected && user?.role) {
      socket.emit('join:role', user.role);
    }
  }, [user?.role, isConnected, socket]);

  const joinOrderRoom = (orderId: string) => {
    if (socket && isConnected) {
      socket.emit('join:order', orderId);
    }
  };

  const joinTankerRoom = (tankerId: string) => {
    if (socket && isConnected) {
      socket.emit('join:tanker', tankerId);
    }
  };

  const dismissAlert = () => {
    setLatestAlert(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOrderRoom,
        joinTankerRoom,
        latestAlert,
        dismissAlert
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
