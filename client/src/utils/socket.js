import { io } from 'socket.io-client';

// Get the base URL (e.g., http://localhost:3000)
// This is the correct base URL for the WebSocket connection
const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : 'http://localhost:3000'; 

const socket = io(API_BASE_URL, {
    // Explicitly set the path to ensure the client connects correctly
    // This often fixes 404 errors when Express routing interferes
    path: '/socket.io/', 
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