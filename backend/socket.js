const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New Connection: ${socket.id}`);

    // Join a specific Quiz Room
    socket.on('joinQuiz', (quizId) => {
      const room = quizId.toUpperCase();
      socket.join(room);
      console.log(`✅ ${socket.id} joined quiz: ${room}`);
    });

    // Admin Room (to receive all events for a quiz)
    socket.on('adminJoin', (quizId) => {
      const room = `ADMIN_${quizId.toUpperCase()}`;
      socket.join(room);
      console.log(`👑 Admin joined quiz room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper: Emit to specific quiz room
const emitToQuiz = (quizId, event, data) => {
  const room = quizId.toUpperCase();
  const io = getIO();
  io.to(room).emit(event, data);
};

// Helper: Emit to admin room only
const emitToAdmin = (quizId, event, data) => {
  const room = `ADMIN_${quizId.toUpperCase()}`;
  const io = getIO();
  io.to(room).emit(event, data);
};

module.exports = { initSocket, getIO, emitToQuiz, emitToAdmin };
