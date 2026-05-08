import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {

    const [socket] = useState(() => io(process.env.REACT_APP_API_URL || 'http://localhost:5500', {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,

    }));

    useEffect(() => {
        return () => {
            // socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) throw new Error('useSocket must be used inside <SocketProvider>');
    return socket;
};
