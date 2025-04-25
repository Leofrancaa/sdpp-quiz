'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client'; // Só importa o io, sem complicação

export const useSocket = () => {
    const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null); // <- Aqui está a chave
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const newSocket = io('http://localhost:3001'); // conecta no backend
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Conectado ao servidor de quiz!');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Desconectado do servidor.');
            setConnected(false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return { socket, connected };
};
