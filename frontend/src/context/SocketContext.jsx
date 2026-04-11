import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Determine socket URL based on environment
    // PRODUCTION-READY URL DETECTION
    let socketUrl = import.meta.env.VITE_SOCKET_URL;

    if (!socketUrl) {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
         // If VITE_API_URL is "https://domain.com/api", derive "https://domain.com"
         socketUrl = apiUrl.replace(/\/api\/?$/, '');
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
         socketUrl = 'http://localhost:5000';
      } else {
         socketUrl = window.location.origin;
      }
    }
    
    console.log(`🔌 Socket connecting to: ${socketUrl}`);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
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
