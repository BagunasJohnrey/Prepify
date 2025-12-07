import { io } from 'socket.io-client';

// Determine the base URL dynamically:
const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : window.location.origin;

const socket = io(API_BASE_URL, {
    path: '/socket.io/', 
    
    // CRITICAL FIX: Only use HTTP Polling for maximum stability on Vercel/Serverless.
    transports: ['polling'], 
    
    forceNew: true,
    withCredentials: false,
    
    // Optional resilience settings
    timeout: 10000, 
    reconnectionAttempts: 5 
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
