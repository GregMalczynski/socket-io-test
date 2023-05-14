const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const port = 3001;

app.use(cors());

const server = http.createServer(app);

const io = new Server( server, {
    cors: {
        origin: "http://127.0.0.1:5173",
        methods: ["GET", "POST"],
    },
})

io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`)

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data)
    })
})

server.listen( port, () => {
    console.log(`Server running at port ${port}`)
})