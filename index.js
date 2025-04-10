const express = require('express');
const { Server } = require("socket.io");

const app = express();
const server = app.listen(3000, () => {
  console.log("Signaling server running on http://localhost:3000");
});

// Serve static files (like your HTML file)
app.use(express.static('public'));  // assuming your HTML file is in a 'public' folder

const io = new Server(server, {
  cors: {
    origin: "*",  // Allow connections from any origin
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,  // Allow cookies if needed
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("room:join", (data) => {
    const { email, room } = data;
    console.log(`User with email ${email} joined room ${room}`);
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    socket.join(room);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log(`Call initiated from ${socket.id} to ${to}`);
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    console.log(`Call accepted from ${socket.id} to ${to}`);
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  // End call event
  socket.on("end:call", ({ to }) => {
    console.log(`Ending call from ${socket.id}`);
    io.to(to).emit("call:ended", { from: socket.id });
  });
});

console.log("Signaling server running on http://localhost:3000");
