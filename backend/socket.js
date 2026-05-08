// const { Server } = require("socket.io");

// function initializeSocket(server) {
//     const io = new Server(server, {
//         cors: {
//             origin: "http://localhost:3000",
//             methods: ["GET", "POST"],
//             credentials: true
//         }
//     });

//     const userSocketMap = {};

//     io.on("connection", (socket) => {
//         console.log(`Socket connected: ${socket.id}`);

//         // ── Room chat ──────────────────────────────────────────────
//         socket.on('joinRoom', (room) => {
//             socket.join(room);
//         });

//         socket.on('sendMessage', ({ room, message }) => {
//             io.to(room).emit('receiveMessage', message);
//         });

//         // ── User presence (call routing) ───────────────────────────
        
//         socket.on('registerUser', (userId) => {
//             userSocketMap[String(userId)] = socket.id;
//             // console.log(`User registered: userId=${userId} socketId=${socket.id}`);
//         });

//         // ── Calling ────────────────────────────────────────────────
        
//         socket.on('callUser', ({ userToCall, signalData, from, callerName, callType }) => {
//             const targetSocket = userSocketMap[String(userToCall)];
//             if (targetSocket) {
//                 io.to(targetSocket).emit('incomingCall', {
//                     signal: signalData,
//                     from,          
//                     callerName,
//                     callType
//                 });
//             } else {
//                 socket.emit('callUnavailable', { userToCall });
//             }
//         });

//         // data.to is the DB userId of the original caller
//         socket.on('answerCall', ({ signal, to }) => {
//             const targetSocket = userSocketMap[String(to)];
//             if (targetSocket) {
//                 io.to(targetSocket).emit('callAccepted', signal);
//             }
//         });

//         socket.on('rejectCall', ({ to }) => {
//             const targetSocket = userSocketMap[String(to)];
//             if (targetSocket) {
//                 io.to(targetSocket).emit('callRejected');
//             }
//         });

//         socket.on('endCall', ({ to }) => {
//             const targetSocket = userSocketMap[String(to)];
//             if (targetSocket) {
//                 io.to(targetSocket).emit('callEnded');
//             }
//         });

//         // ── Cleanup ────────────────────────────────────────────────
//         socket.on('disconnect', () => {
//             for (const [uid, sid] of Object.entries(userSocketMap)) {
//                 if (sid === socket.id) {
//                     delete userSocketMap[uid];
//                     break;
//                 }
//             }
//             console.log(`Socket disconnected: ${socket.id}`);
//         });
//     });

//     return io;
// }

// module.exports = initializeSocket;

// socket.js  (add the leaveRoom handler — everything else stays the same)
const initializeSocket = (server) => {
    const { Server } = require('socket.io');
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // userId → socketId map for peer-to-peer calls
    const userSocketMap = {};

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('registerUser', (userId) => {
            userSocketMap[userId] = socket.id;
        });

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`${socket.id} joined room: ${room}`);
        });

        // FIX: Without this handler the client stays subscribed to every room it
        // ever joined.  Switching conversations now emits leaveRoom so the server
        // stops broadcasting that room's messages to this socket.
        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log(`${socket.id} left room: ${room}`);
        });

        socket.on('sendMessage', ({ room, message }) => {
            // Broadcast to everyone in the room (including sender for echo-back)
            io.to(room).emit('receiveMessage', message);
        });

        // ── WebRTC signalling ──────────────────────────────────────────────
        socket.on('callUser', ({ userToCall, signalData, from, callerName, callType }) => {
            const targetSocketId = userSocketMap[userToCall];
            if (targetSocketId) {
                io.to(targetSocketId).emit('incomingCall', { signal: signalData, from, callerName, callType });
            } else {
                socket.emit('callUnavailable');
            }
        });

        socket.on('answerCall', ({ signal, to }) => {
            const targetSocketId = userSocketMap[to];
            if (targetSocketId) io.to(targetSocketId).emit('callAccepted', signal);
        });

        socket.on('rejectCall', ({ to }) => {
            const targetSocketId = userSocketMap[to];
            if (targetSocketId) io.to(targetSocketId).emit('callRejected');
        });

        socket.on('endCall', ({ to }) => {
            const targetSocketId = userSocketMap[to];
            if (targetSocketId) io.to(targetSocketId).emit('callEnded');
        });

        socket.on('disconnect', () => {
            // Clean up the userId → socketId map
            for (const [uid, sid] of Object.entries(userSocketMap)) {
                if (sid === socket.id) { delete userSocketMap[uid]; break; }
            }
            console.log('Socket disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = initializeSocket;