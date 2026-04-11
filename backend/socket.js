const { Server } = require('socket.io');

let io;

const initSocket = (server, allowedOrigins = ["*"]) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const socketUserMap = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 New Connection: ${socket.id}`);

    // Join a specific Quiz Room
    socket.on('joinQuiz', (data) => {
      // Handle both string (old) and object (new) formats for backward compatibility
      const quizId = (typeof data === 'string' ? data : data.quizId)?.toUpperCase();
      const studentId = typeof data === 'object' ? data.studentId : null;
      
      if (!quizId) return;
      socket.join(quizId);
      
      if (studentId) {
        socketUserMap.set(socket.id, { quizId, studentId });
      }
      
      console.log(`✅ ${socket.id} ${studentId ? `(${studentId})` : ''} joined quiz: ${quizId}`);
    });

    // Admin Room (to receive all events for a quiz)
    socket.on('adminJoin', (quizId) => {
      const room = `ADMIN_${quizId.toUpperCase()}`;
      socket.join(room);
      console.log(`👑 Admin joined quiz room: ${room}`);
    });

    socket.on('disconnect', () => {
      if (socketUserMap.has(socket.id)) {
        const { quizId, studentId } = socketUserMap.get(socket.id);
        io.to(`ADMIN_${quizId}`).emit('participantLeft', { studentId });
        socketUserMap.delete(socket.id);
        console.log(`🚪 Student Left: ${studentId} from ${quizId}`);
      }
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
