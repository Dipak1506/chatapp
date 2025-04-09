const { Server } = require("socket.io");

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    let userInRoom = [];

    io.on("connection", (socket) => {
        console.log(`Socket Id is :  ${socket.id}`);

        socket.on('joinRoom', (room) => {
            socket.join(room);
            // console.log(`User joined room: ${room}`);
        });
    
        
        socket.on('sendMessage', ({ room, message }) => {
            //  console.log('Message received:', message, "room",room); 
            io.emit('receiveMessage', message); 
        });

        socket.on('callUser', ({ userToCall, signalData, from, name }) => {
            io.to(userToCall).emit('callUser', { signal: signalData, from, name });
          });
      
          socket.on('answerCall', (data) => {
            io.to(data.to).emit('callAccepted', data.signal);
          });
    
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
}

module.exports = initializeSocket;
