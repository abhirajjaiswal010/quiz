import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Determine socket URL based on environment
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    console.log(`🔌 Connecting to Socket.io via Proxy at: ${socketUrl}`);
    
    const newSocket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10, // Increased for stability
      timeout: 20000 // Increased timeout
    });

    newSocket.on('connect', () => console.log('✅ Socket Connected:', newSocket.id));
    newSocket.on('connect_error', (err) => console.error('❌ Socket Connection Error:', err.message));
    newSocket.on('disconnect', (reason) => console.warn('⚠️ Socket Disconnected:', reason));

    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing Socket.io connection');
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
