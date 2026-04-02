import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
  }));
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: false
    },
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    path: "/socket.io/"
  });

  const PORT = 3000;

  // API routes
  app.get("/api/config", (req, res) => {
    const appUrl = process.env.APP_URL || "";
    // AI Studio pattern: dev URL has -dev-, shared URL has -pre-
    const guessedSharedUrl = appUrl.replace("-dev-", "-pre-");
    const sharedAppUrl = process.env.SHARED_APP_URL || guessedSharedUrl;
    
    // socketServerUrl should be the shared instance to allow cross-instance play
    const socketServerUrl = process.env.SOCKET_SERVER_URL || sharedAppUrl;
    
    console.log('Config request:', { 
      appUrl, 
      sharedAppUrl, 
      socketServerUrl,
      isGuessed: !process.env.SHARED_APP_URL
    });
    
    res.json({ 
      sharedAppUrl: sharedAppUrl,
      socketServerUrl: socketServerUrl,
      version: "1.6",
      isDev: !process.env.SHARED_APP_URL
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      version: "1.6", 
      rooms: rooms.size,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });

  // Room management
  const rooms = new Map<string, { password?: string; players: string[]; state?: any }>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create_room", ({ roomId, password }: { roomId: string, password?: string }) => {
      if (rooms.has(roomId)) {
        socket.emit("error", "Room already exists");
        return;
      }
      rooms.set(roomId, { password, players: [socket.id] });
      socket.join(roomId);
      socket.emit("room_created", { roomId, role: 'host' });
      console.log(`Room created: ${roomId} by ${socket.id}`);
    });

    socket.on("join_room", ({ roomId, password }: { roomId: string, password?: string }) => {
      console.log(`User ${socket.id} attempting to join room: ${roomId}`);
      console.log('Available rooms:', Array.from(rooms.keys()));
      const room = rooms.get(roomId);
      if (!room) {
        console.warn(`Room not found: ${roomId}`);
        socket.emit("error", "Room not found");
        return;
      }
      if (room.password && room.password !== password) {
        socket.emit("error", "Incorrect room password");
        return;
      }
      if (room.players.length >= 2) {
        socket.emit("error", "Room is full");
        return;
      }

      room.players.push(socket.id);
      socket.join(roomId);
      socket.emit("room_joined", { roomId, role: 'guest' });
      io.to(roomId).emit("player_joined", { playerCount: room.players.length });
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("sync_state", ({ roomId, state }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.state = state;
        socket.to(roomId).emit("state_updated", state);
      }
    });

    socket.on("ping", () => {
      socket.emit("pong", { version: "1.6" });
    });

    socket.on("game_action", ({ roomId, action }) => {
      // The document says: 服务器只把 remote_action 转发给房间里的另一方
      socket.to(roomId).emit("remote_action", action);
    });

    socket.on("leave_room", ({ roomId }: { roomId: string }) => {
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room) {
        room.players = room.players.filter(id => id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit("player_left");
        }
      }
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      rooms.forEach((room, roomId) => {
        if (room.players.includes(socket.id)) {
          room.players = room.players.filter(id => id !== socket.id);
          if (room.players.length === 0) {
            // Wait 30 seconds before deleting empty rooms to allow for refreshes
            setTimeout(() => {
              const currentRoom = rooms.get(roomId);
              if (currentRoom && currentRoom.players.length === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted after grace period`);
              }
            }, 30000);
          } else {
            io.to(roomId).emit("player_left");
          }
        }
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
