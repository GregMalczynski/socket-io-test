require('dotenv').config()
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'ok', connections: io.engine.clientsCount })
})

const server = http.createServer(app);

const io = new Server( server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://127.0.0.1:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
})

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("send_message", (data, callback) => {
        try {
            // Validation
            if (!data?.message || typeof data.message !== 'string') {
                throw new Error('Invalid message format');
            }
            
            if (data.message.length > 500) {
                throw new Error('Message too long');
            }

            const messageData = {
                message: data.message.trim(),
                sender: socket.id,
                timestamp: Date.now()
            };

            socket.broadcast.emit("receive_message", messageData);
            
            // Confirmation for sender
            if (callback) callback({ success: true });
            
        } catch (error) {
            console.error('Error:', error.message);
            if (callback) callback({ success: false, error: error.message });
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(`User disconnected: ${socket.id} - ${reason}`);
    });

    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});