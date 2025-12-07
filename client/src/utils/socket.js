import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : window.location.origin;

const socket = io(API_BASE_URL, {
    // Explicitly set the path to ensure it hits the Vercel route defined in vercel.json
    path: '/socket.io/', 
    
    // CRITICAL for Vercel stability: Force connection via WebSocket first 
    // and prevent previous failed connection attempts from interfering.
    transports: ['websocket', 'polling'],
    forceNew: true // Ensures a clean connection attempt every time
});

socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);
});

socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO Connection Error:', err.message);
});

export default socket;
