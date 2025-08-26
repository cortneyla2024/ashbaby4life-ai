const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active rooms and users
const rooms = new Map();
const users = new Map();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', (data) => {
    const { roomId, userId } = data;
    
    socket.join(roomId);
    
    // Store user info
    users.set(socket.id, { userId, roomId });
    
    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-joined', { userId });
    
    // Send list of existing users to the new user
    const existingUsers = Array.from(rooms.get(roomId))
      .filter(id => id !== socket.id)
      .map(id => users.get(id)?.userId)
      .filter(Boolean);
    
    socket.emit('room-users', existingUsers);
    
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Handle WebRTC signaling
  socket.on('offer', (data) => {
    const { to, offer } = data;
    const targetSocket = findSocketByUserId(to);
    if (targetSocket) {
      targetSocket.emit('offer', { from: users.get(socket.id)?.userId, offer });
    }
  });

  socket.on('answer', (data) => {
    const { to, answer } = data;
    const targetSocket = findSocketByUserId(to);
    if (targetSocket) {
      targetSocket.emit('answer', { from: users.get(socket.id)?.userId, answer });
    }
  });

  socket.on('ice-candidate', (data) => {
    const { to, candidate } = data;
    const targetSocket = findSocketByUserId(to);
    if (targetSocket) {
      targetSocket.emit('ice-candidate', { from: users.get(socket.id)?.userId, candidate });
    }
  });

  // Handle AI messages
  socket.on('ai-message', (message) => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      socket.to(userInfo.roomId).emit('ai-message', {
        ...message,
        from: 'ai',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle user messages
  socket.on('user-message', (message) => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      socket.to(userInfo.roomId).emit('user-message', {
        ...message,
        from: userInfo.userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      const { roomId, userId } = userInfo;
      
      // Remove user from room
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }
      
      // Notify other users
      socket.to(roomId).emit('user-left', { userId });
      
      console.log(`User ${userId} left room ${roomId}`);
    }
    
    users.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Helper function to find socket by user ID
function findSocketByUserId(userId) {
  for (const [socketId, userInfo] of users.entries()) {
    if (userInfo.userId === userId) {
      return io.sockets.sockets.get(socketId);
    }
  }
  return null;
}

// API endpoints for room management
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    const roomUsers = Array.from(room).map(socketId => users.get(socketId)).filter(Boolean);
    res.json({
      roomId,
      userCount: roomUsers.length,
      users: roomUsers.map(u => u.userId)
    });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([roomId, socketIds]) => ({
    roomId,
    userCount: socketIds.size,
    users: Array.from(socketIds).map(socketId => users.get(socketId)?.userId).filter(Boolean)
  }));
  
  res.json(roomList);
});

// Cleanup function to remove stale rooms
setInterval(() => {
  for (const [roomId, socketIds] of rooms.entries()) {
    const activeSockets = Array.from(socketIds).filter(socketId => 
      io.sockets.sockets.has(socketId)
    );
    
    if (activeSockets.length === 0) {
      rooms.delete(roomId);
      console.log(`Cleaned up empty room: ${roomId}`);
    } else {
      // Update room with only active sockets
      rooms.set(roomId, new Set(activeSockets));
    }
  }
}, 30000); // Clean up every 30 seconds

const PORT = process.env.SIGNALING_SERVER_PORT || 3001;

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
