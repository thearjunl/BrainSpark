import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      socketRef.current = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
        auth: { token },
        autoConnect: true,
        transports: ['websocket'],
      });
    } else if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 