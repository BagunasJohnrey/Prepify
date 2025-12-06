import { io } from 'socket.io-client';

// Determine the base URL dynamically:
// 1. If VITE_API_URL is set (usually only in development/local build), use it.
// 2. Otherwise (in Vercel/production), use the current window's origin (https://your-domain.vercel.app).
const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : window.location.origin; // Use the current deployment domain

const socket = io(API_BASE_URL, {
    // Explicitly set the path to ensure the client connects correctly
    path: '/socket.io/', 
    // Ensure transports includes websockets for Vercel stability
    transports: ['websocket', 'polling']
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
