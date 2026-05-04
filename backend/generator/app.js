require('dotenv').config(); 

const express = require('express');
const PORT = process.env.PORT;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const server = require('http').createServer(app);
const passport = require('passport');
const passportRoute = require('./passport');
const session = require('express-session');
const initializeSocket = require('./socket');


app.use(cors({
  origin: 'http://localhost:3000', 
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}));


app.use(session({
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 1000 * 60 * 60 
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.use('/uploads', express.static('uploads'))

const io = initializeSocket(server);


const signInApi = require("./api/signin");
app.use("/signin", signInApi);

const signUpApi = require("./api/signup");
app.use("/signup", signUpApi);

const authRoute = require("./api/auth");
app.use("/auth", authRoute);

const getUsersRoute = require("./api/getUsers");
app.use("/getusers", getUsersRoute);

const createRoomRoute = require("./api/createRoom");
app.use("/createroom", createRoomRoute);

const getRoomsRoute = require("./api/getRooms");
app.use("/getrooms", getRoomsRoute);

const saveMessagesRoute = require("./api/setMessages");
app.use("/savemessages", saveMessagesRoute);

const getMessagesRoute = require("./api/getMessages");
app.use("/getmessages",getMessagesRoute);

const uploadRoute = require("./api/upload");
app.use("/upload", uploadRoute);

const groupChatRoute = require("./api/getGroups");
app.use("/getGroupChats", groupChatRoute);

const createGroupsRoute = require("./api/createGroups");
app.use("/createGroups", createGroupsRoute);

const updateGroupNameRoute = require("./api/updateGroupName");
app.use("/updatename", updateGroupNameRoute);

const lastMsgRoute = require("./api/lastMessage");
app.use("/lastMessages", lastMsgRoute);

const markAsreadRoute = require("./api/markAsRead");
app.use("/markAsRead", markAsreadRoute);
 
app.get("/welcome", async (req, res, next) => {
  res.json({
    message: "welcome",
    status: 200,
  })
});

server.listen(PORT, () => {
  console.log(`Express Server listening on ${PORT}`);
});

module.exports = app;
