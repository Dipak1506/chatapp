const { Server } = require("socket.io");

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Maps DB userId (string) → socket.id so we can route call signals
    const userSocketMap = {};

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // ── Room chat ──────────────────────────────────────────────
        socket.on('joinRoom', (room) => {
            socket.join(room);
        });

        socket.on('sendMessage', ({ room, message }) => {
            io.to(room).emit('receiveMessage', message);
        });

        // ── User presence (call routing) ───────────────────────────
        // Client emits this right after login so we can map DB id → socket
        socket.on('registerUser', (userId) => {
            userSocketMap[String(userId)] = socket.id;
            console.log(`User registered: userId=${userId} socketId=${socket.id}`);
        });

        // ── Calling ────────────────────────────────────────────────
        // userToCall is a DB userId (number/string), NOT a socket id
        socket.on('callUser', ({ userToCall, signalData, from, callerName, callType }) => {
            const targetSocket = userSocketMap[String(userToCall)];
            if (targetSocket) {
                io.to(targetSocket).emit('incomingCall', {
                    signal: signalData,
                    from,          // DB userId of caller
                    callerName,
                    callType
                });
            } else {
                // Notify caller the user is offline / not registered
                socket.emit('callUnavailable', { userToCall });
            }
        });

        // data.to is the DB userId of the original caller
        socket.on('answerCall', ({ signal, to }) => {
            const targetSocket = userSocketMap[String(to)];
            if (targetSocket) {
                io.to(targetSocket).emit('callAccepted', signal);
            }
        });

        // data.to is the DB userId of the original caller
        socket.on('rejectCall', ({ to }) => {
            const targetSocket = userSocketMap[String(to)];
            if (targetSocket) {
                io.to(targetSocket).emit('callRejected');
            }
        });

        socket.on('endCall', ({ to }) => {
            const targetSocket = userSocketMap[String(to)];
            if (targetSocket) {
                io.to(targetSocket).emit('callEnded');
            }
        });

        // ── Cleanup ────────────────────────────────────────────────
        socket.on('disconnect', () => {
            // Remove the socket from the registry
            for (const [uid, sid] of Object.entries(userSocketMap)) {
                if (sid === socket.id) {
                    delete userSocketMap[uid];
                    break;
                }
            }
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
}

module.exports = initializeSocket;