const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store online users: Map<socket.id, username>
let onlineUsers = new Map();

// Socket.io logic
io.on('connection', (socket) => {
    console.log(`🔌 New user connected: ${socket.id}`);

    // Handle user joining
    socket.on('join', (username) => {
        onlineUsers.set(socket.id, username);
        console.log(`✅ ${username} joined the chat.`);
        io.emit('update-user-list', Array.from(onlineUsers.values()));
    });

    // Handle text message
    socket.on('message', (msg) => {
        console.log('📩 Message received:', msg);
        socket.broadcast.emit('message', msg); // to all except sender
    });

  // Handle image upload
socket.on('image', (data) => {
    console.log('🖼️ Image received from:', data.user);
    io.emit('image', data); // send both image + user to everyone
});


  // ✅ Video message
  socket.on("video", (videoData) => {
    console.log('🎥 Video received');
    io.emit("video", videoData); // send to all including sender
  });




    // Handle user disconnect
    socket.on('disconnect', () => {
        const username = onlineUsers.get(socket.id);
        console.log(`❌ ${username || 'A user'} disconnected`);
        onlineUsers.delete(socket.id);
        io.emit('update-user-list', Array.from(onlineUsers.values()));
    });
});

// Start server
http.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
